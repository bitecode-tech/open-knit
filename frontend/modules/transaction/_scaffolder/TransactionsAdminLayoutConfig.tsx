import React from "react";
import {AdminLayoutModuleConfig} from "@common/_scaffolder/AdminLayoutModuleConfig.ts";
import {TransactionsPage} from "@transaction/pages/TransactionsPage.tsx";
import {TransactionDetailsPage} from "@transaction/pages/TransactionDetailsPage.tsx";
import ExchangeIcon from '@common/assets/dashboard/exchange-icon.svg?react';

const breadcrumbsLabels: Record<string, string> = {
    transactions: "Transactions",
};

const routes = [
    {path: "transactions", element: <TransactionsPage/>},
    {path: "transactions/:id", element: <TransactionDetailsPage/>},
];

const sidebarItems = [
    {path: "admin/transactions", icon: ExchangeIcon, children: "Transactions"},
] as AdminLayoutModuleConfig["sidebarItems"];

export const transactionsAdminLayoutConfig: AdminLayoutModuleConfig = {
    breadcrumbsLabels,
    routes,
    sidebarItems
};
