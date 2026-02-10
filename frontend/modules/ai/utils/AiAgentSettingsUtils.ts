import {AiAgent} from "@ai/types/AiAgent.ts";


const TEMPERATURE_LESS_MODELS = new Set(["gpt-5", "gpt-5-mini", "gpt-5-nano"])

type AiAgentDisabledPropertyType = Pick<AiAgent, "temperature" | "model">


export const shouldPropertyBeDisabled = (agent: AiAgentDisabledPropertyType, property: keyof AiAgentDisabledPropertyType) => {
    const {model} = agent;

    if (property === "temperature") {
        if (model) {
            return TEMPERATURE_LESS_MODELS.has(model)
        }
    }
    return false;
}