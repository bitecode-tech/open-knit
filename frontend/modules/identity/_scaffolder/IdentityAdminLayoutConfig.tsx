import React from "react";
import {AdminLayoutModuleConfig} from "@common/_scaffolder/AdminLayoutModuleConfig.ts";
import {UsersPage} from "@identity/user/pages/UsersPage.tsx";
import {SettingsPage} from "@identity/user/pages/settings/SettingsPage.tsx";
import UsersIcon from "@common/assets/dashboard/users-icon.svg?react";
import SettingsIcon from "@common/assets/dashboard/settings-icon.svg?react";

const breadcrumbsLabels: Record<string, string> = {
    settings: "Settings",
    users: "Users",
};

const routes = [
    {path: "settings", element: <SettingsPage/>},
    {path: "users", element: <UsersPage/>},
];

const sidebarItems = [
    {path: "admin/users", icon: UsersIcon, children: "Users"},
    {path: "admin/settings", icon: SettingsIcon, children: "Settings"},
] as AdminLayoutModuleConfig["sidebarItems"];

export const identityAdminLayoutConfig: AdminLayoutModuleConfig = {
    breadcrumbsLabels,
    routes,
    sidebarItems,
};
