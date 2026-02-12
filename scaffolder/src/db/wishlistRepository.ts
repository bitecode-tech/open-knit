import {getDatabase} from "@/db/client";
import {wishlistEntries} from "@/db/schema";

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export async function createWishlistEntry(email: string, systemName: string): Promise<{ created: boolean }> {
    const normalizedEmail = normalizeEmail(email);
    const normalizedSystemName = systemName.trim();

    const database = getDatabase();
    const insertedRows = await database
        .insert(wishlistEntries)
        .values({
            email: normalizedEmail,
            systemName: normalizedSystemName
        })
        .onConflictDoNothing({
            target: [wishlistEntries.email, wishlistEntries.systemName]
        })
        .returning({
            id: wishlistEntries.id
        });

    return {
        created: insertedRows.length > 0
    };
}
