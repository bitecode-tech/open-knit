import {Navigate, useLocation, useNavigate, useRoutes} from "react-router-dom";
import React, {ComponentProps, useState} from "react";
import ApplicationShell from "@common/components/pages/ApplicationShell.tsx";
import {transactionsAdminLayoutConfig} from "@transaction/_scaffolder/TransactionsAdminLayoutConfig.tsx";
import {AdminLayoutModuleConfig} from "@common/_scaffolder/AdminLayoutModuleConfig.ts";
import {DrawerItems, Sidebar, SidebarItem, SidebarItemGroup, SidebarItems} from "flowbite-react";
import ChartIcon from '@common/assets/dashboard/chart-icon.svg?react';
import BookIcon from '@common/assets/dashboard/book-icon.svg?react';
import PrinterIcon from '@common/assets/dashboard/printer-icon.svg?react';
import BuoyIcon from '@common/assets/dashboard/buoy-icon.svg?react';
import {twMerge} from "tailwind-merge";
import {DashboardPage} from "@app/pages/admin/dashboard/DashboardPage.tsx";
import {useIsMobile} from "@common/hooks/useIsMobile.ts";
import {paymentsAdminLayoutConfig} from "@payment/_scaffolder/PaymentsAdminLayoutConfig.tsx";
import {subscriptionsAdminLayoutConfig} from "@payment/_scaffolder/SubscriptionsAdminLayoutConfig.tsx";
import {aiAdminLayoutConfig} from "@ai/_scaffolder/AiAdminLayoutConfig.tsx";
import {identityAdminLayoutConfig} from "@identity/_scaffolder/IdentityAdminLayoutConfig.tsx";

const adminModuleConfigs: AdminLayoutModuleConfig[] = [
    transactionsAdminLayoutConfig,
    paymentsAdminLayoutConfig,
    subscriptionsAdminLayoutConfig,
    aiAdminLayoutConfig,
    identityAdminLayoutConfig,
];

const moduleBreadcrumbs = Object.assign(
    {},
    ...adminModuleConfigs.map((moduleConfig) => moduleConfig.breadcrumbsLabels ?? {})
);

export const BREADCRUMBS_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    ...moduleBreadcrumbs,
};

export function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const routes = useRoutes([
        {index: true, element: <Navigate to="dashboard" replace/>},
        {path: "dashboard", element: <DashboardPage/>},
        ...adminModuleConfigs.flatMap((moduleConfig) => moduleConfig.routes ?? []),
    ]);

    const SidebarItemWrapper = (props: ComponentProps<typeof SidebarItem> & { path?: string }) => {
        const {icon: IconComponent, path, className, ...otherProps} = props;
        const isActive = path ? location.pathname.startsWith(path) : false;

        const Icon = IconComponent && <IconComponent className={`"size-4" ${isActive && "text-primary-500"}`}/>;

        return (
            <SidebarItem
                {...otherProps}
                className={twMerge(className, `cursor-pointer group font-semibold ${isActive && "text-primary-500"}`)}
                onClick={() => {
                    if (path) {
                        navigate(path);
                    }
                    if (isMobile) {
                        setSidebarOpen(false);
                    }
                }}
                icon={() => Icon}>
                {props.children}
            </SidebarItem>
        )
    }

    const normalizeSidebarPath = (path?: string) => {
        if (!path) {
            return path;
        }
        return path.startsWith("/") ? path : `/${path}`;
    };

    return (
        <ApplicationShell setSidebarOpen={setSidebarOpen} isSidebarOpen={isSidebarOpen} routes={routes}>
            <DrawerItems>
                <Sidebar
                    aria-label="Sidebar with multi-level dropdown"
                    className="w-full [&>div]:bg-transparent [&>div]:p-0"
                >
                    <div className="flex flex-col justify-between py-2 md:mt-12">
                        <SidebarItems className="pb-32">
                            <SidebarItemGroup>
                                <SidebarItemWrapper icon={ChartIcon} path="/admin/dashboard">Dashboard</SidebarItemWrapper>
                                {adminModuleConfigs
                                    .flatMap((moduleConfig) => moduleConfig.sidebarItems ?? [])
                                    .map((item, index) => {
                                        const {children, path, ...otherProps} = item;
                                        return (
                                            <SidebarItemWrapper
                                                key={`${path ?? "module-item"}-${String(children)}-${index}`}
                                                path={normalizeSidebarPath(path)}
                                                {...otherProps}>
                                                {children}
                                            </SidebarItemWrapper>
                                        );
                                    })}
                            </SidebarItemGroup>

                            <SidebarItemGroup>
                                <SidebarItemWrapper icon={BookIcon}>Docs</SidebarItemWrapper>
                                <SidebarItemWrapper icon={PrinterIcon}>Components</SidebarItemWrapper>
                                <SidebarItemWrapper icon={BuoyIcon}>Help</SidebarItemWrapper>
                            </SidebarItemGroup>
                        </SidebarItems>
                    </div>
                </Sidebar>
            </DrawerItems>
        </ApplicationShell>
    )
}
