import {useCallback, useState} from "react";

export function useReadySystemsModal(onDone: () => void) {
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

    const submit = useCallback(() => {
        if (!emailIsValid || isPending) {
            return;
        }
        setIsPending(true);
        window.setTimeout(() => {
            close();
        }, 750);
    }, [emailIsValid, isPending, close]);

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
