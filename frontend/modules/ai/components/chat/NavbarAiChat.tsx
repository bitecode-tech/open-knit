import '@nlux/themes/nova.css';
import {AiChat, ResponseRendererProps, useAiChatApi, useAsBatchAdapter} from '@nlux/react';
import React, {useEffect, useRef} from 'react';
import AuthService from "@identity/auth/services/AuthService.ts";
import {adminBaseConfig} from "@common/config/AxiosConfig.ts";
import {exportToCsv} from "@common/utils/CsvUtils.ts";
import {CloseCircle} from "flowbite-react-icons/outline";

export interface UserPromptResponse {
    dataset?: Array<Record<string, unknown>>;
    humanAnswer?: string;
    error?: string;
}

const axios = AuthService.createAuthenticatedClientInstance(adminBaseConfig, "/ai");

export default function AiChatModal({
                                        initialPrompt,
                                        open,
                                        onClose,
                                    }: {
    initialPrompt?: string;
    open: boolean;
    onClose: () => void;
}) {
    const adapter = useAsBatchAdapter(send);
    const api = useAiChatApi();
    const hasSentInitial = useRef(false);

    useEffect(() => {
        if (open && initialPrompt && api.composer && !hasSentInitial.current) {
            hasSentInitial.current = true;
            setTimeout(() => {
                api.composer.send(initialPrompt);
            }, 50);
        }
        if (!open) {
            hasSentInitial.current = false;
        }
    }, [open, initialPrompt, api.composer]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-gray-900/80 to-gray-700/80">
            <div className="relative w-full max-w-2xl h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <CloseCircle className="absolute top-1.5 right-1.5 transition-opacity opacity-60 z-[9999999] hover:text-red-700 cursor-pointer" onClick={onClose}/>
                <div className="flex-1 flex flex-col">
                    <AiChat<UserPromptResponse>
                        api={api}
                        adapter={adapter}
                        composerOptions={{
                            placeholder: "Type your message...",
                            autoFocus: true,
                        }}
                        conversationOptions={{
                            layout: "bubbles",
                            historyPayloadSize: "max",
                            showWelcomeMessage: false,
                        }}
                        messageOptions={{
                            skipStreamingAnimation: false,
                            streamingAnimationSpeed: 15,
                            showCodeBlockCopyButton: true,
                            responseRenderer: DatasetResponseRenderer
                        }}
                        displayOptions={{
                            themeId: "nova",
                            colorScheme: "light",
                            height: "100%",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

async function send(prompt: string) {
    const response = await axios.post(`/chat?prompt=${encodeURIComponent(prompt)}`);
    const data: UserPromptResponse = await response.data;
    return data;
}

const DatasetResponseRenderer: React.FC<ResponseRendererProps<UserPromptResponse>> = ({content}) => {
    const {error, dataset, humanAnswer} = content[0];

    if (error) {
        return <div>{error}</div>;
    } else if (humanAnswer) {
        return <div>{humanAnswer}</div>;
    } else if (dataset) {
        const columns = Object.keys(dataset[0] ?? {});
        const rows = dataset.slice(0, 2);
        return (
            <div className="bg-gray-100 p-4 rounded-md shadow-md text-sm">
                <div className="mb-2 font-medium">Dataset Preview:</div>
                <div className="overflow-x-auto max-w-full mb-2">
                    <table className="text-xs border w-full">
                        <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col} className="border px-2 py-1 bg-gray-200">{col}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((row: any, i: number) => (
                            <tr key={i}>
                                {columns.map(col => (
                                    <td key={col} className="border px-2 py-1">{row[col]?.toString() ?? ""}</td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <button
                    onClick={() => exportToCsv(dataset, columns, 'export.csv')}
                    className="inline-block bg-primary-500 text-white rounded px-3 py-1 text-xs hover:bg-primary-700 cursor-pointer"
                >
                    Download CSV
                </button>
            </div>
        );
    }
    return <div>Error, please try again later</div>;
};