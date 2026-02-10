import React from "react";
import {SubscriptionsPage} from "@payment/pages/SubscriptionsPage.tsx";
import {AdminLayoutModuleConfig} from "@common/_scaffolder/AdminLayoutModuleConfig.ts";
import CartPlusIcon from "@common/assets/dashboard/cart-plus-icon.svg?react";

const breadcrumbsLabels: Record<string, string> = {
    subscriptions: "Subscriptions",
};

const routes = [
    {path: "subscriptions", element: <SubscriptionsPage/>},
];

const sidebarItems = [
    {path: "admin/subscriptions", icon: CartPlusIcon, children: "Subscriptions"},
] as AdminLayoutModuleConfig["sidebarItems"];

export const subscriptionsAdminLayoutConfig: AdminLayoutModuleConfig = {
    breadcrumbsLabels,
    routes,
    sidebarItems,
};
