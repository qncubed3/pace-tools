"use client"

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import SliderCard from "../components/ui/SliderCard";

export default function Page() {
    const [open, setOpen] = useState(false);

    // lock scroll on mobile when sidebar is open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "auto";
    }, [open]);

    return (
        <div className="flex h-screen bg-gray-50">

            {/* Hamburger (mobile) */}
            <button
                className="lg:hidden fixed top-4 left-4 z-30 p-2 text-gray-700 hover:text-gray-500 hover:scale-105 hover:opacity-80 transition"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
            >
                ☰
            </button>

            {/* Mobile Sidebar */}
            <div
                className={`
                    fixed top-0 left-0 h-full w-80 z-40
                    transform transition-transform duration-300 ease-out
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    lg:hidden
                `}
            >
                <Sidebar />
            </div>

            {/* Overlay */}
            <div
                className={`
                    fixed inset-0 z-30 lg:hidden
                    bg-black/50
                    transition-opacity duration-300
                    ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                `}
                onClick={() => setOpen(false)}
            />

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-125">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div
                className="
                    flex flex-col sm:flex-row
                    items-center justify-center
                    gap-6 sm:gap-10 md:gap-20 lg:gap-24
                    w-full
                "
            >
                <SliderCard
                    title="pace"
                    primaryFn={(t) => 3 + t * 10}
                    invertFn={(miles) => (miles - 3) / 10}
                    convertFn={(minPerMile) => minPerMile / 1.60934}
                    primaryUnit="min/mi"
                    secondaryUnit="min/km"
                    displayMode="time"
                    step={1 / 60}
                />
                <SliderCard
                    title="distance"
                    primaryFn={(t) => t * 30}
                    invertFn={(miles) => miles / 30}
                    convertFn={(miles) => miles * 1.60934}
                    primaryUnit="mi"
                    secondaryUnit="km"
                    displayMode="decimal"
                    step={0.1}
                />
            </div>
        </div>
    );
}