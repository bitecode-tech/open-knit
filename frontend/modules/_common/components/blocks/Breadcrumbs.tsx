import {useLocation} from "react-router-dom";
import {capitalizeFirstLetter} from "@common/utils/StringUtils.ts";
import GenericLink from "@common/components/elements/GenericLink.tsx";
import {Home} from "flowbite-react-icons/outline";
import {BREADCRUMBS_LABELS} from "@app/components/admin/AdminLayout.tsx";
import {BreadcrumbBackLinkState} from "@common/types/router/BreadcrumbBackLinkState.ts";

interface Crumb {
    path: string;
    label: string;
}

export function Breadcrumbs() {
    const location = useLocation();
    const breadcrumbBackLink = (location.state as BreadcrumbBackLinkState | null)?.breadcrumbBackLink;

    if (breadcrumbBackLink) {
        return (
            <nav aria-label="Back navigation">
                <GenericLink
                    to={breadcrumbBackLink.to}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-500"
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                    >
                        <path
                            d="M15 10H5m0 0 4-4m-4 4 4 4"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                        />
                    </svg>
                    <span>{breadcrumbBackLink.label}</span>
                </GenericLink>
            </nav>
        );
    }

    const pathnames = location.pathname.split("/").filter(Boolean);

    const wholePathname: Crumb[] = pathnames.map((segment, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const rawSegment = decodeURIComponent(segment).toLowerCase();
        const labelKey = BREADCRUMBS_LABELS[rawSegment];
        const label = labelKey ?? capitalizeFirstLetter(segment);
        return {path: to, label};
    });

    let breadcrumbs = wholePathname.slice(1);
    const userTypePrefix = wholePathname[0]?.path;
    const firstOne = wholePathname[1];

    if (firstOne?.label === "Dashboard") {
        breadcrumbs = wholePathname.slice(2);
    }

    if (breadcrumbs.length <= 1) {
        return null;
    }

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li className="inline-flex items-center">
                    <div className="inline-flex items-center text-sm font-medium text-gray-700">
                        <Home className="w-4 h-4 mr-1.5"/>
                        <GenericLink
                            className="text-gray-700 hover:text-primary-500"
                            to={`${userTypePrefix ?? ""}/dashboard`}
                        >
                            Dashboard
                        </GenericLink>
                    </div>
                </li>

                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <li key={crumb.path}>
                            <div className="flex items-center">
                                <svg
                                    className="w-3 h-3 text-gray-400 mr-1 rtl:rotate-180"
                                    fill="none"
                                    viewBox="0 0 6 10"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 9 4-4-4-4"
                                    />
                                </svg>
                                {isLast ? (
                                    <span className="text-sm font-medium text-gray-500">
                    {crumb.label}
                  </span>
                                ) : (
                                    <GenericLink
                                        to={crumb.path}
                                        className="text-sm font-medium text-gray-700 hover:text-primary-500"
                                    >
                                        {crumb.label}
                                    </GenericLink>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
