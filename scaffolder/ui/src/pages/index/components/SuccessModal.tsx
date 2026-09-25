type SuccessModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function SuccessModal({isOpen, onClose}: SuccessModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] px-4"
            onClick={onClose}
        >
            <div
                className="bg-[var(--white)] rounded-[16px] w-full max-w-[520px] p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                        Your project ZIP is ready
                    </h3>
                    <button
                        type="button"
                        className="text-sm text-[var(--text-muted)] cursor-pointer"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
                <ol className="mt-4 list-decimal pl-5 space-y-3 font-normal text-[var(--text-body)]">
                    <li>
                        Extract the ZIP on the platform you selected.
                    </li>
                    <li>
                        Follow the generated <code>backend/README-run.md</code> for local startup instructions.
                    </li>
                    <li>
                        Downloading a ZIP does not install, start, or deploy the generated app. Review its local development credentials before using it outside development.
                    </li>
                </ol>
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
