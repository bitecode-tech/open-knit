import {DeepPartial} from "flowbite-react/types";
import {DrawerTheme, theme} from "flowbite-react";
import {twMerge} from "tailwind-merge";

/**
 * @see <a href="https://flowbite-react.com/docs/components/drawer">Flowbite Modal docs</a>
 */

export const FlowbiteDrawerCustomTheme: DeepPartial<DrawerTheme> = {
    root: {
        backdrop: twMerge(theme.drawer.root.backdrop, "bg-gray-800/75")
    },
    header: {
        inner: {
            closeButton: twMerge(theme.drawer.header.inner.closeButton, "cursor-pointer"),
            titleIcon: "hidden",
            titleText: "text-gray-900 text-xl font-semibold p-4 mb-0"
        }
    }
}