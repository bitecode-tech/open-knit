export interface BreadcrumbBackLink {
    to: string;
    label: string;
}

export interface BreadcrumbBackLinkState {
    breadcrumbBackLink?: BreadcrumbBackLink;
}
