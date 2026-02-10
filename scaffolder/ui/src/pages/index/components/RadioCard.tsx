import type {RadioCardProps} from "@app/pages/index/types";

export default function RadioCard({title, description, selected, onClick, disabled}: RadioCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`w-full text-left rounded-[var(--radius)] p-3 transition-all bg-[var(--card)] ${
                disabled
                    ? "cursor-not-allowed"
                    : "cursor-pointer hover:border-[#4840d6] hover:bg-gray-100"
            }`}
            style={{
                border: selected ? "2px solid #4840d6" : "1px solid var(--border)"
            }}
        >
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold" style={{color: "#031735"}}>
                        {title}
                    </p>
                    {disabled ? (
                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.06em]">
              (default)
            </span>
                    ) : null}
                </div>
                <p className="font-normal leading-[1.5]" style={{color: "#6b7380"}}>
                    {description}
                </p>
            </div>
        </button>
    );
}
