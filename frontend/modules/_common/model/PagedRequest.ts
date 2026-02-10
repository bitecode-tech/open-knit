export type SortDirection = 'ASC' | 'DESC';

export interface SortOption {
    property: string;
    direction: SortDirection;
}

export interface PagedRequest<T> {
    requestData?: T[];
    params?: {},
    page: {
        page: number;
        size: number;
        sort?: SortOption[];
    }
}