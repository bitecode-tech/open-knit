import {DeepPartial} from "flowbite-react/types";
import {TabsTheme, theme} from "flowbite-react";
import {twMerge} from "tailwind-merge";

/**
 * @see <a href="https://flowbite-react.com/docs/components/tabs">Flowbite Modal docs</a>
 */

export const FlowbiteTabsCustomTheme: DeepPartial<TabsTheme> = {
    base: twMerge(theme.tabs.base, "h-full"),
    tabpanel: twMerge(theme.tabs.tabpanel, "h-full p-0 pt-3 md:px-3"),
    tabitemcontainer: {
        base: twMerge(theme.tabs.base, "h-full"),
    },
    tablist: {
        variant: {
            underline: twMerge(theme.tabs.tablist.variant.underline, "w-fit gap-x-4")
        },
        tabitem: {
            base: twMerge(theme.tabs.tablist.tabitem.base, "p-0 pb-2 cursor-pointer"),
            variant: {
                underline: {
                    active: {
                        on: twMerge(theme.tabs.tablist.tabitem.variant.underline.active.on, "text-primary-700")
                    }
                }
            }
        }
    },
}