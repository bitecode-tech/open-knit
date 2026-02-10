import React from "react";
import clsx from "clsx";

export default function QuickReplies({items, onPick, horizontal = false}: {
    items: string[];
    onPick: (v: string) => void;
    horizontal?: boolean;
}) {
    if (!items?.length) {
        return null;
    }
    return (
        <div className={clsx("gap-2 flex", horizontal ? " flex-row" : "flex-wrap")}>
            {items.map((replyText, idx) => (
                <button
                    key={`${replyText}-${idx}`}
                    onClick={() => onPick(replyText)}
                    className={clsx("px-4 py-2 md:px-5 md:py-1 text-gray-600 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-600 bg-transparent font-new-spirit hover-text-light-neutral hover-bg-oxford-blue whitespace-nowrap cursor-pointer")}
                >
                    {replyText}
                </button>
            ))}
        </div>
    );
}
