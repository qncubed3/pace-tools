import { useState, useCallback, useRef, useEffect } from "react";

type DisplayMode = "decimal" | "time";

interface SliderCardProps {
    title: string;
    primaryFn: (t: number) => number;
    invertFn: (primary: number) => number;
    convertFn: (primary: number) => number;
    primaryUnit: string;
    secondaryUnit: string;
    displayMode?: DisplayMode;
    step?: number;
}

function fmtTime(minutes: number): string {
    const m = Math.floor(minutes);
    const s = Math.round((minutes - m) * 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

function parseTime(val: string): number {
    if (val.includes(":")) {
        const [m, s] = val.split(":").map(Number);
        return (m ?? 0) + (s || 0) / 60;
    }
    return parseFloat(val);
}

function fmt(n: number, mode: DisplayMode): string {
    return mode === "time" ? fmtTime(n) : n.toFixed(2);
}

export default function SliderCard({
    title,
    primaryFn,
    invertFn,
    convertFn,
    primaryUnit,
    secondaryUnit,
    displayMode = "decimal",
    step = 0.1,
}: SliderCardProps) {
    const [t, setT] = useState(0.5);
    const [inputVal, setInputVal] = useState("");
    const [focused, setFocused] = useState(false);

    const tRef = useRef(t);
    useEffect(() => {
        tRef.current = t;
    }, [t]);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const primaryVal = primaryFn(t);
    const secondaryVal = convertFn(primaryVal);

    const setFromPrimary = useCallback((val: number) => {
        const newT = Math.min(1, Math.max(0, invertFn(val)));
        setT(newT);
        return newT;
    }, [invertFn]);

    const nudge = useCallback((delta: number) => {
        const newVal = primaryFn(tRef.current) + delta;
        setFromPrimary(newVal);
        setInputVal(fmt(newVal, displayMode));
    }, [primaryFn, setFromPrimary, displayMode]);

    const startHold = (delta: number) => {
        nudge(delta);
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => nudge(delta), 60);
        }, 400);
    };

    const stopHold = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputVal(e.target.value);
        const parsed = displayMode === "time"
            ? parseTime(e.target.value)
            : parseFloat(e.target.value);
        if (!isNaN(parsed)) setFromPrimary(parsed);
    };

    const handleFocus = () => {
        setFocused(true);
        setInputVal(fmt(primaryVal, displayMode));
    };

    const handleBlur = () => {
        setFocused(false);
        setInputVal("");
    };

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const input = e.currentTarget;
        input.blur();

        nudge(e.deltaY < 0 ? step : -step);
    };

    return (
        <div className="w-60 bg-white p-6 rounded-3xl shadow-md">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                {title}
            </p>

            <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:bg-white transition-colors">
                    <div className="flex flex-col items-center self-stretch border-r border-gray-200">
                        <button
                            onMouseDown={(e) => { e.preventDefault(); startHold(step); }}
                            onMouseUp={stopHold}
                            onMouseLeave={stopHold}
                            onTouchStart={(e) => { e.preventDefault(); startHold(step); }}
                            onTouchEnd={stopHold}
                            className="flex-1 w-6 hover:bg-gray-200 active:bg-gray-300 text-gray-400 hover:text-gray-600 flex items-center justify-center select-none cursor-pointer text-xs transition-colors border-b border-gray-200"
                        >
                            +
                        </button>
                        <button
                            onMouseDown={(e) => { e.preventDefault(); startHold(-step); }}
                            onMouseUp={stopHold}
                            onMouseLeave={stopHold}
                            onTouchStart={(e) => { e.preventDefault(); startHold(-step); }}
                            onTouchEnd={stopHold}
                            className="flex-1 w-6 hover:bg-gray-200 active:bg-gray-300 text-gray-400 hover:text-gray-600 flex items-center justify-center select-none cursor-pointer text-xs transition-colors"
                        >
                            −
                        </button>
                    </div>

                    <input
                        type="text"
                        inputMode={displayMode === "time" ? "text" : "decimal"}
                        value={focused ? inputVal : fmt(primaryVal, displayMode)}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onWheel={handleWheel}
                        className="text-4xl font-bold tabular-nums w-28 h-12 bg-transparent py-1 outline-none text-center"
                    />
                </div>

                <span className="text-sm text-gray-400 shrink-0">{primaryUnit}</span>
            </div>

            <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={t}
                draggable={false}
                onChange={(e) => {
                    setT(Number(e.target.value));
                    if (focused) setInputVal(fmt(primaryFn(Number(e.target.value)), displayMode));
                }}
                className="w-full mb-4"
            />

            <div className="border-t border-gray-100 pt-3 text-sm text-gray-400 tabular-nums">
                = {fmt(secondaryVal, displayMode)} {secondaryUnit}
            </div>
        </div>
    );
}