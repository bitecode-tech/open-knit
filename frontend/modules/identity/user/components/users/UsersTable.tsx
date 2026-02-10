import React, {useMemo, useState} from "react";
import {Checkbox,} from "flowbite-react";
import {ColumnDef,} from "@tanstack/react-table";
import {User} from "@identity/user/types/model/User.ts";
import {useQuery} from "@tanstack/react-query";
import {ActionsDropdown} from "@common/components/blocks/ActionsDropdown.tsx";
import GenericTable, {useGenericTablePagination} from "@common/components/tables/GenericTable.tsx";
import {format} from "date-fns";
import DateFilter from "@common/components/tables/filters/GenericTableDateFilter.tsx";
import ClearFilters from "@common/components/tables/filters/GenericTableClearFilters.tsx";
import AdminUserService from "@identity/user/services/AdminUserService.ts";
import {getFullName} from "@common/utils/StringUtils.ts";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import PlusIcon from '@common/assets/common/plus-icon.svg?react';
import {AddUserSidePanel} from "@identity/user/components/users/AddUserSidePanel.tsx";
import FilterTile from "@common/components/tables/filters/GenericTableFilterTile.tsx";
import {MobileRowTemplate} from "@common/components/tables/types/MobileRowTemplate.ts";
import {ColoredLabel} from "@common/components/elements/ColoredLabel.tsx";
import {enumToReadableText} from "@common/utils/EnumUtils.ts";

const activeTileFiltersConf = {
    0: {"emailConfirmed": "true"},
    1: {"emailConfirmed": "false"},
};

type ActiveTileFilterKey = keyof typeof activeTileFiltersConf;

function UsersTable() {
    const genericTablePagination = useGenericTablePagination();
    const [currentPage] = genericTablePagination.currentPageState;
    const [pageSize] = genericTablePagination.pageSizeState;
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [showAddUserModal, setShowAddUserModal] = useState(false)
    const [activeTileFilter, setActiveTileFilter] = useState<ActiveTileFilterKey>(0)

    const columns: ColumnDef<User>[] = [
        {
            id: "selection",
            header: ({table}) => (
                <Checkbox
                    {...{
                        checked: table.getIsAllPageRowsSelected(),
                        indeterminate: table.getIsSomePageRowsSelected(),
                        onChange: table.getToggleAllPageRowsSelectedHandler(),
                    }}
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    {...{
                        checked: row.getIsSelected(),
                        disabled: !row.getCanSelect(),
                        indeterminate: row.getIsSomeSelected(),
                        onChange: row.getToggleSelectedHandler(),
                    }}
                />
            ),
        },
        {
            id: "name",
            header: "Name",
            accessorFn: (row) => row,
            cell: ({getValue}) => {
                const {userData} = getValue() as User;
                return (
                    <div className="flex items-center">
                        <span className="font-medium text-gray-900 text-sm whitespace-nowrap">{getFullName(userData?.name, userData?.surname) ?? "-"}</span>
                    </div>
                );
            },
        },
        {
            id: "email",
            header: "Email",
            accessorFn: (row) => row,
            cell: ({getValue}) => {
                const user = getValue() as User;
                return (
                    <div className="flex items-center">
                        <span className=" ext-gray-700 text-sm whitespace-nowrap">{user?.email}</span>
                    </div>
                );
            },
        },
        {
            id: "created",
            header: "Created",
            accessorFn: (row) => row.createdDate,
            cell: ({getValue}) => {
                return (
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700 whitespace-nowrap">{format(new Date(getValue() as string), 'dd MMM yyyy, HH:mm')}</span>
                    </div>
                );
            },
        },
        {
            id: "roles",
            header: "Roles",
            accessorFn: (row) => row.roles,
            cell: ({getValue}) => {
                const roles = getValue() as string[];
                if (!roles || roles.length === 0) {
                    return <ColoredLabel>-</ColoredLabel>;
                }
                return (
                        <div className="flex items-center gap-1 flex-wrap">
                            {roles.map((role) => (
                                    <ColoredLabel key={role}>{enumToReadableText(role.replace("ROLE_", ""), "-")}</ColoredLabel>
                            ))}
                    </div>
                );
            },
        },
        {
            id: "emailConfirmed",
            header: () => <span className="whitespace-nowrap">Email confirmed</span>,
            accessorFn: (row) => row.emailConfirmed,
            cell: ({getValue}) => {
                const isEmailConfirmed = getValue() as boolean;
                return (
                        <ColoredLabel color={isEmailConfirmed ? "green" : "red"}>
                            {isEmailConfirmed ? "Yes" : "No"}
                        </ColoredLabel>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: () => <ActionsDropdown/>,
        },
    ];

    const mobileRowTemplate: MobileRowTemplate<"default"> = {
        version: "default",
        config: {
            header: {
                headerColumnId: "name",
                rightColumnId: "emailConfirmed"
            },
            cellsColumnIds: ["email", "created"]
        }
    }

    const filterParams = useMemo(() => {
        return {startDate, endDate, ...activeTileFiltersConf[activeTileFilter]};
    }, [startDate, endDate, activeTileFilter]);

    const {data} = useQuery({
        queryKey: ["admin-users", currentPage, pageSize, filterParams],
        queryFn: async () => {
            const userDataPage = await AdminUserService.getUserDetails(currentPage - 1, pageSize, true, filterParams);
            return userDataPage;
        },
    });

    const {data: statistics} = useQuery({
        queryKey: AdminUserService.QUERY_KEYS.GET_FILTER_STATISTICS(),
        queryFn: async () => await AdminUserService.getFilterStatistics()
            .then(resp => resp.data)
    });

    const clearFilters = () => {
        setStartDate(null);
        setEndDate(null);
    }

    return (
        <div>
            <GenericTable
                exportFilename="Customers"
                columns={columns}
                data={data}
                mobileRowTemplate={mobileRowTemplate}
                csvExportKeys={["userData.name", "userData.surname", "email", "createdDate", "roles", "emailConfirmed"]}
                headerSection={
                    <div className="flex justify-between">
                        <h5 className="text-gray-900 text-xl font-semibold">
                            Customers
                        </h5>
                        <GenericButton color="alternative" onClick={() => setShowAddUserModal(true)}>
                            <div className="flex gap-1 items-center">
                                <PlusIcon/>
                                Add new user
                            </div>
                        </GenericButton>
                    </div>
                }
                tileFilters={
                    <>
                        <FilterTile text="Registration completed" amount={statistics?.registrationCompleted ?? ""} filterKey={0}
                                    activeFilterState={[activeTileFilter, setActiveTileFilter]}/>
                        <FilterTile text="Registration incomplete" amount={statistics?.registrationIncomplete ?? ""} filterKey={1}
                                    activeFilterState={[activeTileFilter, setActiveTileFilter]}/>
                    </>
                }
                filters={
                    <>
                        <DateFilter startDateState={[startDate, setStartDate]} endDateState={[endDate, setEndDate]}/>
                        <ClearFilters onClick={clearFilters}/>
                    </>
                }
                {...genericTablePagination}
            />
            <AddUserSidePanel showState={[showAddUserModal, setShowAddUserModal]}/>
        </div>
    );
}

export default UsersTable;
