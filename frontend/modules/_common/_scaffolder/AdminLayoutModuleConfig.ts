import {RouteObject} from "react-router-dom";
import {ComponentProps} from "react";
import {SidebarItem} from "flowbite-react";

export type AdminLayoutModuleConfig = {
    breadcrumbsLabels?: Record<string, string>;
    routes?: RouteObject[];
    sidebarItems?: ({ path?: string } & ComponentProps<typeof SidebarItem>)[];
};
