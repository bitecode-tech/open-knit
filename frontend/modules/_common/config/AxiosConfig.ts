import {AxiosInstance, CreateAxiosDefaults} from "axios";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";
import qs from "qs";

const commonConfig = {
    timeout: 15000,
    maxRedirects: 0,
    headers: {
        common: {
            'Content-Type': 'application/json',
        }
    },
    withCredentials: true // Includes the refresh token cookie
} as CreateAxiosDefaults;

const baseConfig: CreateAxiosDefaults = {
    baseURL: (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + "/api",
    ...commonConfig
};

const isFormDataValue = (value: unknown): value is FormData =>
    typeof FormData !== "undefined" && value instanceof FormData


const isFileValue = (value: unknown): value is File =>
    typeof File !== "undefined" && value instanceof File

export const addConverters = (axios: AxiosInstance) => {
    axios.interceptors.request.use(config => {
        if (config.data && typeof config.data === "object" && !isFormDataValue && !isFileValue) {
            config.data = snakecaseKeys(config.data as Record<string, unknown>, {deep: true})
        }
        return config
    })

    axios.interceptors.response.use((response) => {
        if (response.data && typeof response.data === "object") {
            response.data = camelcaseKeys(response.data, {deep: true});
        }
        return response;
    });

    axios.defaults.paramsSerializer = params => qs.stringify(params, {arrayFormat: 'repeat', encodeValuesOnly: true, strictNullHandling: true});

    return axios;
}

const adminBaseConfig = {
    ...baseConfig,
    baseURL: baseConfig.baseURL + "/admin"
};
export {baseConfig, adminBaseConfig};