import React from "react";
import UsersTable from "@identity/user/components/users/UsersTable.tsx";


export function UsersPage() {
    return (
        <div className="flex flex-col gap-4">
            <UsersTable/>
        </div>
    );
}