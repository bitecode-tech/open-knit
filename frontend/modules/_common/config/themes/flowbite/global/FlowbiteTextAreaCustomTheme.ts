import {DeepPartial} from "flowbite-react/types";
import {TextareaTheme, theme} from "flowbite-react";
import {twMerge} from "tailwind-merge";

export const FlowbiteTextareaCustomTheme: DeepPartial<TextareaTheme> = {
    colors: {
        gray: twMerge(theme.textarea.colors.gray, "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-primary-300 focus:ring-primary-300")
    }
}
