import {sql} from "drizzle-orm";
import {getDatabase} from "@/db/client";
import {downloadCounters} from "@/db/schema";

function normalizeCounterNames(names: string[]): string[] {
    return Array.from(
        new Set(
            names
                .map((name) => name.trim())
                .filter((name) => name.length > 0)
        )
    );
}

export async function incrementDownloadCounters(counterNames: string[]): Promise<void> {
    const normalizedCounterNames = normalizeCounterNames(counterNames);
    if (normalizedCounterNames.length === 0) {
        return;
    }

    const database = getDatabase();
    await Promise.all(
        normalizedCounterNames.map(async (counterName) => {
            await database
                .insert(downloadCounters)
                .values({
                    name: counterName,
                    count: 1
                })
                .onConflictDoUpdate({
                    target: downloadCounters.name,
                    set: {
                        count: sql`${downloadCounters.count} + 1`,
                        updatedAt: sql`now()`
                    }
                });
        })
    );
}
