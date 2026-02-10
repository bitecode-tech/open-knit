import * as React from "react";

interface AvatarProps {
    src: string;
    alt?: string;
    showBorder?: boolean;
    className?: string;
    leftPosition?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
                                                  src,
                                                  alt = "",
                                                  showBorder = false,
                                                  className = "",
                                                  leftPosition = 0,
                                              }) => {
    return (
        <img
            src={src}
            alt={alt}
            className={`absolute w-8 h-8 rounded-full ${
                showBorder ? "border border-blue-600 border-solid" : ""
            } ${className}`}
            style={{left: `${leftPosition}px`}}
        />
    );
};
