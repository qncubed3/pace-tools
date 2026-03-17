import { useState, useCallback, useRef, useEffect } from "react";

type DisplayMode = "decimal" | "time";

interface UnitOption {
    label: string;
    fromBase: (base: number) => number;
    toBase: (display: number) => number;
    displayMode: DisplayMode;
    step: number;
}

interface SliderCardProps {
    title: string;
    primaryFn: (t: number) => number;
    invertFn: (primary: number) => number;
    convertFn?: never;
    primaryUnit?: never;
    secondaryUnit?: never;
    unitGroup: "pace" | "distance" | "time";
    isLocked?: boolean;
    onLock?: () => void;
    lockedValue?: number | undefined;
    onValueChange?: (val: number) => void;
}

const PACE_UNITS: UnitOption[] = [
    { label: "min/mi", fromBase: (v) => v, toBase: (v) => v, displayMode: "time", step: 1 / 60 },
    { label: "min/km", fromBase: (v) => v / 1.60934, toBase: (v) => v * 1.60934, displayMode: "time", step: 1 / 60 },
    { label: "mph", fromBase: (v) => 60 / v, toBase: (v) => 60 / v, displayMode: "decimal", step: 0.1 },
    { label: "km/h", fromBase: (v) => 96.5606 / v, toBase: (v) => 96.5606 / v, displayMode: "decimal", step: 0.1 },
    { label: "m/s", fromBase: (v) => 26.8224 / v, toBase: (v) => 26.8224 / v, displayMode: "decimal", step: 0.01 },
    { label: "ft/s", fromBase: (v) => 88 / v, toBase: (v) => 88 / v, displayMode: "decimal", step: 0.1 },
];

const DISTANCE_UNITS: UnitOption[] = [
    { label: "mi", fromBase: (v) => v, toBase: (v) => v, displayMode: "decimal", step: 0.1 },
    { label: "km", fromBase: (v) => v * 1.60934, toBase: (v) => v / 1.60934, displayMode: "decimal", step: 0.1 },
    { label: "m", fromBase: (v) => v * 1609.34, toBase: (v) => v / 1609.34, displayMode: "decimal", step: 10 },
    { label: "ft", fromBase: (v) => v * 5280, toBase: (v) => v / 5280, displayMode: "decimal", step: 100 },
];

const TIME_UNITS: UnitOption[] = [
    { label: "min", fromBase: (v) => v, toBase: (v) => v, displayMode: "time", step: 1 },
    { label: "hr", fromBase: (v) => v / 60, toBase: (v) => v * 60, displayMode: "decimal", step: 0.01 },
    { label: "sec", fromBase: (v) => v * 60, toBase: (v) => v / 60, displayMode: "decimal", step: 1 },
];

function unitOptions(group: "pace" | "distance" | "time"): UnitOption[] {
    if (group === "pace") return PACE_UNITS;
    if (group === "distance") return DISTANCE_UNITS;
    return TIME_UNITS;
}

function defaultUnits(group: "pace" | "distance" | "time"): [UnitOption, UnitOption] {
    if (group === "pace") return [
        PACE_UNITS.find(u => u.label === "min/km")!,
        PACE_UNITS.find(u => u.label === "min/mi")!,
    ];
    if (group === "distance") return [
        DISTANCE_UNITS.find(u => u.label === "km")!,
        DISTANCE_UNITS.find(u => u.label === "mi")!,
    ];
    return [
        TIME_UNITS.find(u => u.label === "min")!,
        TIME_UNITS.find(u => u.label === "hr")!,
    ];
}

function fmtTime(minutes: number): string {
    const totalSeconds = Math.round(minutes * 60);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtInputPreview(val: string): string {
    const digits = val.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 0) return "";
    if (digits.length <= 2) return digits;
    if (digits.length === 3) return `${digits[0]}:${digits.slice(1)}`;
    if (digits.length === 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    if (digits.length === 5) return `${digits[0]}:${digits.slice(1, 3)}:${digits.slice(3)}`;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}`;
}

function parseTime(val: string): number {
    const digits = val.replace(/\D/g, "");
    if (digits.length === 0) return 0;
    let h = 0, m = 0, s = 0;
    if (digits.length <= 2) { s = parseInt(digits); }
    else if (digits.length === 3) { m = parseInt(digits[0]!); s = parseInt(digits.slice(1)); }
    else if (digits.length === 4) { m = parseInt(digits.slice(0, 2)); s = parseInt(digits.slice(2)); }
    else if (digits.length === 5) { h = parseInt(digits[0]!); m = parseInt(digits.slice(1, 3)); s = parseInt(digits.slice(3)); }
    else { h = parseInt(digits.slice(0, 2)); m = parseInt(digits.slice(2, 4)); s = parseInt(digits.slice(4, 6)); }
    return h * 60 + m + s / 60;
}

function fmt(n: number, mode: DisplayMode): string {
    return mode === "time" ? fmtTime(n) : n.toFixed(2);
}

function UnitDropdown({
    options,
    selected,
    onChange,
}: {
    options: UnitOption[];
    selected: UnitOption;
    onChange: (u: UnitOption) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-0.5 shrink-0"
            >
                {selected.label}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="mt-0.5">
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-md z-10 py-1 min-w-max">
                    {options.map(u => (
                        <button
                            key={u.label}
                            onClick={() => { onChange(u); setOpen(false); }}
                            className={`block w-full text-left px-3 py-1.5 text-sm transition-colors ${u.label === selected.label
                                    ? "text-blue-500 bg-blue-50"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {u.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SliderCard({
    title,
    primaryFn,
    invertFn,
    unitGroup,
    isLocked = false,
    onLock,
    lockedValue,
    onValueChange,
}: SliderCardProps) {
    const options = unitOptions(unitGroup);

    const [primaryUnit, setPrimaryUnit] = useState<UnitOption>(() => defaultUnits(unitGroup)[0]!);
    const [secondaryUnit, setSecondaryUnit] = useState<UnitOption>(() => defaultUnits(unitGroup)[1]!);

    const [t, setT] = useState(0.5);
    const [inputVal, setInputVal] = useState("");
    const [focused, setFocused] = useState(false);

    const tRef = useRef(t);
    useEffect(() => { tRef.current = t; }, [t]);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // base value is always in the group's base unit (min/mi, mi, min)
    const baseVal = isLocked && lockedValue !== undefined ? lockedValue : primaryFn(t);
    const primaryVal = primaryUnit.fromBase(baseVal);
    const secondaryVal = secondaryUnit.fromBase(baseVal);

    const displayMode = primaryUnit.displayMode;
    const step = primaryUnit.step;

    const setFromDisplay = useCallback((displayVal: number) => {
        const base = primaryUnit.toBase(displayVal);
        const newT = Math.min(1, Math.max(0, invertFn(base)));
        setT(newT);
        onValueChange?.(base);
    }, [primaryUnit, invertFn, onValueChange]);

    const nudge = useCallback((delta: number) => {
        const newDisplay = primaryUnit.fromBase(primaryFn(tRef.current)) + delta;
        setFromDisplay(newDisplay);
        setInputVal(fmt(newDisplay, displayMode));
    }, [primaryUnit, primaryFn, setFromDisplay, displayMode]);

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
        const raw = e.target.value;
        if (displayMode === "time") {
            const preview = fmtInputPreview(raw);
            setInputVal(preview);
            const parsed = parseTime(raw);
            if (!isNaN(parsed) && parsed > 0) setFromDisplay(parsed);
        } else {
            setInputVal(raw);
            const parsed = parseFloat(raw);
            if (!isNaN(parsed)) setFromDisplay(parsed);
        }
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

    const handlePrimaryUnitChange = (u: UnitOption) => {
        setPrimaryUnit(u);
        if (u.label === secondaryUnit.label) {
            const fallback = options.find(o => o.label !== u.label);
            if (fallback) setSecondaryUnit(fallback);
        }
    };

    const handleSecondaryUnitChange = (u: UnitOption) => {
        setSecondaryUnit(u);
        if (u.label === primaryUnit.label) {
            const fallback = options.find(o => o.label !== u.label);
            if (fallback) setPrimaryUnit(fallback);
        }
    };

    return (
        <div className={`w-67 bg-white p-6 rounded-3xl shadow-md ${isLocked ? "ring-2 ring-blue-400" : ""}`}>
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
                <div className={`flex items-center border rounded-xl transition-colors flex-1 ${isLocked
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200 focus-within:border-blue-400 focus-within:bg-white"
                    }`}>
                    {!isLocked && (
                        <div className="flex flex-col items-center self-stretch border-r border-gray-200 shrink-0">
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
                        className={`text-4xl font-bold tabular-nums h-12 bg-transparent px-3 py-1 outline-none text-center w-full min-w-0 ${isLocked ? "text-blue-500 cursor-default" : ""
                            }`}
                    />
                </div>
                <UnitDropdown
                    options={options}
                    selected={primaryUnit}
                    onChange={handlePrimaryUnitChange}
                />
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
                            const newBase = primaryFn(newT);
                            onValueChange?.(newBase);
                            if (focused) setInputVal(fmt(primaryUnit.fromBase(newBase), displayMode));
                        }}
                        className="w-full"
                    />
                )}
            </div>

            <div className="border-t border-gray-100 pt-3 text-sm text-gray-400 tabular-nums flex items-center justify-between">
                <span>= {fmt(secondaryVal, secondaryUnit.displayMode)}</span>
                <UnitDropdown
                    options={options}
                    selected={secondaryUnit}
                    onChange={handleSecondaryUnitChange}
                />
            </div>
        </div>
    );
}