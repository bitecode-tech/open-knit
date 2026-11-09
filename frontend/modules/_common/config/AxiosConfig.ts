import {AxiosInstance, CreateAxiosDefaults} from "axios";
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

export const configureAxios = (axios: AxiosInstance) => {
    axios.defaults.paramsSerializer = params => qs.stringify(params, {arrayFormat: 'repeat', encodeValuesOnly: true, strictNullHandling: true});

    return axios;
}

const adminBaseConfig = {
    ...baseConfig,
    baseURL: baseConfig.baseURL + "/admin"
};
export {baseConfig, adminBaseConfig};
