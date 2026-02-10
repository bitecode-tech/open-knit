import React, {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {useQuery} from "@tanstack/react-query";
import GenericTable, {useGenericTablePagination} from "@common/components/tables/GenericTable.tsx";
import AdminAiService from "@ai/services/AdminAiService.ts";
import AdminAiClient from "@ai/clients/AdminAiClient.ts";
import {AiAgentSessionsStats} from "@ai/types/AiAgentSessionsStats.ts";
import {formatDate, getRecentMonthsRange} from "@common/utils/DateFormatterUtils.ts";
import {Checkbox} from "flowbite-react";
import {useNavigate} from "react-router-dom";
import GenericTableSearchFilter from "@common/components/tables/filters/GenericTableSearchFilter.tsx";

const columns: ColumnDef<AiAgentSessionsStats>[] = [
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
            // prevents row click from firing
            <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    {...{
                        checked: row.getIsSelected(),
                        disabled: !row.getCanSelect(),
                        indeterminate: row.getIsSomeSelected(),
                        onChange: row.getToggleSelectedHandler(),
                    }}
                />
            </div>
        ),
    },
    {
        header: "Name",
        accessorFn: row => row.agentName,
        cell: ({getValue}) => (
            <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    {getValue<string>()}
                </span>
        )
    },
    {
        header: "Last usage",
        accessorFn: row => row.mostRecentSessionDate,
        cell: ({getValue}) => (
            <span className="text-sm text-gray-700 whitespace-nowrap">
                    {formatDate(getValue<string>())}
                </span>
        )
    },
    {
        header: "Total sessions",
        accessorFn: row => row.totalSessions,
        cell: ({getValue}) => (
            <span className="text-sm text-gray-700 whitespace-nowrap">
                    {getValue<number>()}
                </span>
        )
    },
    {
        header: "Past month sessions",
        accessorFn: row => row.sessionsInRange,
        cell: ({getValue}) => (
            <span className="text-sm text-gray-700 whitespace-nowrap">
                    {getValue<number>()}
                </span>
        )
    }
];

function AiAgentSessionStatsTable() {
    const genericTablePagination = useGenericTablePagination();
    const navigate = useNavigate();
    const [currentPage] = genericTablePagination.currentPageState;
    const [pageSize] = genericTablePagination.pageSizeState;
    const [searchFilterValue, setSearchFilterValue] = useState("")

    const filterParams = useMemo(() => ({name: `%${searchFilterValue}%`}),
        [searchFilterValue]
    );

    const {data: aiAgentStats} = useQuery({
        queryKey: AdminAiService.QUERY_KEYS.GET_AGENT_SESSIONS_STATS(currentPage, pageSize, filterParams),
        queryFn: async () => AdminAiClient.getAiAgentSessionStats(
            {
                page: {
                    page: currentPage - 1,
                    size: pageSize,
                    sort: [{property: "mostRecentSessionDate", direction: "ASC"}]
                },
                params: {...getRecentMonthsRange(1), ...filterParams}
            }
        )
    });

    return (
        <div className="-mt-4">
            <GenericTable
                exportFilename="AiAssistantHistory"
                columns={columns}
                data={aiAgentStats}
                filters={<>
                    <GenericTableSearchFilter valueState={[searchFilterValue, setSearchFilterValue]}/>
                </>}
                onRowClick={(row) => navigate(`/admin/aisettings/sessions/agents/${row.agentId}`)}
                csvExportKeys={["agentName", "mostRecentSessionDate", "totalSessions"]}
                {...genericTablePagination}
            />
        </div>
    );
}

export default AiAgentSessionStatsTable;
