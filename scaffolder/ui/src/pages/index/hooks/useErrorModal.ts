import {useCallback, useState} from "react";

export function useErrorModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("The request could not be completed. Please try again.");

    const open = useCallback((nextMessage?: string) => {
        setMessage(nextMessage?.trim() || "The request could not be completed. Please try again.");
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    return {isOpen, message, open, close};
}
