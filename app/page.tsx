"use client"

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import SliderCard from "../components/ui/SliderCard";
import { Menu } from "lucide-react";
import { addRecord } from "@/lib/api";
import type { PaceRecord } from "@prisma/client";

type LockedField = "pace" | "distance" | "time";

export default function Page() {

    // Mobile sidebar state
    const [open, setOpen] = useState(false);

    // Which field is being calculated
    const [lockedField, setLockedField] = useState<LockedField>("time");

    // Source of truth — SI units: pace = m/s, distance = m, time = sec
    const [pace, setPace] = useState(1000 / (6 * 60));  // 6 min/km in m/s ≈ 2.778
    const [distance, setDistance] = useState(10000);     // 10 km in m
    const [time, setTime] = useState(3600);              // 60 min in sec

    // Title to save pace record
    const [title, setTitle] = useState("");

    // Current data displayed on sidebar
    const [data, setData] = useState<PaceRecord[]>([]);
    
    useEffect(() => {
        fetch("/api/record")
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "auto";
    }, [open]);

    // Derived values — pace is now m/s so: distance = pace * time, etc.
    const derivedPace = distance / time;
    const derivedDistance = pace * time;
    const derivedTime = distance / pace;

    // Adopt the current derived value of the outgoing locked field
    // so numbers don't jump when switching
    function switchLocked(field: LockedField) {
        if (field === lockedField) return;
        if (lockedField === "pace") setPace(derivedPace);
        if (lockedField === "distance") setDistance(derivedDistance);
        if (lockedField === "time") setTime(derivedTime);
        setLockedField(field);
    }

    // optimistic save
    const handleSave = async () => {

        const oldData = data;
        const newRecord = {
            title,
            pace: lockedField === "pace" ? derivedPace : pace,
            distance: lockedField === "distance" ? derivedDistance : distance,
            time: lockedField === "time" ? derivedTime : time,
        };

        setData(prev => [...prev, {
            ...newRecord, 
            userId: "temp", 
            id: "temp" 
        }])

        try {
            const created = await addRecord(newRecord)
            setData(prev => prev.map(record => (record.id ===  "temp" ? created : record)))
        } catch {
            setData(oldData)
        }
    }

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
                <Sidebar data={data} setData={setData} />
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
                <Sidebar data={data} setData={setData} />
            </div>

            {/* Main panel */}
            <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="flex flex-col xl:flex-row gap-4 lg:gap-4 xl:gap-18 m-10">
                    <SliderCard
                        title="pace"
                        primaryFn={(t) => 0.5 + t * 9.5}   // 0.5–10 m/s
                        invertFn={(v) => (v - 0.5) / 9.5}
                        unitGroup="pace"
                        value={pace}
                        setValue={setPace}
                        isLocked={lockedField === "pace"}
                        onLock={() => switchLocked("pace")}
                        lockedValue={lockedField === "pace" ? derivedPace : undefined}
                    />
                    <SliderCard
                        title="distance"
                        primaryFn={(t) => t * 100000}       // 0–100 km in m
                        invertFn={(v) => v / 100000}
                        unitGroup="distance"
                        value={distance}
                        setValue={setDistance}
                        isLocked={lockedField === "distance"}
                        onLock={() => switchLocked("distance")}
                        lockedValue={lockedField === "distance" ? derivedDistance : undefined}
                    />
                    <SliderCard
                        title="time"
                        primaryFn={(t) => t * 18000}        // 0–5 hr in sec
                        invertFn={(v) => v / 18000}
                        unitGroup="time"
                        value={time}
                        setValue={setTime}
                        isLocked={lockedField === "time"}
                        onLock={() => switchLocked("time")}
                        lockedValue={lockedField === "time" ? derivedTime : undefined}
                    />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        // onKeyDown={(e) => e.key === "Enter" && handleSave}
                        placeholder="Name this pace..."
                        className="text-sm px-4 py-2 rounded-full border border-gray-200 bg-white outline-none focus:border-blue-400 transition-colors w-64 text-center"
                    />
                    <button
                        onClick={handleSave}
                        className="text-sm w-64 px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
                    >
                        Save pace record
                    </button>
                </div>
            </div>
        </div>
    );
}