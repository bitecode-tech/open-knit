type BuilderChoiceCardProps = {
    title: string;
    description: string;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
};

export default function BuilderChoiceCard({title, description, selected, onClick, disabled = false}: BuilderChoiceCardProps) {
    const status = disabled ? "Included by default" : selected ? "Selected" : "Select";

    return (
        <button
            className={`builder-choice-card${selected ? " is-selected" : ""}${disabled ? " is-locked" : ""}`}
            type="button"
            aria-label={`${title}. ${description}${disabled ? " Included by default." : ""}`}
            aria-pressed={selected}
            disabled={disabled}
            onClick={onClick}
        >
            <span className="builder-choice-copy">
                <span className="builder-choice-title">{title}</span>
                <span className="builder-choice-description">{description}</span>
            </span>
            <span className="builder-choice-status" aria-hidden="true">
                {selected ? <span className="builder-choice-check">✓</span> : null}
                {status}
            </span>
        </button>
    );
}
