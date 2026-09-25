import {useCallback, useEffect, useState} from "react";
import GenericLinkButton from "@app/components/GenericLinkButton";
import {bundleModules, configurationOptions, lockedModuleIds, moduleIdToBackendName, systemOptionsByConfiguration} from "@app/pages/index/data";
import {DiscordIcon, GithubIcon} from "@app/pages/index/components/Icons";
import ConfigurationSection from "@app/pages/index/components/ConfigurationSection";
import ProjectMetadataSection from "@app/pages/index/components/ProjectMetadataSection";
import SelectorSection from "@app/pages/index/components/SelectorSection";
import ErrorModal from "@app/pages/index/components/ErrorModal";
import ReadySystemsModal from "@app/pages/index/components/ReadySystemsModal";
import SuccessModal from "@app/pages/index/components/SuccessModal";
import {useErrorModal} from "@app/pages/index/hooks/useErrorModal";
import {useReadySystemsModal} from "@app/pages/index/hooks/useReadySystemsModal";
import HttpClient from "@app/clients/HttpClient";
import type {ProjectSpec, TargetPlatform} from "@app/types/ProjectSpec";

function getBrowserPlatformSuggestion(): TargetPlatform | null {
    const browserPlatform = navigator.platform.toLowerCase();
    if (browserPlatform.startsWith("win")) {
        return "windows";
    }
    if (browserPlatform.includes("mac") || browserPlatform.includes("iphone") || browserPlatform.includes("ipad")) {
        return "macos";
    }
    if (browserPlatform.includes("linux")) {
        return "linux";
    }
    return null;
}

export default function Page() {
    const [projectName, setProjectName] = useState("my-application");
    const [targetPlatform, setTargetPlatform] = useState<TargetPlatform | "">("");
    const [suggestedTargetPlatform, setSuggestedTargetPlatform] = useState<TargetPlatform | null>(null);
    const [targetPlatformConfirmed, setTargetPlatformConfirmed] = useState(false);
    const [demoInsertsEnabled, setDemoInsertsEnabled] = useState(true);
    const [selectedConfiguration, setSelectedConfiguration] = useState<string | null>(null);
    const [selectedSystemIds, setSelectedSystemIds] = useState<Set<string>>(new Set());
    const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
    const [unselectedOrder, setUnselectedOrder] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const errorModal = useErrorModal();
    const getSelectedSystemId = useCallback((): string | null => {
        const selectedIds = Array.from(selectedSystemIds);
        return selectedIds[0] ?? null;
    }, [selectedSystemIds]);
    const submitReadySystemsWishlist = useCallback(
        async (email: string) => {
            const selectedSystemId = getSelectedSystemId();
            if (!selectedSystemId) {
                throw new Error("Missing selected ready system");
            }

            await HttpClient.subscribeWishlist({
                email,
                systemName: selectedSystemId
            });
        },
        [getSelectedSystemId]
    );
    const readySystemsModal = useReadySystemsModal(
        () => setSelectedConfiguration("bundles"),
        submitReadySystemsWishlist,
        errorModal.open
    );
    const isTargetPlatformRequired = selectedConfiguration !== "ready-systems";
    const isGenerateDisabled = selectedSystemIds.size === 0 || (
        isTargetPlatformRequired && (!targetPlatform || !targetPlatformConfirmed)
    );
    const systemOptions = selectedConfiguration
        ? systemOptionsByConfiguration[selectedConfiguration] ?? []
        : [];
    const showSystems = Boolean(selectedConfiguration);
    const isMultiSelect = selectedConfiguration === "modules";
    const lockedIds = new Set(selectedConfiguration === "modules" ? lockedModuleIds : []);
    const systemsTitle =
        selectedConfiguration === "bundles"
            ? "Choose bundle"
            : selectedConfiguration === "ready-systems"
                ? "Choose ready system"
                : "Choose modules";

    useEffect(() => {
        const platformSuggestion = getBrowserPlatformSuggestion();
        setSuggestedTargetPlatform(platformSuggestion);
        if (platformSuggestion) {
            setTargetPlatform(platformSuggestion);
        }
    }, []);

    useEffect(() => {
        if (!selectedConfiguration) {
            setSelectedOrder([]);
            setUnselectedOrder([]);
            setSelectedSystemIds(new Set());
            errorModal.close();
            setIsSuccessModalOpen(false);
            return;
        }
        const nextOptions = systemOptionsByConfiguration[selectedConfiguration] ?? [];
        if (selectedConfiguration === "modules") {
            const locked = lockedModuleIds.filter((id) => nextOptions.some((option) => option.id === id));
            setSelectedOrder(locked);
            setSelectedSystemIds(new Set(locked));
            setUnselectedOrder(nextOptions.map((option) => option.id).filter((id) => !locked.includes(id)));
            return;
        }
        setSelectedOrder([]);
        setUnselectedOrder(nextOptions.map((option) => option.id));
        setSelectedSystemIds(new Set());
    }, [selectedConfiguration]);

    const optionById = new Map(systemOptions.map((option) => [option.id, option]));
    const isChoiceOption = (option: typeof systemOptions[number] | undefined): option is typeof systemOptions[number] =>
        Boolean(option);
    const selectedOptions = selectedOrder.map((id) => optionById.get(id)).filter(isChoiceOption);
    const unselectedOptions = unselectedOrder.map((id) => optionById.get(id)).filter(isChoiceOption);

    const resolveModulesForDownload = (): string[] => {
        if (!selectedConfiguration) {
            return [];
        }
        if (selectedConfiguration === "bundles") {
            const bundleId = getSelectedSystemId();
            if (!bundleId) {
                return [];
            }
            return bundleModules[bundleId] ?? [];
        }
        if (selectedConfiguration === "modules") {
            return Array.from(selectedSystemIds)
                .map((id) => moduleIdToBackendName[id])
                .filter((moduleName): moduleName is string => Boolean(moduleName));
        }
        return [];
    };

    const resolveCounterName = (): string | undefined => {
        if (selectedConfiguration === "bundles") {
            const bundleId = getSelectedSystemId();
            if (!bundleId) {
                return undefined;
            }
            return bundleId;
        }
        return undefined;
    };

    const handleGenerate = async () => {
        if (isGenerateDisabled || isDownloading) {
            return;
        }
        errorModal.close();
        setIsSuccessModalOpen(false);

        if (selectedConfiguration === "ready-systems") {
            readySystemsModal.open();
            return;
        }

        const modules = resolveModulesForDownload();
        if (modules.length === 0) {
            errorModal.open();
            return;
        }
        if (!targetPlatform || !targetPlatformConfirmed) {
            errorModal.open();
            return;
        }

        setIsDownloading(true);
        try {
            const selectedTemplateId = selectedConfiguration === "bundles" ? getSelectedSystemId() : null;
            const projectSpec: ProjectSpec = {
                schemaVersion: 1,
                projectName: projectName.trim(),
                modules,
                targetPlatform,
                demoInsertsEnabled,
                ...(selectedTemplateId ? {templateId: selectedTemplateId} : {})
            };
            const {blob, fileName} = await HttpClient.downloadScaffold({
                projectSpec,
                counterName: resolveCounterName()
            });
            const downloadUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = downloadUrl;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setIsSuccessModalOpen(true);
            window.setTimeout(() => {
                window.URL.revokeObjectURL(downloadUrl);
            }, 30000);
        } catch (error) {
            errorModal.open(error instanceof Error ? error.message : undefined);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center w-full min-h-0 px-4 pt-6 md:px-0 md:pt-4 md:overflow-hidden">
            <div className="flex flex-col items-start w-full max-w-[1333px] gap-8 md:gap-10 flex-1 min-h-0">
                <header className="flex flex-col gap-2 items-start max-w-[500px]" id="configurator">
                    <h1>Compose your app in few clicks</h1>
                    <p className="font-normal text-[var(--text-body)]">
                        Pick the parts you need and download a ready-made fullstack (Java-Spring + React + Vite) app.
                    </p>
                    <GenericLinkButton href="/about" variant="secondary">
                        If you want to understand more, click here
                    </GenericLinkButton>
                </header>

                <section className="config-grid w-full flex-1 min-h-0">
                    <ProjectMetadataSection
                        projectName={projectName}
                        onProjectNameChange={setProjectName}
                        targetPlatform={targetPlatform}
                        suggestedTargetPlatform={suggestedTargetPlatform}
                        onTargetPlatformChange={setTargetPlatform}
                        targetPlatformConfirmed={targetPlatformConfirmed}
                        onTargetPlatformConfirmedChange={setTargetPlatformConfirmed}
                        demoInsertsEnabled={demoInsertsEnabled}
                        onDemoInsertsChange={setDemoInsertsEnabled}
                    />
                    <ConfigurationSection
                        options={configurationOptions}
                        selectedBundle={selectedConfiguration ?? ""}
                        onSelectBundle={(value) => {
                            setSelectedConfiguration(value);
                        }}
                    />
                    <div
                        className={`transition-all duration-200 ease-out overflow-hidden w-full ${
                            showSystems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                        }`}
                    >
                        {showSystems ? (
                            <SelectorSection
                                isMultiSelect={isMultiSelect}
                                title={systemsTitle}
                                subtitle={
                                    selectedConfiguration === "modules"
                                        ? "Choose your building blocks"
                                        : selectedConfiguration === "ready-systems"
                                            ? "Pick a ready-made system"
                                            : "Pick a bundle to get started"
                                }
                                options={systemOptions}
                                selectedOptions={selectedOptions}
                                unselectedOptions={unselectedOptions}
                                selectedIds={selectedSystemIds}
                                lockedIds={lockedIds}
                                onSelectSystem={(value) => {
                                    if (isMultiSelect) {
                                        if (lockedIds.has(value)) {
                                            return;
                                        }
                                        setSelectedSystemIds((current) => {
                                            const next = new Set(current);
                                            if (next.has(value)) {
                                                next.delete(value);
                                                setSelectedOrder((currentOrder) => currentOrder.filter((id) => id !== value));
                                                setUnselectedOrder((currentOrder) => [
                                                    ...currentOrder.filter((id) => id !== value),
                                                    value
                                                ]);
                                                return next;
                                            }
                                            next.add(value);
                                            setSelectedOrder((currentOrder) => [...currentOrder.filter((id) => id !== value), value]);
                                            setUnselectedOrder((currentOrder) => currentOrder.filter((id) => id !== value));
                                            return next;
                                        });
                                        return;
                                    }
                                    setSelectedSystemIds(new Set([value]));
                                }}
                            />
                        ) : null}
                    </div>
                </section>
            </div>

            <footer className="relative bg-[var(--surface-subtle)] w-full mt-auto">
                <div className="flex items-center justify-center h-[82px] px-20">
                    <div className="flex gap-2.5 items-center justify-center w-full flex-wrap">
                        <div className="flex flex-1 items-center justify-center">
                            <button
                                type="button"
                                className={`w-[361px] h-[42px] rounded-[var(--radius)] flex items-center justify-center px-5 py-2.5 font-medium text-white transition-colors ${
                                    isGenerateDisabled || isDownloading
                                        ? "cursor-not-allowed bg-[var(--primary-disabled)]"
                                        : "cursor-pointer bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
                                }`}
                                disabled={isGenerateDisabled || isDownloading}
                                onClick={handleGenerate}
                            >
                                {isDownloading ? <span className="spinner" aria-label="Loading"/> : "Generate"}
                            </button>
                        </div>
                        <div className="flex gap-4 items-center justify-end">
                            <a
                                href="https://github.com/bitecode-tech/open-knit"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="GitHub"
                                className="cursor-pointer text-[var(--text-strong)]"
                            >
                                <GithubIcon className="h-6 w-6"/>
                            </a>
                            <a
                                href="https://discord.gg/XAAjcAFhUn"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Discord"
                                className="cursor-pointer text-[var(--text-strong)]"
                            >
                                <DiscordIcon className="h-6 w-6"/>
                            </a>
                        </div>
                    </div>
                </div>
                <span className="absolute bottom-2 left-4 text-xs text-[var(--text-muted)]" aria-label={`Scaffolder version ${__SCAFFOLDER_VERSION__}`}>
                    v{__SCAFFOLDER_VERSION__}
                </span>
            </footer>
            <ErrorModal isOpen={errorModal.isOpen} message={errorModal.message} onClose={errorModal.close}/>
            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => {
                    setIsSuccessModalOpen(false);
                }}
            />
            <ReadySystemsModal
                isOpen={readySystemsModal.isOpen}
                email={readySystemsModal.email}
                onEmailChange={readySystemsModal.setEmail}
                emailIsValid={readySystemsModal.emailIsValid}
                isPending={readySystemsModal.isPending}
                onClose={readySystemsModal.close}
                onSubmit={() => {
                    void readySystemsModal.submit();
                }}
            />
        </div>
    );
}
