import Papa from 'papaparse';

function getNestedValue(obj: unknown, path: string) {
    return path.split('.').reduce<unknown>((accumulator, part) => {
        if (accumulator && typeof accumulator === 'object' && part in accumulator) {
            return (accumulator as Record<string, unknown>)[part];
        }
        return undefined;
    }, obj);
}

export function exportToCsv<T>(
    data: T[],
    columns: string[],
    filename = 'export.csv'
) {
    if (!data.length) return;

    const filteredData = data.map(row => {
        const filteredRow: Record<string, unknown> = {};
        columns.forEach(col => {
            filteredRow[col] = getNestedValue(row, col);
        });
        return filteredRow;
    });

    const csv = Papa.unparse(filteredData, {
        columns,
    });

    const csvWithBOM = '\uFEFF' + csv;

    const blob = new Blob([csvWithBOM], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.click();

    URL.revokeObjectURL(url);
}
