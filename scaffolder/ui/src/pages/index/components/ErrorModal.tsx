type ErrorModalProps = {
    isOpen: boolean;
    message: string;
    onClose: () => void;
};

export default function ErrorModal({isOpen, message, onClose}: ErrorModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] px-4"
            onClick={onClose}
        >
            <div
                className="bg-[var(--white)] rounded-[16px] w-full max-w-[420px] p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                        We couldn't complete that request
                    </h3>
                    <button
                        type="button"
                        className="text-sm text-[var(--text-muted)] cursor-pointer"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
                <p className="mt-3 font-normal text-[var(--text-body)]">
                    {message}
                </p>
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-[10px] bg-[var(--primary)] text-[var(--white)] font-medium cursor-pointer hover:bg-[var(--primary-hover)]"
                        onClick={onClose}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}
