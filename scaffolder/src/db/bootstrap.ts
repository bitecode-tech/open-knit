import {getPool} from "@/db/client";

let isInitialized = false;

const schemaBootstrapLockId = 88214321;

export async function initializeDatabaseSchema(): Promise<void> {
    if (isInitialized) {
        return;
    }

    const pool = getPool();
    const client = await pool.connect();

    try {
        await client.query("SELECT pg_advisory_lock($1)", [schemaBootstrapLockId]);

        await client.query(`
            CREATE TABLE IF NOT EXISTS download_counters (
                name VARCHAR(191) PRIMARY KEY,
                count INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS wishlist_entries (
                id SERIAL PRIMARY KEY,
                email VARCHAR(320) NOT NULL,
                system_name VARCHAR(191) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS wishlist_entries_email_system_name_idx
            ON wishlist_entries (email, system_name)
        `);

        isInitialized = true;
    } finally {
        await client.query("SELECT pg_advisory_unlock($1)", [schemaBootstrapLockId]);
        client.release();
    }
}
