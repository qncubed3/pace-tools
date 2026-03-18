import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const { id } = await params;

    try {
        const deletedRecord = await prisma.paceRecord.delete({
            where: { id },
        });
        return NextResponse.json(deletedRecord);
    } catch (error) {
        console.error("Error deleting record:", error);
        return NextResponse.json(
            { error },
            { status: 500 }
        );
    }
}