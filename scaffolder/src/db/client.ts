import {drizzle} from "drizzle-orm/node-postgres";
import type {NodePgDatabase} from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

const {Pool} = require("pg");

export type PoolClientLike = {
    query: (queryText: string, values?: unknown[]) => Promise<unknown>;
    release: () => void;
};

export type PoolLike = {
    connect: () => Promise<PoolClientLike>;
};

let databaseInstance: NodePgDatabase<typeof schema> | null = null;
let poolInstance: PoolLike | null = null;

function getDatabaseUrl(): string {
    const databaseUrl = (process.env.DATABASE_URL ?? process.env.database_url)?.trim();
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required for database-backed endpoints");
    }
    return databaseUrl;
}

export function getPool(): PoolLike {
    if (poolInstance) {
        return poolInstance;
    }

    const createdPool = new Pool({
        connectionString: getDatabaseUrl()
    }) as PoolLike;
    poolInstance = createdPool;
    return createdPool;
}

export function getDatabase() {
    if (databaseInstance) {
        return databaseInstance;
    }

    databaseInstance = drizzle(getPool(), {schema});
    return databaseInstance;
}
