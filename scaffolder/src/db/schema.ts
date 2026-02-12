import {integer, pgTable, serial, timestamp, uniqueIndex, varchar} from "drizzle-orm/pg-core";

export const downloadCounters = pgTable("download_counters", {
    name: varchar("name", {length: 191}).notNull().primaryKey(),
    count: integer("count").notNull().default(0),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {withTimezone: true}).notNull().defaultNow()
});

export const wishlistEntries = pgTable(
    "wishlist_entries",
    {
        id: serial("id").primaryKey(),
        email: varchar("email", {length: 320}).notNull(),
        systemName: varchar("system_name", {length: 191}).notNull(),
        createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow()
    },
    (table) => ({
        emailSystemNameUniqueIndex: uniqueIndex("wishlist_entries_email_system_name_idx").on(
            table.email,
            table.systemName
        )
    })
);

export type DownloadCounter = typeof downloadCounters.$inferSelect;
export type WishlistEntry = typeof wishlistEntries.$inferSelect;
