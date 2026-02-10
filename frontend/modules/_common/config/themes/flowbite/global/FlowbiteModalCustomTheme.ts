import {DeepPartial} from "flowbite-react/types";
import {ModalTheme, theme} from "flowbite-react";
import {twMerge} from "tailwind-merge";

/**
 * @see <a href="https://flowbite-react.com/docs/components/modal">Flowbite Modal docs</a>
 */

export const FlowbiteModalCustomTheme: DeepPartial<ModalTheme> = {
    root: {
        show: {
            on: twMerge(theme.modal.root.show.on, "bg-gray-800/75")
        }
    },
    header: {
        base: "flex items-start justify-between rounded-lg border-b p-5"
    },
}