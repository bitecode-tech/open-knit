import type {ChoiceOption} from "@app/pages/index/types";
import RadioCard from "@app/pages/index/components/RadioCard";

type BundlesSectionProps = {
    options: ChoiceOption[];
    selectedBundle: string;
    onSelectBundle: (value: string) => void;
};

export default function ConfigurationSection({options, selectedBundle, onSelectBundle}: BundlesSectionProps) {
    return (
        <div className="flex flex-col gap-4 items-start w-full min-h-0">
            <div className="flex flex-col gap-1 items-start">
                <div className="flex gap-1 items-start">
                    <h3 className="text-xl font-semibold" style={{color: "#031735"}}>
                        2. Choose configuration
                    </h3>
                </div>
                <p className="font-normal" style={{color: "#374252"}}>
                    Pick a starting point
                </p>
            </div>

            <div
                className="flex flex-col gap-4 items-start w-full overflow-y-auto pr-2"
                style={{maxHeight: "min(500px, calc(100dvh - var(--footer-height) - 320px))"}}
            >
                {options.map((option) => (
                    <RadioCard
                        key={option.id}
                        title={option.title}
                        description={option.description}
                        selected={selectedBundle === option.id}
                        onClick={() => onSelectBundle(option.id)}
                    />
                ))}
            </div>
        </div>
    );
}
