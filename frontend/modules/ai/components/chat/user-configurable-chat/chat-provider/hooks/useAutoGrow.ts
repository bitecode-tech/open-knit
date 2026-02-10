import {useEffect, type RefObject} from "react";

const MAX_TEXTAREA_HEIGHT = 160;

function syncAutoGrowHeight(el: HTMLTextAreaElement) {
    el.style.height = "0px";
    const newHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
    el.style.overflowX = "hidden";
}

export function useAutoGrow(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const sync = () => syncAutoGrowHeight(el);
        el.style.overflowY = "hidden";
        el.style.overflowX = "hidden";
        sync();
        el.addEventListener("input", sync);
        window.addEventListener("resize", sync);
        return () => {
            el.removeEventListener("input", sync);
            window.removeEventListener("resize", sync);
        };
    }, [ref]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        syncAutoGrowHeight(el);
    }, [ref, value]);
}
