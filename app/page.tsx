"use client"

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import SliderCard from "../components/ui/SliderCard";
import { Menu } from "lucide-react";

type LockedField = "pace" | "distance" | "time";

export default function Page() {

    // Mobile sidebar state
    const [open, setOpen] = useState(false);

    // Selected field
    const [lockedField, setLockedField] = useState<LockedField>("time");

    // Field sourth of truth
    const [pace, setPace] = useState(6);
    const [distance, setDistance] = useState(15);
    const [time, setTime] = useState(90);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "unset";
    }, [open]);

    // Derived fields
    const lockedPace = time / distance;
    const lockedDistance = time / pace;
    const lockedTime = pace * distance;

    return (
        <div className="flex h-screen bg-gray-50">

            {/* Hamburger */}
            <button
                className="lg:hidden fixed top-4 left-4 z-30 p-2 text-gray-700 hover:text-gray-500 hover:scale-105 hover:opacity-80 transition"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
            >
                <Menu />
            </button>

            {/* Mobile sidebar */}
            <div className={`
                fixed top-0 left-0 h-full w-80 z-40
                transform transition-transform duration-300 ease-out
                ${open ? "translate-x-0" : "-translate-x-full"}
                lg:hidden
            `}>
                <Sidebar />
            </div>

            {/* Mobile sidebar close area */}
            <div className={`
                fixed inset-0 z-30 lg:hidden bg-black/50
                transition-opacity duration-300
                ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
            `}
                onClick={() => setOpen(false)}
            />

            {/* Desktop sidebar */}
            <div className="hidden lg:block w-100">
                <Sidebar />
            </div>

            {/* Main panel */}
            <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-4 lg:gap-4 xl:gap-18 w-full">
                <SliderCard
                    title="pace"
                    primaryFn={(t) => 3 + t * 10}
                    invertFn={(v) => (v - 3) / 10}
                    convertFn={(minPerMile) => minPerMile / 1.60934}
                    primaryUnit="min/mi"
                    secondaryUnit="min/km"
                    displayMode="time"
                    step={1 / 60}
                    isLocked={lockedField === "pace"}
                    onLock={() => setLockedField("pace")}
                    lockedValue={lockedField === "pace" ? lockedPace : undefined}
                    onValueChange={setPace}
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
                    isLocked={lockedField === "distance"}
                    onLock={() => setLockedField("distance")}
                    lockedValue={lockedField === "distance" ? lockedDistance : undefined}
                    onValueChange={setDistance}
                />
                <SliderCard
                    title="time"
                    primaryFn={(t) => t * 300}
                    invertFn={(v) => v / 300}
                    convertFn={(mins) => mins / 60}
                    primaryUnit="min"
                    secondaryUnit="hr"
                    displayMode="time"
                    step={1}
                    isLocked={lockedField === "time"}
                    onLock={() => setLockedField("time")}
                    lockedValue={lockedField === "time" ? lockedTime : undefined}
                    onValueChange={setTime}
                />
            </div>
        </div>
    );
}