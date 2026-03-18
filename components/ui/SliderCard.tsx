import { useState, useRef, useEffect } from "react";

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
    invertFn: (base: number) => number;
    unitGroup: "pace" | "distance" | "time";
    value: number;
    setValue: (base: number) => void;
    isLocked?: boolean;
    onLock?: () => void;
    lockedValue?: number | undefined;
}

// base units: pace = m/s, distance = m, time = sec

const PACE_UNITS: UnitOption[] = [
    // min/km: 1 m/s = 1000m/min... pace = 1/speed * 1000/60
    { label: "min/km", fromBase: (v) => 1000 / (v * 60), toBase: (v) => 1000 / (v * 60), displayMode: "time", step: 1 / 60 },
    { label: "min/mi", fromBase: (v) => 1609.34 / (v * 60), toBase: (v) => 1609.34 / (v * 60), displayMode: "time", step: 1 / 60 },
    { label: "km/h", fromBase: (v) => v * 3.6, toBase: (v) => v / 3.6, displayMode: "decimal", step: 0.1 },
    { label: "mph", fromBase: (v) => v * 2.23694, toBase: (v) => v / 2.23694, displayMode: "decimal", step: 0.1 },
    { label: "m/s", fromBase: (v) => v, toBase: (v) => v, displayMode: "decimal", step: 0.01 },
    { label: "ft/s", fromBase: (v) => v * 3.28084, toBase: (v) => v / 3.28084, displayMode: "decimal", step: 0.1 },
];

const DISTANCE_UNITS: UnitOption[] = [
    { label: "km", fromBase: (v) => v / 1000, toBase: (v) => v * 1000, displayMode: "decimal", step: 0.1 },
    { label: "mi", fromBase: (v) => v / 1609.34, toBase: (v) => v * 1609.34, displayMode: "decimal", step: 0.1 },
    { label: "m", fromBase: (v) => v, toBase: (v) => v, displayMode: "decimal", step: 10 },
    { label: "ft", fromBase: (v) => v * 3.28084, toBase: (v) => v / 3.28084, displayMode: "decimal", step: 100 },
];

const TIME_UNITS: UnitOption[] = [
    // fromBase receives seconds, fmtTime expects minutes so divide by 60
    { label: "min", fromBase: (v) => v / 60, toBase: (v) => v * 60, displayMode: "time", step: 1 },
    { label: "hr", fromBase: (v) => v / 3600, toBase: (v) => v * 3600, displayMode: "decimal", step: 0.01 },
    { label: "sec", fromBase: (v) => v, toBase: (v) => v, displayMode: "decimal", step: 1 },
];

function getUnits(group: "pace" | "distance" | "time"): UnitOption[] {
    if (group === "pace") return PACE_UNITS;
    if (group === "distance") return DISTANCE_UNITS;
    return TIME_UNITS;
}

function getDefaults(group: "pace" | "distance" | "time"): [UnitOption, UnitOption] {
    if (group === "pace") return [PACE_UNITS[0]!, PACE_UNITS[1]!];
    if (group === "distance") return [DISTANCE_UNITS[0]!, DISTANCE_UNITS[1]!];
    return [TIME_UNITS[0]!, TIME_UNITS[1]!];
}

// receives minutes, formats as m:ss or h:mm:ss
function fmtTime(minutes: number): string {
    const totalSeconds = Math.floor(minutes * 60); // note: floor to give conservative pace estimates given goal time
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function fmt(n: number, mode: DisplayMode): string {
    return mode === "time" ? fmtTime(n) : n.toFixed(2);
}

function fmtInputPreview(val: string): string {
    const d = val.replace(/\D/g, "").slice(0, 6);
    if (d.length === 0) return "";
    if (d.length <= 2) return d;
    if (d.length === 3) return `${d[0]}:${d.slice(1)}`;
    if (d.length === 4) return `${d.slice(0, 2)}:${d.slice(2)}`;
    if (d.length === 5) return `${d[0]}:${d.slice(1, 3)}:${d.slice(3)}`;
    return `${d.slice(0, 2)}:${d.slice(2, 4)}:${d.slice(4)}`;
}

// returns minutes (toBase for min unit then converts to seconds)
function parseTime(val: string): number {
    const d = val.replace(/\D/g, "");
    if (!d) return 0;
    let h = 0, m = 0, s = 0;
    if (d.length <= 2) { s = parseInt(d); }
    else if (d.length === 3) { m = parseInt(d[0]!); s = parseInt(d.slice(1)); }
    else if (d.length === 4) { m = parseInt(d.slice(0, 2)); s = parseInt(d.slice(2)); }
    else if (d.length === 5) { h = parseInt(d[0]!); m = parseInt(d.slice(1, 3)); s = parseInt(d.slice(3)); }
    else { h = parseInt(d.slice(0, 2)); m = parseInt(d.slice(2, 4)); s = parseInt(d.slice(4, 6)); }
    return h * 60 + m + s / 60;
}

function UnitDropdown({ options, selected, onChange }: {
    options: UnitOption[];
    selected: UnitOption;
    onChange: (u: UnitOption) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
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
                            className={`block w-full text-left px-3 py-1.5 text-sm transition-colors ${u.label === selected.label ? "text-blue-500 bg-blue-50" : "text-gray-600 hover:bg-gray-50"
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
    value,
    setValue,
    isLocked = false,
    onLock,
    lockedValue,
}: SliderCardProps) {
    const units = getUnits(unitGroup);
    const [primaryUnit, setPrimaryUnit] = useState<UnitOption>(() => getDefaults(unitGroup)[0]!);
    const [secondaryUnit, setSecondaryUnit] = useState<UnitOption>(() => getDefaults(unitGroup)[1]!);
    const [inputVal, setInputVal] = useState("");
    const [focused, setFocused] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // base value always comes from parent — single source of truth
    const baseVal = isLocked && lockedValue !== undefined ? lockedValue : value;
    const primaryVal = primaryUnit.fromBase(baseVal);
    const secondaryVal = secondaryUnit.fromBase(baseVal);
    const displayMode = primaryUnit.displayMode;

    // t is only used for slider visual position
    const t = Math.min(1, Math.max(0, invertFn(baseVal)));

    function commitDisplay(display: number) {
        setValue(primaryUnit.toBase(display));
    }

    function nudge(delta: number) {
        const next = primaryUnit.fromBase(baseVal) + delta;
        commitDisplay(next);
        setInputVal(fmt(next, displayMode));
    }

    function startHold(delta: number) {
        nudge(delta);
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => nudge(delta), 60);
        }, 400);
    }

    function stopHold() {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }

    function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
        const newBase = primaryFn(Number(e.target.value));
        setValue(newBase);
        if (focused) setInputVal(fmt(primaryUnit.fromBase(newBase), displayMode));
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;
        if (displayMode === "time") {
            setInputVal(fmtInputPreview(raw));
            const parsed = parseTime(raw);
            if (parsed > 0) commitDisplay(parsed);
        } else {
            setInputVal(raw);
            const parsed = parseFloat(raw);
            if (!isNaN(parsed)) commitDisplay(parsed);
        }
    }

    function handleFocus() {
        setFocused(true);
        setInputVal(fmt(primaryVal, displayMode));
    }

    function handleBlur() {
        setFocused(false);
        setInputVal("");
    }

    function handleWheel(e: React.WheelEvent<HTMLInputElement>) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.blur();
        nudge(e.deltaY < 0 ? primaryUnit.step : -primaryUnit.step);
    }

    function handlePrimaryUnitChange(u: UnitOption) {
        setPrimaryUnit(u);
        if (u.label === secondaryUnit.label) {
            const fallback = units.find(o => o.label !== u.label);
            if (fallback) setSecondaryUnit(fallback);
        }
    }

    function handleSecondaryUnitChange(u: UnitOption) {
        setSecondaryUnit(u);
        if (u.label === primaryUnit.label) {
            const fallback = units.find(o => o.label !== u.label);
            if (fallback) setPrimaryUnit(fallback);
        }
    }

    return (
        <div className={`w-67 bg-white p-6 rounded-3xl shadow-md ${isLocked ? "ring-2 ring-blue-400" : ""}`}>
            <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</p>
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
                                onMouseDown={(e) => { e.preventDefault(); startHold(primaryUnit.step); }}
                                onMouseUp={stopHold}
                                onMouseLeave={stopHold}
                                onTouchStart={(e) => { e.preventDefault(); startHold(primaryUnit.step); }}
                                onTouchEnd={stopHold}
                                className="flex-1 w-6 hover:bg-gray-200 active:bg-gray-300 text-gray-400 hover:text-gray-600 flex items-center justify-center select-none cursor-pointer text-xs transition-colors border-b border-gray-200"
                            >+</button>
                            <button
                                onMouseDown={(e) => { e.preventDefault(); startHold(-primaryUnit.step); }}
                                onMouseUp={stopHold}
                                onMouseLeave={stopHold}
                                onTouchStart={(e) => { e.preventDefault(); startHold(-primaryUnit.step); }}
                                onTouchEnd={stopHold}
                                className="flex-1 w-6 hover:bg-gray-200 active:bg-gray-300 text-gray-400 hover:text-gray-600 flex items-center justify-center select-none cursor-pointer text-xs transition-colors"
                            >−</button>
                        </div>
                    )}
                    <input
                        type="text"
                        inputMode={displayMode === "time" ? "text" : "decimal"}
                        value={focused ? inputVal : fmt(primaryVal, displayMode)}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onWheel={handleWheel}
                        readOnly={isLocked}
                        className={`text-4xl font-bold tabular-nums h-12 bg-transparent px-3 py-1 outline-none text-center w-full min-w-0 ${isLocked ? "text-blue-500 cursor-default" : ""
                            }`}
                    />
                </div>
                <UnitDropdown options={units} selected={primaryUnit} onChange={handlePrimaryUnitChange} />
            </div>

            <div className="mb-4" style={{ height: "20px" }}>
                {!isLocked && (
                    <input
                        type="range" min={0} max={1} step={0.001} value={t}
                        draggable={false}
                        onChange={handleSlider}
                        className="w-full"
                    />
                )}
            </div>

            <div className="border-t border-gray-100 pt-3 text-sm text-gray-400 tabular-nums flex items-center justify-between">
                <span>= {fmt(secondaryVal, secondaryUnit.displayMode)}</span>
                <UnitDropdown options={units} selected={secondaryUnit} onChange={handleSecondaryUnitChange} />
            </div>
        </div>
    );
}