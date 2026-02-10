import {MobileRowTemplateConfig} from "@common/components/tables/types/MobileRowTemplateConfig.ts";

export interface MobileRowTemplate<V extends keyof MobileRowTemplateConfig> {
    version: V;
    config: MobileRowTemplateConfig[V];
}