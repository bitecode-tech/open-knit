import {useCallback, useEffect, useState} from "react";
import {bundleModules, configurationOptions, lockedModuleIds, moduleIdToBackendName, systemOptionsByConfiguration} from "@app/pages/index/data";
import {DiscordIcon, GithubIcon} from "@app/pages/index/components/Icons";
import ConfigurationSection from "@app/pages/index/components/ConfigurationSection";
import ProjectMetadataSection from "@app/pages/index/components/ProjectMetadataSection";
import SelectorSection from "@app/pages/index/components/SelectorSection";
import ErrorModal from "@app/pages/index/components/ErrorModal";
import ReadySystemsModal from "@app/pages/index/components/ReadySystemsModal";
import {useErrorModal} from "@app/pages/index/hooks/useErrorModal";
import {useReadySystemsModal} from "@app/pages/index/hooks/useReadySystemsModal";
import HttpClient from "@app/clients/HttpClient";

export default function Page() {
    const [projectName, setProjectName] = useState("my-application");
    const [demoInsertsEnabled, setDemoInsertsEnabled] = useState(true);
    const [selectedConfiguration, setSelectedConfiguration] = useState<string | null>(null);
    const [selectedSystemIds, setSelectedSystemIds] = useState<Set<string>>(new Set());
    const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
    const [unselectedOrder, setUnselectedOrder] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
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
    const isGenerateDisabled = selectedSystemIds.size === 0;
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
        if (!selectedConfiguration) {
            setSelectedOrder([]);
            setUnselectedOrder([]);
            setSelectedSystemIds(new Set());
            errorModal.close();
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

        if (selectedConfiguration === "ready-systems") {
            readySystemsModal.open();
            return;
        }

        const modules = resolveModulesForDownload();
        if (modules.length === 0) {
            errorModal.open();
            return;
        }

        setIsDownloading(true);
        try {
            const {blob, fileName} = await HttpClient.downloadScaffold({
                name: projectName,
                modules,
                demoInsertsEnabled,
                aiEnabled: false,
                counterName: resolveCounterName()
            });
            const downloadUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = downloadUrl;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => {
                window.URL.revokeObjectURL(downloadUrl);
            }, 30000);
        } catch {
            errorModal.open();
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="bg-[#f2f2f2] min-h-screen md:h-[100dvh] flex flex-col items-center pt-12 md:overflow-hidden">
            <div className="flex flex-col items-start w-full max-w-[1333px] px-4 md:px-0 gap-12 flex-1 min-h-0">
                <header className="flex flex-col gap-2 items-start max-w-[500px]">
                    <p className="text-2xl font-normal uppercase tracking-[0.08em]" style={{color: "#374252"}}>
                        Module builder
                    </p>
                    <h1>Compose your app in few clicks</h1>
                    <p className="font-normal" style={{color: "#374252"}}>
                        Pick the parts you need and download a ready-made fullstack (Java-Spring + React + Vite) app.
                    </p>
                </header>

                <section className="config-grid w-full flex-1 min-h-0">
                    <ProjectMetadataSection
                        projectName={projectName}
                        onProjectNameChange={setProjectName}
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

            <footer className="bg-[#ebeeff] w-full mt-auto">
                <div className="flex items-center justify-center h-[82px] px-20">
                    <div className="flex gap-2.5 items-center justify-center w-full flex-wrap">
                        <div className="flex flex-1 items-center justify-center">
                            <button
                                type="button"
                                className={`w-[361px] h-[42px] rounded-[var(--radius)] flex items-center justify-center px-5 py-2.5 font-medium text-white transition-colors ${
                                    isGenerateDisabled || isDownloading
                                        ? "cursor-not-allowed bg-[#a5a7f4]"
                                        : "cursor-pointer bg-[var(--primary)] hover:bg-[#6d6ff0]"
                                }`}
                                disabled={isGenerateDisabled || isDownloading}
                                onClick={handleGenerate}
                            >
                                {isDownloading ? <span className="spinner" aria-label="Loading"/> : "Generate"}
                            </button>
                        </div>
                        <div className="flex gap-4 items-center justify-end">
                            <button type="button" aria-label="GitHub" className="cursor-pointer">
                                <GithubIcon/>
                            </button>
                            <button type="button" aria-label="Discord" className="cursor-pointer">
                                <DiscordIcon/>
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
            <ErrorModal isOpen={errorModal.isOpen} onClose={errorModal.close}/>
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
