import {TailSpin} from "react-loader-spinner";
import React, {ComponentProps, type FC, useEffect, useState} from "react";
import {HiCheckCircle} from "react-icons/hi";

export interface SpinnerTextLoaderProps {
    text: string;
    icon?: FC<ComponentProps<"svg">>,
    children?: React.ReactNode
    isPending: boolean;
    size?: number;
    color?: string;
    finishedSuccessfully?: boolean;
    onFinishedSuccessfully?: () => void;
}

export function SpinnerTextLoader({
                                      text,
                                      isPending,
                                      size = 24,
                                      color = "white",
                                      icon,
                                      children,
                                      onFinishedSuccessfully,
                                      finishedSuccessfully = false,
                                  }: SpinnerTextLoaderProps) {
    const [showCheck, setShowCheck] = useState(false);

    useEffect(() => {
        if (finishedSuccessfully) {
            setShowCheck(true);
            const timeout = setTimeout(() => {
                onFinishedSuccessfully && onFinishedSuccessfully();
                setShowCheck(false);
            }, 1000);

            return () => clearTimeout(timeout);
        } else {
            setShowCheck(false);
        }
    }, [finishedSuccessfully]);

    return (
        <div className="relative flex items-center justify-center">

            <span className={`${(isPending || showCheck) ? "opacity-0" : "opacity-100"} flex items-center gap-2`}>
                {children ??
                    <>
                        {icon && React.createElement(icon)}
                        {text}
                    </>
                }
            </span>

            {/* Spinner during pending */}
            {isPending && !showCheck && (
                <div className="absolute">
                    <TailSpin height={size} width={size} color={color}/>
                </div>
            )}

            {/* ✅ Checkmark when success */}
            {!isPending && showCheck && (
                <div className="absolute text-white animate-pingOnce">
                    <HiCheckCircle size={size}/>
                </div>
            )}
        </div>
    );
}