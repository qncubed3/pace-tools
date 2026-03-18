import type { PaceRecord } from "@prisma/client";

export const deleteRecord = async (id: string) => {
    try {
        const res = await fetch(`/api/record/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            throw new Error("Failed to delete record");
        }

        const deletedRecord = await res.json();
        console.log("Deleted record:", deletedRecord);
        return deletedRecord;
    } catch (error) {
        console.error(error);
    }
}

export const addRecord = async (
    data: { title: string; pace: number; distance: number; time: number }
): Promise<PaceRecord | null> => {
    try {
        const res = await fetch("/api/record", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            console.log("Failed to add record");
            return null;
        }
        

        const record: PaceRecord = await res.json(); // ensures TS knows the shape
        return record;
    } catch (err) {
        console.error("Error adding record:", err);
        throw err; // re-throw so caller can rollback
    }
};