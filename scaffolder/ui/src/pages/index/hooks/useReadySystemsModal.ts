import {useCallback, useState} from "react";

type SubmitWishlistCallback = (email: string) => Promise<void>;

export function useReadySystemsModal(
    onDone: () => void,
    onSubmitWishlist: SubmitWishlistCallback,
    onSubmitError: () => void
) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isPending, setIsPending] = useState(false);
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const open = useCallback(() => {
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setEmail("");
        setIsPending(false);
        onDone();
    }, [onDone]);

    const submit = useCallback(async () => {
        if (!emailIsValid || isPending) {
            return;
        }

        setIsPending(true);
        try {
            await onSubmitWishlist(email.trim());
            close();
        } catch {
            setIsPending(false);
            onSubmitError();
        }
    }, [close, email, emailIsValid, isPending, onSubmitError, onSubmitWishlist]);

    return {
        isOpen,
        email,
        setEmail,
        emailIsValid,
        isPending,
        open,
        close,
        submit
    };
}
