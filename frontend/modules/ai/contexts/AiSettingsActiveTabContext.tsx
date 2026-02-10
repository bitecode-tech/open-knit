import React, {createContext, useContext} from "react";

interface TabContextType {
    activeTab: number;
    setActiveTab: (tab: number) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function AiSettingsActiveTabProvider({value, children}: {
    value: TabContextType;
    children: React.ReactNode;
}) {
    return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}

export function useAiSettingsActiveTabContext() {
    const ctx = useContext(TabContext);
    if (!ctx) {
        throw new Error("useTabContext must be used inside TabProvider");
    }
    return ctx;
}
