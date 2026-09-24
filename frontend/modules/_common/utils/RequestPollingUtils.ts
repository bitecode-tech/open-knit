export const DEFAULT_REQUEST_POLLING_INTERVAL_MS = 5000;

export function getRequestPollingInterval(
    shouldPoll: boolean,
    intervalMs: number = DEFAULT_REQUEST_POLLING_INTERVAL_MS
): number | false {
    return shouldPoll ? intervalMs : false;
}
