import {useEffect, useState} from "react";

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);


    useEffect(() => {
        const mql = window.matchMedia('(max-width: 767px)');
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        setIsMobile(mql.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    return isMobile;
}