"use client"

import { signIn, useSession } from "next-auth/react";
import SidebarHeader from "./SidebarHeader";
import { useEffect, useState } from "react";
import PaceRecordCard from "@/components/ui/PaceRecordCard";

export default function Sidebar() {
    const { data: session } = useSession();

    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch("/api/record")
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    return (
        <div className="h-full w-full bg-white border-r border-gray-100 flex flex-col">
            <SidebarHeader />

            <div className="flex-1 overflow-y-auto">
                
                {session ? (
                    <div>
                        {data?.map((paceRecord, index: number) => (
                            <PaceRecordCard
                                key={index}
                                title={paceRecord.title}
                                distance={paceRecord.distance}
                                pace={paceRecord.pace}
                                time={paceRecord.time}
                            />
                        )
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <path d="M10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                                <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Save your paces</p>
                            <p className="text-xs text-gray-400 leading-relaxed">Sign in to save and revisit your pace calculations.</p>
                        </div>
                        <button
                            onClick={() => signIn()}
                            className="text-sm px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
                        >
                            Sign in to get started
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}