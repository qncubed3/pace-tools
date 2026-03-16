import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth()

    if (!session?.user || !session.user.id) {
        return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    try {
        const data = await request.json()
        const record = prisma.paceRecord.create({
            data
        })
        return NextResponse.json(record);
    } catch(error) {
        console.error("Error creating record: ", error)
        return new NextResponse("Internal server error", {status: 500})
    }
}