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
    isLocked?: boolean;
    onLock?: () => void;
    lockedValue?: number | undefined;
    onValueChange?: (val: number) => void;
}

function fmtTime(minutes: number): string {
    const totalSeconds = Math.round(minutes * 60);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (h > 0) {
        return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
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
    isLocked = false,
    onLock,
    lockedValue,
    onValueChange,
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

    const primaryVal = isLocked && lockedValue !== undefined ? lockedValue : primaryFn(t);
    const secondaryVal = convertFn(primaryVal);

    const setFromPrimary = useCallback((val: number) => {
        const newT = Math.min(1, Math.max(0, invertFn(val)));
        setT(newT);
        onValueChange?.(val);
    }, [invertFn, onValueChange]);

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
        e.currentTarget.blur();
        nudge(e.deltaY < 0 ? step : -step);
    };

    return (
        <div className={`w-60 bg-white p-6 rounded-3xl shadow-md transition-all ${isLocked ? "ring-2 ring-blue-400" : ""}`}>
            <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {title}
                </p>
                <button
                    onClick={onLock}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${isLocked
                            ? "bg-blue-50 border-blue-300 text-blue-500"
                            : "border-gray-700 text-gray-700 hover:border-gray-400 hover:text-gray-400"
                        }`}
                >
                    {isLocked ? "calculating" : "calculate"}
                </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center border rounded-xl overflow-hidden transition-colors flex-1 ${isLocked
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200 focus-within:border-blue-400 focus-within:bg-white"
                    }`}>
                    {!isLocked && (
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
                    )}
                    <input
                        type="text"
                        inputMode={displayMode === "time" ? "text" : "decimal"}
                        value={isLocked ? fmt(primaryVal, displayMode) : (focused ? inputVal : fmt(primaryVal, displayMode))}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onWheel={handleWheel}
                        readOnly={isLocked}
                        className={`text-4xl font-bold tabular-nums h-12 bg-transparent py-1 outline-none text-center flex-1 min-w-0 ${isLocked ? "text-blue-500 cursor-default" : ""
                            }`}
                    />
                </div>
                <span className="text-sm text-gray-400 shrink-0">{primaryUnit}</span>
            </div>

            <div className="mb-4" style={{ height: "20px" }}>
                {!isLocked && (
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.001}
                        value={t}
                        draggable={false}
                        onChange={(e) => {
                            const newT = Number(e.target.value);
                            setT(newT);
                            const newVal = primaryFn(newT);
                            onValueChange?.(newVal);
                            if (focused) setInputVal(fmt(newVal, displayMode));
                        }}
                        className="w-full"
                    />
                )}
            </div>

            <div className="border-t border-gray-100 pt-3 text-sm text-gray-400 tabular-nums">
                = {fmt(secondaryVal, displayMode)} {secondaryUnit}
            </div>
        </div>
    );
}