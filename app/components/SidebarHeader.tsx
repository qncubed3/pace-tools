"use client"

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function SidebarHeader() {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const initials = session?.user?.name
        ?.split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "?";

    return (
        <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
                    pace tools
                </span>

                {session ? (
                    <div ref={ref} className="relative">
                        <button
                            onClick={() => setDropdownOpen(o => !o)}
                            className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center hover:bg-blue-200 transition-colors"
                        >
                            {initials}
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-md z-10 overflow-hidden">
                                <div className="px-3 py-2 border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-700 truncate">{session.user?.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => signIn()}
                        className="text-xs px-3 py-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
                    >
                        Sign in
                    </button>
                )}
            </div>
        </div>
    );
}