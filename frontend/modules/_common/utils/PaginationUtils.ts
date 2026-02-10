import {PagedResponse} from "@common/model/PagedResponse.ts";
import qs from "qs";
import {PagedRequest} from "@common/model/PagedRequest.ts";
import {AxiosRequestConfig} from "axios";

export const emptyPage = <T>(): PagedResponse<T> => {
    return {content: [], page: {size: 0, totalElements: 0, number: 0, totalPages: 0}}
}

export const pageOf = <T>(content: T[] = []): PagedResponse<T> => {
    return {content, page: {size: content.length, totalElements: content.length, number: 0, totalPages: 1}}
}

export const mapPage = <T, R>(resp: PagedResponse<T>, mappingFun: (elem: T) => R): PagedResponse<R> => {
    return {
        content: resp.content.map(mappingFun),
        page: resp.page
    }
}

export function buildPagingParams<T>(req: PagedRequest<T>): Record<string, any> {
    const {page, params} = req;
    const out: Record<string, any> = {
        page: page.page,
        size: page.size,
        ...params
    };

    if (page.sort?.length) {
        out.sort = page.sort.map(o => `${o.property},${o.direction}`);
    }

    return out;
}

export function axiosRequestConfigOf<T>(req: PagedRequest<T>): AxiosRequestConfig<any> {
    return {
        params: buildPagingParams(req),
        paramsSerializer: pagedParamsSerializer
    }
}

export const pagedParamsSerializer = (params: any) => qs.stringify(params, {arrayFormat: 'repeat'});