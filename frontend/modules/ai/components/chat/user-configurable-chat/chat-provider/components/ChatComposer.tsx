import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import clsx from "clsx";
import {ChevronDoubleDown, ChevronDoubleUp, Microphone, Plus} from "flowbite-react-icons/outline";
import type {AttachmentItem} from "@ai/components/chat/user-configurable-chat/chat-provider/types.ts";
import {formatDuration, formatFileSize} from "@ai/components/chat/user-configurable-chat/chat-provider/utils/format.ts";
import {useAutoGrow} from "@ai/components/chat/user-configurable-chat/chat-provider/hooks/useAutoGrow.ts";

export interface ChatComposerProps {
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
    disabled?: boolean;
    placeholder?: string;
    showToggle?: boolean;
    collapsed?: boolean;
    onToggle?: () => void;
    attachments: AttachmentItem[];
    onFilesSelected?: (files: FileList | File[]) => void;
    onAttachmentRemove?: (id: string) => void;
    fileUploadEnabled: boolean;
    onRecordingComplete?: (file: File, durationMs: number) => void;
    recordingEnabled: boolean;
    isTranscribing: boolean;
}

export default function ChatComposer({
                                         value,
                                         onChange,
                                         onSend,
                                         disabled,
                                         onToggle,
                                         collapsed,
                                         showToggle,
                                         placeholder,
                                         attachments,
                                         onFilesSelected,
                                         onAttachmentRemove,
                                         fileUploadEnabled,
                                         onRecordingComplete,
                                         recordingEnabled,
                                         isTranscribing,
                                     }: ChatComposerProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<number | null>(null);
    const recordingStartRef = useRef<number | null>(null);
    const cancelRecordingRef = useRef(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [recordingError, setRecordingError] = useState<string | null>(null);
    const recordingSupported = useMemo(() => {
        if (typeof window === "undefined" || typeof navigator === "undefined") {
            return false;
        }
        const hasGetUserMedia = typeof navigator.mediaDevices?.getUserMedia === "function";
        return typeof window.MediaRecorder !== "undefined" && hasGetUserMedia;
    }, []);
    const canRecord = recordingEnabled && recordingSupported && typeof navigator !== "undefined";
    const inputLocked = isRecording || isTranscribing;
    const attachmentsEnabled = fileUploadEnabled && !inputLocked && !disabled;
    const sendDisabled = disabled || inputLocked || (value.trim().length === 0 && attachments.length === 0);

    useEffect(() => {
        if (!attachmentsEnabled && isDragging) {
            setIsDragging(false);
        }
    }, [attachmentsEnabled, isDragging]);
    useAutoGrow(inputRef, value);

    const stopRecordingTimer = useCallback(() => {
        if (recordingTimerRef.current) {
            window.clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
    }, []);

    const finalizeRecording = useCallback((cancel: boolean) => {
        stopRecordingTimer();
        const endedAt = Date.now();
        const startedAt = recordingStartRef.current;
        const durationMs = startedAt ? Math.max(0, endedAt - startedAt) : recordingSeconds * 1000;
        recordingStartRef.current = null;

        const stream = mediaStreamRef.current;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        const recorderMimeType = mediaRecorderRef.current?.mimeType;
        mediaRecorderRef.current = null;

        const blobType = recorderMimeType && recorderMimeType !== ""
            ? recorderMimeType
            : (chunksRef.current[0]?.type || "audio/webm");
        const blob = new Blob(chunksRef.current, {type: blobType});
        chunksRef.current = [];

        if (cancel || blob.size === 0) {
            setRecordingSeconds(0);
            return;
        }

        const extension = (blob.type?.split("/")[1] ?? "webm").split(";")[0];
        const fileName = `voice-message-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`;
        const file = new File([blob], fileName, {type: blob.type || "audio/webm"});
        setRecordingSeconds(0);
        onRecordingComplete?.(file, durationMs);
    }, [onRecordingComplete, recordingSeconds, stopRecordingTimer]);

    const stopRecording = useCallback((cancel = false) => {
        cancelRecordingRef.current = cancel;
        if (!isRecording && !mediaRecorderRef.current) {
            return;
        }
        setIsRecording(false);
        stopRecordingTimer();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        } else {
            finalizeRecording(cancel);
            cancelRecordingRef.current = false;
        }
    }, [finalizeRecording, isRecording, stopRecordingTimer]);

    const startRecording = useCallback(async () => {
        if (!canRecord || isRecording) {
            return;
        }
        setRecordingError(null);
        cancelRecordingRef.current = false;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            mediaStreamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];
            recorder.addEventListener("dataavailable", (event: BlobEvent) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            });
            recorder.addEventListener("stop", () => {
                const shouldCancel = cancelRecordingRef.current;
                cancelRecordingRef.current = false;
                finalizeRecording(shouldCancel);
            });
            mediaRecorderRef.current = recorder;
            recordingStartRef.current = Date.now();
            setRecordingSeconds(0);
            setIsRecording(true);
            recorder.start();
            stopRecordingTimer();
            recordingTimerRef.current = window.setInterval(() => {
                if (!recordingStartRef.current) {
                    return;
                }
                const elapsed = Math.floor((Date.now() - recordingStartRef.current) / 1000);
                setRecordingSeconds(elapsed);
            }, 1000);
        } catch (error) {
            console.error("Failed to start recording", error);
            setIsRecording(false);
            setRecordingError("Unable to access microphone");
            mediaStreamRef.current?.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    }, [canRecord, finalizeRecording, isRecording, stopRecordingTimer]);

    const stopRecordingRef = useRef(stopRecording);
    useEffect(() => {
        stopRecordingRef.current = stopRecording;
    }, [stopRecording]);

    useEffect(() => {
        return () => {
            stopRecordingRef.current(true);
        };
    }, []);

    useEffect(() => {
        if (!recordingEnabled && isRecording) {
            stopRecording(true);
        }
    }, [recordingEnabled, isRecording, stopRecording]);

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    }

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!attachmentsEnabled) return;
        const files = event.target.files;
        if (files && files.length > 0) {
            onFilesSelected?.(files);
        }
        event.target.value = "";
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        if (!attachmentsEnabled) return;
        event.preventDefault();
        setIsDragging(false);
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            onFilesSelected?.(files);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        if (!attachmentsEnabled) return;
        event.preventDefault();
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        if (!attachmentsEnabled) return;
        if (event.currentTarget === event.target) {
            setIsDragging(false);
        }
    };

    const isToggleButtonVisible = !showToggle && !collapsed;

    return (
        <div className="pb-4 flex-shrink-0">
            {showToggle && (
                <button
                    onClick={onToggle}
                    className="inline-flex items-center text-sm rounded rounded-b-none text-white font-new-spirit bg-oxford-blue cursor-pointer hover-bg-mandarine"
                >
                    {collapsed ? <ChevronDoubleDown/> : <ChevronDoubleUp/>}
                </button>
            )}
            <div
                className={clsx(
                    "border border-oxford-blue px-3 py-2 -mt-[7px] bg-white transition-colors",
                    isToggleButtonVisible ? "rounded-2xl" : "rounded-b-2xl rounded-tr-2xl",
                    attachmentsEnabled && isDragging && "border-dashed border-mandarine bg-orange-50/40"
                )}
                onDragEnter={attachmentsEnabled ? handleDragOver : undefined}
                onDragOver={attachmentsEnabled ? handleDragOver : undefined}
                onDragLeave={attachmentsEnabled ? handleDragLeave : undefined}
                onDrop={attachmentsEnabled ? handleDrop : undefined}
            >
                {fileUploadEnabled && attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {attachments.map(({id, file}) => (
                            <div key={id}
                                 className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                <span className="truncate max-w-[140px]" title={file.name}>{file.name}</span>
                                <span className="text-[10px] text-gray-500">{formatFileSize(file.size)}</span>
                                <button
                                    type="button"
                                    onClick={() => onAttachmentRemove?.(id)}
                                    className="text-gray-500 hover-text-red-600 cursor-pointer"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {isTranscribing && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                        <span className="inline-block h-3 w-3 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" aria-hidden="true"/>
                        <span>Transcribing voice message…</span>
                    </div>
                )}

                <div className="flex items-end gap-2">
                    {fileUploadEnabled && (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileInputChange}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (!attachmentsEnabled) return;
                                    fileInputRef.current?.click();
                                }}
                                disabled={!attachmentsEnabled}
                                className={clsx(
                                    "size-8 flex items-center rounded-full justify-center transition",
                                    attachmentsEnabled
                                        ? "text-oxford-blue hover:bg-oxford-blue hover:text-white cursor-pointer"
                                        : "text-gray-300 cursor-not-allowed"
                                )}
                                aria-label="Add attachment"
                            >
                                <Plus size={28}/>
                            </button>
                        </>
                    )}

                    {isRecording && (
                        <div className="flex items-center self-center gap-1 pl-1 pr-2 pt-1.5 text-sm font-semibold text-red-600 shrink-0">
                            <span className="recording-indicator" aria-hidden="true"/>
                            <span>{formatDuration(Math.max(recordingSeconds, 0) * 1000)}</span>
                        </div>
                    )}

                    <textarea
                        ref={inputRef}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        rows={1}
                        disabled={inputLocked}
                        className={clsx(
                            "flex-1 resize-none bg-transparent outline-none ring-0 border-0 px-2 py-1 text-sm placeholder-gray-500",
                            inputLocked && "opacity-70 cursor-not-allowed"
                        )}
                    />

                    {canRecord && (
                        <button
                            type="button"
                            onClick={() => {
                                if (isRecording) {
                                    stopRecording(false);
                                } else if (!isTranscribing && !disabled) {
                                    void startRecording();
                                }
                            }}
                            disabled={(isTranscribing && !isRecording) || (disabled && !isRecording)}
                            className={clsx(
                                "size-8 flex items-center justify-center rounded-full transition mr-2",
                                isRecording
                                    ? "bg-red-500 text-white shadow-sm"
                                    : (isTranscribing || disabled)
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-oxford-blue hover:bg-oxford-blue hover:text-white cursor-pointer"
                            )}
                            aria-label={isRecording ? "Stop recording" : "Start recording"}
                        >
                            <Microphone size={24}/>
                        </button>
                    )}

                    <button
                        onClick={() => onSend()}
                        disabled={sendDisabled}
                        className={`shrink-0 size-9 rounded-full bg-oxford-blue text-white disabled:opacity-40
                  flex items-center justify-center cursor-pointer disabled:cursor-auto
                  ${!sendDisabled && "hover-bg-mandarine"} focus:outline-none transition duration-100`}
                        aria-label="Send message"
                    >
                        <span className="text-2xl font-new-spirit leading-none">↑</span>
                    </button>
                </div>
                {recordingError && (
                    <p className="mt-2 text-xs text-red-600">{recordingError}</p>
                )}
                {fileUploadEnabled && isDragging && (
                    <p className="mt-2 text-center text-xs text-gray-500">Drop files to attach</p>
                )}
            </div>
        </div>
    );
}
