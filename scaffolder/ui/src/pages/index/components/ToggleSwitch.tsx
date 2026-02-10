import type {ToggleSwitchProps} from "@app/pages/index/types";

export default function ToggleSwitch({checked, onChange, label, helper}: ToggleSwitchProps) {
    return (
        <div className="flex gap-2 items-start w-full">
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className="h-6 w-12 shrink-0 relative rounded-[40px] transition-colors cursor-pointer"
                style={{
                    backgroundColor: checked ? "var(--primary)" : "#e4e6eb"
                }}
                aria-label={label}
                aria-pressed={checked}
            >
        <span
            className="absolute bg-white rounded-[40px] w-5 h-5 top-0.5 transition-all"
            style={{
                left: checked ? "calc(100% - 23px)" : "3px"
            }}
        />
            </button>
            <div className="flex flex-col gap-0.5">
                <p className="font-medium" style={{color: "#031735"}}>
                    {label}
                </p>
                <p className="font-normal" style={{color: "#6b7380"}}>
                    {helper}
                </p>
            </div>
        </div>
    );
}
