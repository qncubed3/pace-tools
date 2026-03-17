"use client"

import { useSession } from "next-auth/react";
import SidebarHeader from "./SidebarHeader";

export default function Sidebar() {
    const { data: session } = useSession();

    return (
        <div className="bg-white h-full w-full shadow flex flex-col">
            <SidebarHeader />
            <div className="bg-red-200">hi</div>
            <div>{session?.expires}</div>
        </div>
    );
}