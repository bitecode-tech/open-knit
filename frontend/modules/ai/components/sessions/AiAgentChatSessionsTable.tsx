import React, {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {useQuery} from "@tanstack/react-query";
import {format} from "date-fns";
import GenericTable, {useGenericTablePagination} from "@common/components/tables/GenericTable.tsx";
import AdminAiService from "@ai/services/AdminAiService.ts";
import AdminAiClient from "@ai/clients/AdminAiClient.ts";
import {AiAgentChatSession} from "@ai/types/AiAgentChatSession.ts";
import {useNavigate} from "react-router-dom";
import DateFilter from "@common/components/tables/filters/GenericTableDateFilter.tsx";

function formatDuration(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return "-";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} min`;
}

const columns: ColumnDef<AiAgentChatSession>[] = [
    {
        header: "Overview",
        accessorFn: row => row.overview,
        cell: ({getValue}) => (
            <span className="text-sm text-gray-900 font-medium whitespace-nowrap">
                    {getValue<string>()}
                </span>
        )
    },
    {
        header: "Chat #",
        accessorFn: row => row.sessionId,
        cell: ({getValue}) => (
            <span className="text-sm text-gray-700 whitespace-nowrap">{getValue<number>()}</span>
        )
    },
    {
        header: "Date",
        accessorFn: row => row.createdDate,
        cell: ({getValue}) => (
            <span className="text-sm text-gray-700 whitespace-nowrap">
                    {format(new Date(getValue() as string), "dd MMM yyyy, HH:mm")}
                </span>
        )
    },
    {
        header: "Duration",
        accessorFn: row => row.durationSeconds,
        cell: ({getValue}) => (
            <span className="text-sm text-gray-700 whitespace-nowrap">
                    {formatDuration(getValue<number>())}
                </span>
        )
    },
    {
        header: "Prompts",
        accessorFn: row => row.prompts,
        cell: ({getValue}) => (
            <span className="text-sm text-gray-700 whitespace-nowrap">{getValue<number>()}</span>
        )
    }
];

export default function AiAgentChatSessionsTable({agentId}: { agentId?: string }) {
    const genericTablePagination = useGenericTablePagination();
    const navigate = useNavigate();
    const [currentPage] = genericTablePagination.currentPageState;
    const [pageSize] = genericTablePagination.pageSizeState;
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)

    const filterParams = useMemo(() => ({startDate, endDate}),
        [startDate, endDate]
    );

    const {data} = useQuery({
        queryKey: AdminAiService.QUERY_KEYS.GET_CHAT_SESSIONS(agentId!, currentPage, pageSize, filterParams),
        queryFn: async () => {
            return await AdminAiClient.getChatSessions(agentId!, {
                page: {
                    page: currentPage - 1,
                    size: pageSize,
                    sort: [{property: "createdDate", direction: "DESC"}]
                },
                params: {...filterParams}
            });
        },
        enabled: !!agentId
    });

    return (
        <GenericTable
            exportFilename="AgentChatSessions"
            columns={columns}
            data={data}
            filters={<>
                <DateFilter startDateState={[startDate, setStartDate]} endDateState={[endDate, setEndDate]}/>
            </>}
            csvExportKeys={["overview", "sessionId", "createdDate", "durationSeconds", "prompts"]}
            headerSection={
                <h5 className="text-gray-900 text-xl font-semibold">
                    Chat sessions
                </h5>
            }
            onRowClick={(row) => navigate(`${row.sessionId}`)}
            {...genericTablePagination}
        />
    );
}