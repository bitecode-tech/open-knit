import React from "react";
import TransactionsTable from "@transaction/components/TransactionsTable.tsx";


export function TransactionsPage() {
    return (
        <div className="flex flex-col gap-4">
            <TransactionsTable/>
        </div>
    );
}