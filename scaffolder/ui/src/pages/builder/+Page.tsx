import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {bundleModules, configurationOptions, lockedModuleIds, moduleIdToBackendName, systemOptionsByConfiguration} from "@app/pages/index/data";
import {DiscordIcon, GithubIcon} from "@app/pages/index/components/Icons";
import FoundationStack from "@app/pages/index/FoundationStack";
import type {ChoiceOption} from "@app/pages/index/types";
import ErrorModal from "@app/pages/index/components/ErrorModal";
import ReadySystemsModal from "@app/pages/index/components/ReadySystemsModal";
import SuccessModal from "@app/pages/index/components/SuccessModal";
import {useErrorModal} from "@app/pages/index/hooks/useErrorModal";
import {useReadySystemsModal} from "@app/pages/index/hooks/useReadySystemsModal";
import HttpClient from "@app/clients/HttpClient";
import BuilderChoiceCard from "./BuilderChoiceCard";
import "./builder.css";

const DEFAULT_BUNDLE_ID = "subscription-access";

export default function Page() {
    const [projectName, setProjectName] = useState("my-application");
    const [demoInsertsEnabled, setDemoInsertsEnabled] = useState(true);
    const [selectedConfiguration, setSelectedConfiguration] = useState<string | null>("bundles");
    const [selectedSystemIds, setSelectedSystemIds] = useState<Set<string>>(() => new Set([DEFAULT_BUNDLE_ID]));
    const [selectedOrder, setSelectedOrder] = useState<string[]>([DEFAULT_BUNDLE_ID]);
    const [unselectedOrder, setUnselectedOrder] = useState<string[]>(() =>
        systemOptionsByConfiguration.bundles
            .map((option) => option.id)
            .filter((optionId) => optionId !== DEFAULT_BUNDLE_ID)
    );
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const previousConfiguration = useRef<string | null>("bundles");
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
    const toggleModuleSelection = (optionId: string) => {
        if (lockedIds.has(optionId)) {
            return;
        }
        setSelectedSystemIds((current) => {
            const next = new Set(current);
            if (next.has(optionId)) {
                next.delete(optionId);
                setSelectedOrder((currentOrder) => currentOrder.filter((id) => id !== optionId));
                setUnselectedOrder((currentOrder) => [
                    ...currentOrder.filter((id) => id !== optionId),
                    optionId
                ]);
                return next;
            }
            next.add(optionId);
            setSelectedOrder((currentOrder) => [...currentOrder.filter((id) => id !== optionId), optionId]);
            setUnselectedOrder((currentOrder) => currentOrder.filter((id) => id !== optionId));
            return next;
        });
    };
    const systemsTitle =
        selectedConfiguration === "bundles"
            ? "Choose a bundle"
            : selectedConfiguration === "ready-systems"
                ? "Choose a planned system"
                : "Choose modules";

    useEffect(() => {
        if (previousConfiguration.current === selectedConfiguration) {
            return;
        }
        previousConfiguration.current = selectedConfiguration;
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

    const optionById = useMemo(() => new Map(systemOptions.map((option) => [option.id, option])), [systemOptions]);
    const isChoiceOption = (option: ChoiceOption | undefined): option is ChoiceOption => option !== undefined;
    const selectedOptions = selectedOrder.map((id) => optionById.get(id)).filter(isChoiceOption);
    const unselectedOptions = unselectedOrder.map((id) => optionById.get(id)).filter(isChoiceOption);
    const selectedChoice = optionById.get(getSelectedSystemId() ?? "");
    const allModuleOptions = systemOptionsByConfiguration.modules;
    const moduleTitleByBackendName = Object.fromEntries(
        allModuleOptions.map((option) => [moduleIdToBackendName[option.id], option.title])
    ) as Record<string, string>;

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
            setIsSuccessModalOpen(true);
            window.setTimeout(() => {
                window.URL.revokeObjectURL(downloadUrl);
            }, 30000);
        } catch {
            errorModal.open();
        } finally {
            setIsDownloading(false);
        }
    };

    const selectionSummary = (() => {
        if (!selectedConfiguration) {
            return {
                title: "Choose a configuration",
                detail: "Select bundles, modules, or planned systems to see the available choices."
            };
        }
        if (selectedConfiguration === "ready-systems") {
            return selectedChoice
                ? {title: selectedChoice.title, detail: "Request an email notification when this planned system is ready."}
                : {title: "Choose a planned system", detail: "Select a system to continue to the interest list."};
        }

        const selectedModules = resolveModulesForDownload();
        const selectedModuleTitles = selectedModules.map((moduleName) => moduleTitleByBackendName[moduleName] ?? moduleName);
        if (selectedConfiguration === "bundles") {
            if (!selectedChoice) {
                return {title: "Choose a bundle", detail: "Select a bundle to see the modules it includes."};
            }
            return {
                title: selectedChoice.title,
                detail: `${selectedModules.length} modules · ${selectedModuleTitles.join(", ")}`
            };
        }

        const visibleModuleTitles = selectedModuleTitles.slice(0, 4);
        const remainingModules = selectedModuleTitles.length - visibleModuleTitles.length;
        const moduleList = `${visibleModuleTitles.join(", ")}${remainingModules > 0 ? `, +${remainingModules} more` : ""}`;
        return {
            title: `${selectedModules.length} ${selectedModules.length === 1 ? "module" : "modules"} selected`,
            detail: moduleList || "Identity is included by default."
        };
    })();

    const generateLabel = selectedConfiguration === "ready-systems" ? "Get notified" : "Generate project";

    return (
        <main className="builder-page">
            <div className="builder-page-main">
                <div className="builder-stage">
                    <header className="builder-intro" id="configurator">
                        <div className="builder-hero-copy">
                            <p className="builder-eyebrow">OpenKnit / Builder</p>
                            <h1>
                                <span>Compose</span>{" "}
                                <span className="builder-heading-accent">your application foundation</span>
                            </h1>
                            <p className="builder-intro-copy">
                                Choose a starting point, then add the modules your project needs.
                            </p>
                        </div>
                        <div className="builder-hero-visual">
                            <FoundationStack />
                        </div>
                    </header>

                    <section className="builder-grid" aria-label="Project configuration">
                        <section className="builder-panel" aria-labelledby="builder-project-heading">
                            <div className="builder-panel-heading">
                                <span className="builder-step-number">01</span>
                                <div>
                                    <p className="builder-panel-kicker">Project</p>
                                    <h2 id="builder-project-heading">Project metadata</h2>
                                </div>
                            </div>
                            <div className="builder-panel-content builder-project-content">
                                <div className="builder-field">
                                    <label htmlFor="builder-project-name">Project name</label>
                                    <input
                                        id="builder-project-name"
                                        type="text"
                                        value={projectName}
                                        onChange={(event) => setProjectName(event.target.value)}
                                        autoComplete="off"
                                    />
                                    <p className="builder-field-help">Used as the generated project name.</p>
                                </div>

                                <div className="builder-inserts-setting">
                                    <button
                                        className="builder-switch"
                                        type="button"
                                        role="switch"
                                        aria-label="Initial data inserts"
                                        aria-checked={demoInsertsEnabled}
                                        onClick={() => setDemoInsertsEnabled((enabled) => !enabled)}
                                    >
                                        <span className="builder-switch-thumb" aria-hidden="true" />
                                    </button>
                                    <div className="builder-inserts-copy">
                                        <p>Initial data inserts</p>
                                        <span>Seed demo data for the selected modules.</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="builder-panel" aria-labelledby="builder-configuration-heading">
                            <div className="builder-panel-heading">
                                <span className="builder-step-number">02</span>
                                <div>
                                    <p className="builder-panel-kicker">Starting point</p>
                                    <h2 id="builder-configuration-heading">Choose configuration</h2>
                                </div>
                            </div>
                            <div className="builder-panel-content builder-option-list builder-configuration-list">
                                {configurationOptions.map((option) => (
                                    <BuilderChoiceCard
                                        key={option.id}
                                        title={option.title}
                                        description={option.description}
                                        selected={selectedConfiguration === option.id}
                                        onClick={() => setSelectedConfiguration(option.id)}
                                    />
                                ))}
                            </div>
                        </section>

                        <section className="builder-panel builder-selection-panel" aria-labelledby="builder-selection-heading">
                            <div className="builder-panel-heading">
                                <span className="builder-step-number">03</span>
                                <div>
                                    <p className="builder-panel-kicker">Selection</p>
                                    <h2 id="builder-selection-heading">{systemsTitle}</h2>
                                </div>
                                {showSystems ? (
                                    <span className="builder-selection-count">
                                        {selectedConfiguration === "modules"
                                            ? `${selectedSystemIds.size} selected`
                                            : selectedSystemIds.size > 0 ? "1 selected" : "Choose one"}
                                    </span>
                                ) : null}
                            </div>

                            {showSystems ? (
                                <div className="builder-panel-content builder-option-list builder-selection-list">
                                    {isMultiSelect ? (
                                        <>
                                            {selectedOptions.map((option) => (
                                                <BuilderChoiceCard
                                                    key={option.id}
                                                    title={option.title}
                                                    description={option.description}
                                                    selected
                                                    disabled={lockedIds.has(option.id)}
                                                    onClick={() => toggleModuleSelection(option.id)}
                                                />
                                            ))}
                                            {selectedOptions.length > 0 && unselectedOptions.length > 0 ? (
                                                <div className="builder-list-divider" aria-hidden="true" />
                                            ) : null}
                                            {unselectedOptions.map((option) => (
                                                <BuilderChoiceCard
                                                    key={option.id}
                                                    title={option.title}
                                                    description={option.description}
                                                    selected={false}
                                                    disabled={lockedIds.has(option.id)}
                                                    onClick={() => toggleModuleSelection(option.id)}
                                                />
                                            ))}
                                        </>
                                    ) : (
                                        systemOptions.map((option) => (
                                            <BuilderChoiceCard
                                                key={option.id}
                                                title={option.title}
                                                description={option.description}
                                                selected={selectedSystemIds.has(option.id)}
                                                onClick={() => setSelectedSystemIds(new Set([option.id]))}
                                            />
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="builder-empty-selection">
                                    <span aria-hidden="true">···</span>
                                    <p>Choose a configuration</p>
                                    <small>Available options will appear here.</small>
                                </div>
                            )}
                        </section>
                    </section>
                </div>
            </div>

            <footer className="builder-summary-bar" aria-label="Project summary and actions">
                <div className="builder-summary-inner">
                    <div className="builder-summary-version" aria-label={`Scaffolder version ${__SCAFFOLDER_VERSION__}`}>
                        <span>OpenKnit Builder</span>
                        <span>v{__SCAFFOLDER_VERSION__}</span>
                    </div>
                    <div className="builder-summary-copy" aria-live="polite">
                        <strong>{selectionSummary.title}</strong>
                        <span>{selectionSummary.detail}</span>
                    </div>
                    <div className="builder-summary-actions">
                        <a
                            className="builder-social-link"
                            href="https://github.com/bitecode-tech/open-knit"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="GitHub"
                        >
                            <GithubIcon className="h-5 w-5" />
                        </a>
                        <a
                            className="builder-social-link"
                            href="https://discord.gg/XAAjcAFhUn"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Discord"
                        >
                            <DiscordIcon className="h-5 w-5" />
                        </a>
                        <button
                            className="builder-generate-button"
                            type="button"
                            disabled={isGenerateDisabled || isDownloading}
                            onClick={handleGenerate}
                        >
                            {isDownloading ? <span className="spinner" aria-label="Loading" /> : generateLabel}
                            {!isDownloading ? <span aria-hidden="true">↗</span> : null}
                        </button>
                    </div>
                </div>
            </footer>

            <ErrorModal isOpen={errorModal.isOpen} onClose={errorModal.close} />
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
        </main>
    );
}
