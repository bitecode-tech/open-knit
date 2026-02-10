import axios, {AxiosError, AxiosResponse} from "axios";

export interface CallWrapper<R, E = GenericErrorMessage> {
    response?: AxiosResponse<R>;
    error?: AxiosError<E>
}

export interface GenericErrorMessage {
    error: string,
    message: string,
}

export const axiosCallWrapper = async <R, E = GenericErrorMessage>(req: () => Promise<AxiosResponse<R>>): Promise<CallWrapper<R, E>> => {
    try {
        const response = await req();
        return {response};
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return {error: err};
        }
        throw err;
    }
};