import {Card, ToggleSwitch} from "flowbite-react";
import {FlowbiteToggleCardCustomTheme} from "@common/config/themes/flowbite/FlowbiteToggleCardCustomTheme.ts";
import {twMerge} from "tailwind-merge";

interface ToggleCardProps {
    title: string;
    text: string;
    toggle: boolean
    onToggle: (value: boolean) => void
    disabled?: boolean,
    className?: string
}

export function ToggleCard({title, text, toggle, onToggle, disabled = false, className}: ToggleCardProps) {
    return (
        <Card className={twMerge("shadow", className)} theme={FlowbiteToggleCardCustomTheme}>
            <div className="self-stretch inline-flex justify-between items-start">
                <h3 className="text-gray-900 font-medium text-sm md:text-base">{title}</h3>
                <ToggleSwitch checked={toggle} disabled={disabled} onChange={onToggle} sizing="sm"/>
            </div>
            <div className="flex-1 justify-start text-gray-500 text-sm">
                {text}
            </div>
        </Card>
    )
}