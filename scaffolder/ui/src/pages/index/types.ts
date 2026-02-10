export type ToggleSwitchProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    helper: string;
};

export type RadioCardProps = {
    title: string;
    description: string;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
};

export type ChoiceOption = {
    id: string;
    title: string;
    description: string;
};
