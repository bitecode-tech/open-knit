import React, {useState} from "react";
import {Button, Label, Select} from "flowbite-react";
import {NewSubscriptionPlanModal} from "@payment/components/NewSubscriptionPlanModal.tsx";
import {UpdateSubscriptionPlanModal} from "@payment/components/UpdateSubscriptionPlanModal.tsx";
import {useQuery} from "@tanstack/react-query";
import AdminSubscriptionService from "@payment/services/AdminSubscriptionService.ts";
import {SubscriptionPlan} from "@payment/types/model/SubscriptionPlan.ts";

export function SubscriptionsPage() {
    const [pickedSubscriptionPlan, setPickedSubscriptionPlan] = useState<SubscriptionPlan | null>(null)
    const [showNewSubscriptionPlanModal, setShowNewSubscriptionPlanModal] = useState(false)
    const [showUpdateSubscriptionPlanModal, setShowUpdateNewSubscriptionPlanModal] = useState(false)

    const {data: subscriptionPlans} = useQuery({
        queryKey: AdminSubscriptionService.QUERY_KEYS.GET_SUBSCRIPTION_PLANS(0, 999),
        queryFn: () => AdminSubscriptionService.getSubscriptionPlans({page: {page: 0, size: 999}})
            .then(value => value.content),
    });

    const findSubscriptionPlan = (id: string) => {
        return subscriptionPlans!.find(plan => plan.uuid === id)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 max-w-fit">
                <Label className="mb-2 block">
                    New subscription plan
                </Label>
                <Button
                    size="lg"
                    className="max-w-44"
                    onClick={() => setShowNewSubscriptionPlanModal(true)}>
                    New subscription plan
                </Button>
            </div>
            <div className="flex flex-col gap-1 max-w-fit">
                <Label className="mb-2 block">
                    Edit subscription plan
                </Label>
                <Select
                    value={pickedSubscriptionPlan?.name ?? ""}
                    onChange={(e) => {
                        setPickedSubscriptionPlan(findSubscriptionPlan(e.target.value) ?? null)
                    }}>
                    <option value="" disabled hidden defaultChecked>
                        Pick plan to edit
                    </option>
                    {subscriptionPlans?.map(plan => <option key={plan.uuid} value={plan.uuid}>{plan.name}</option>)}
                </Select>
                <Button
                    size="lg"
                    className="max-w-44"
                    disabled={!pickedSubscriptionPlan}
                    onClick={() => setShowUpdateNewSubscriptionPlanModal(true)}>
                    Edit subscription plan
                </Button>
            </div>
            <NewSubscriptionPlanModal showModal={showNewSubscriptionPlanModal} setShowModal={setShowNewSubscriptionPlanModal}/>
            <UpdateSubscriptionPlanModal showModal={showUpdateSubscriptionPlanModal} setShowModal={setShowUpdateNewSubscriptionPlanModal}
                                         subscriptionPlan={pickedSubscriptionPlan!}/>
        </div>
    );
}