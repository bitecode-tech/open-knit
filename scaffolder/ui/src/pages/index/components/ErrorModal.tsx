type ErrorModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function ErrorModal({isOpen, onClose}: ErrorModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[16px] w-full max-w-[420px] p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold" style={{color: "#031735"}}>
                        High demand
                    </h3>
                    <button
                        type="button"
                        className="text-sm text-[#6b7380] cursor-pointer"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
                <p className="mt-3 font-normal" style={{color: "#374252"}}>
                    There is a lot of interest right now. Please try again in a few minutes.
                </p>
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-[10px] bg-[var(--primary)] text-white font-medium cursor-pointer hover:bg-[#6d6ff0]"
                        onClick={onClose}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}
