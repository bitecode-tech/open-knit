import {SpinnerTextLoader} from "@common/components/misc/SpinnerTextLoader.tsx";
import {Button} from "flowbite-react";
import React, {ComponentProps, type FC} from "react";
import {twMerge} from "tailwind-merge";

export interface GenericButtonProps extends ComponentProps<typeof Button> {
    text?: string;
    icon?: FC<ComponentProps<"svg">>,
    isPending?: boolean,
    children?: React.ReactNode
    isSuccess?: boolean,
    spinnerColor?: string,
    onSuccess?: () => void,
    childrenLoaderWrap?: boolean,
}

export function GenericButton({
                                  text,
                                  isPending,
                                  children,
                                  isSuccess,
                                  onSuccess,
                                  icon,
                                  spinnerColor,
                                  childrenLoaderWrap = false,
                                  ...buttonProps
                              }: GenericButtonProps) {

    const LoaderWrapper = () => childrenLoaderWrap
        ? (
            <SpinnerTextLoader
                text={text ?? ""}
                icon={icon}
                color={spinnerColor ?? (buttonProps.color === "alternative" ? "black" : "white")}
                isPending={!!isPending}
                finishedSuccessfully={isSuccess}
                onFinishedSuccessfully={onSuccess}
            >
                {children}
            </SpinnerTextLoader>
        )
        : children ?? (
        <SpinnerTextLoader
            text={text ?? ""}
            icon={icon}
            color={spinnerColor ?? (buttonProps.color === "alternative" ? "black" : "white")}
            isPending={!!isPending}
            finishedSuccessfully={isSuccess}
            onFinishedSuccessfully={onSuccess}
        />
    );

    return (
        <Button
            disabled={isPending || buttonProps?.disabled}
            {...buttonProps}
            className={twMerge(`${isSuccess ? "pointer-events-none" : "cursor-pointer"}`, buttonProps?.className)}
        >
            <LoaderWrapper/>
        </Button>
    );
}

