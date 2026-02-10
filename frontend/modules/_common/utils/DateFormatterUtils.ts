import {format} from "date-fns";

export const formatDate = (dateStr?: string, fallback = "-") => {
    return dateStr ? format(new Date(dateStr), 'dd MMM yyyy, HH:mm') : fallback;
}

export function getRecentMonthsRange(monthsBack: number): { startDate: string; endDate: string } {
    const now = new Date();
    const end = new Date(now);

    const start = new Date(now);
    start.setDate(start.getDate() - monthsBack * 31);

    return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
    };
}