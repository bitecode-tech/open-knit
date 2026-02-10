import '@app/index.css'
import React, {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from '@app/App.tsx'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createTheme, ThemeConfig, ThemeProvider} from "flowbite-react";
import {FlowbiteModalCustomTheme} from "@common/config/themes/flowbite/global/FlowbiteModalCustomTheme.ts";
import {FlowbiteButtonCustomTheme} from "@common/config/themes/flowbite/global/FlowbiteButtonCustomTheme.ts";
import {FlowbiteHelperTextCustomTheme} from "@common/config/themes/flowbite/global/FlowbiteHelperTextCustomTheme.ts";
import {FlowbiteTextInputCustomTheme} from "@common/config/themes/flowbite/global/FlowbiteTextInputCustomTheme.ts";
import {FlowbiteCheckboxCustomTheme} from "@common/config/themes/flowbite/global/FlowbiteCheckboxCustomTheme.ts";
import {FlowbiteTabsCustomTheme} from "@common/config/themes/flowbite/global/FlowbiteTabsCustomTheme.ts";
import {FlowbiteDrawerCustomTheme} from "@common/config/themes/flowbite/global/FlowbiteDrawerCustomTheme.ts";
import {FlowbiteTextareaCustomTheme} from "@common/config/themes/flowbite/global/FlowbiteTextAreaCustomTheme.ts";

const queryClient = new QueryClient();

const customTheme = createTheme({
    modal: FlowbiteModalCustomTheme,
    button: FlowbiteButtonCustomTheme,
    helperText: FlowbiteHelperTextCustomTheme,
    textInput: FlowbiteTextInputCustomTheme,
    textarea: FlowbiteTextareaCustomTheme,
    checkbox: FlowbiteCheckboxCustomTheme,
    tabs: FlowbiteTabsCustomTheme,
    drawer: FlowbiteDrawerCustomTheme
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={customTheme}>
            {/*this is runtime config, build config "./flowbite-react/config.json" */}
            <ThemeConfig dark={false}/>
            <QueryClientProvider client={queryClient}>
                {/*<ReactQueryDevtools initialIsOpen={false} client={queryClient}/>*/}
                <App/>
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>,
)

