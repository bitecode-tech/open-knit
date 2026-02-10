type ReadySystemsModalProps = {
    isOpen: boolean;
    email: string;
    onEmailChange: (value: string) => void;
    emailIsValid: boolean;
    isPending: boolean;
    onClose: () => void;
    onSubmit: () => void;
};

export default function ReadySystemsModal({
                                              isOpen,
                                              email,
                                              onEmailChange,
                                              emailIsValid,
                                              isPending,
                                              onClose,
                                              onSubmit
                                          }: ReadySystemsModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[16px] w-full max-w-[460px] p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold" style={{color: "#031735"}}>
                        Ready systems in progress
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
                    Ready systems are still in progress. If you'd like to be notified when they are ready,
                    leave your email below.
                </p>
                <p className="mt-3 font-normal" style={{color: "#374252"}}>
                    For the moment, we recommend checking out the ready-to-use bundles.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(event) => onEmailChange(event.target.value)}
                        className="w-full h-[42px] rounded-[10px] border border-[#d0d5db] px-3 outline-none focus:border-[#6d6ff0]"
                    />
                    <button
                        type="button"
                        className={`h-[42px] rounded-[10px] text-white font-medium transition-colors flex items-center justify-center ${
                            emailIsValid && !isPending
                                ? "bg-[var(--primary)] cursor-pointer hover:bg-[#6d6ff0]"
                                : "bg-[#a5a7f4] cursor-not-allowed"
                        }`}
                        disabled={!emailIsValid || isPending}
                        onClick={onSubmit}
                    >
                        {isPending ? <span className="spinner" aria-label="Loading"/> : "Notify me"}
                    </button>
                </div>
            </div>
        </div>
    );
}
