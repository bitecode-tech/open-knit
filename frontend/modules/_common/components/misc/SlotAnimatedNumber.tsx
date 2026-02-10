import {useEffect, useRef, useState} from "react";
import {twMerge} from "tailwind-merge";
import {formatMoney} from "@common/utils/MoneyUtils.ts";

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    initialDelay?: number,
    symbol?: string,
    precision?: number,
    numberFormat?: "usd"
    className?: string,
}

export const SlotAnimatedNumber: React.FC<AnimatedNumberProps> = ({value, duration = 500, initialDelay = 0, symbol, numberFormat, className, precision}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [delayedValue, setDelayedValue] = useState(0);
    const ref = useRef<number | null>(null);
    const start = useRef<number>(performance.now());
    const from = useRef<number>(delayedValue);

    useEffect(() => {
        if (delayedValue === from.current) return;

        if (ref.current) cancelAnimationFrame(ref.current);
        start.current = performance.now();
        const initial = from.current;
        const delta = delayedValue - initial;

        const tick = (now: number) => {
            const progress = Math.min((now - start.current) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(initial + delta * eased);
            if (progress < 1) {
                ref.current = requestAnimationFrame(tick);
            } else {
                from.current = delayedValue;
            }
        };

        ref.current = requestAnimationFrame(tick);

        return () => {
            if (ref.current !== null) {
                cancelAnimationFrame(ref.current);
            }
        };
    }, [delayedValue, duration]);

    setTimeout(() => {
        setDelayedValue(value)
    }, initialDelay)

    return (<div className={twMerge(className, "text-gray-900 text-xl")}>{formatMoney(displayValue, precision, symbol, numberFormat)}</div>);
};