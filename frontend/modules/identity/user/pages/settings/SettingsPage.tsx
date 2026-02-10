import {UpdateUserPasswordSection} from "@identity/user/components/settings/password/UpdateUserPasswordSection.tsx";
import {UpdateUserDataFormSection} from "@identity/user/components/settings/account/UpdateUserDataFormSection.tsx";
import {TabItem, Tabs} from "flowbite-react";
import {UpdateMfaSettingsSection} from "@identity/user/components/settings/authentication/UpdateMfaSettingsSection.tsx";

export function SettingsPage() {
    return (
        <div className="flex flex-col gap-y-4">
            <h2 className="text-gray-900 text-xl font-semibold">Settings</h2>
            <Tabs variant="underline">
                <TabItem active title="Account">
                    <UpdateUserDataFormSection/>
                </TabItem>
                <TabItem title="Authentication">
                    <UpdateMfaSettingsSection/>
                </TabItem>
                <TabItem title="Password">
                    <UpdateUserPasswordSection/>
                </TabItem>
            </Tabs>
        </div>
    );
}