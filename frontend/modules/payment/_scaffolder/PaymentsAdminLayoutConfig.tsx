import React from "react";
import {PaymentsPage} from "@payment/pages/PaymentsPage.tsx";
import {PaymentDetailsPage} from "@payment/pages/PaymentDetailsPage.tsx";
import {AdminLayoutModuleConfig} from "@common/_scaffolder/AdminLayoutModuleConfig.ts";

const breadcrumbsLabels: Record<string, string> = {
    payments: "Payments",
};

const routes = [
    {path: "payments", element: <PaymentsPage/>},
    {path: "payments/:id", element: <PaymentDetailsPage/>},
];

export const paymentsAdminLayoutConfig: AdminLayoutModuleConfig = {
    breadcrumbsLabels,
    routes,
};
