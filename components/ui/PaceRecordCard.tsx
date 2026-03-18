import { X } from "lucide-react";

interface PaceRecordCardProps {
    id: string;
    title: string;
    distance: number | null;
    pace: number | null;
    time: number | null;
    onDelete: (id: string) => void
}

function fmtTime(seconds: number | null): string {
    if (!seconds) return "N/A"
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtPace(mps: number | null): string {
    // m/s to min/km
    if (!mps) return "N/A"
    const minPerKm = 1000 / (mps * 60);
    const m = Math.floor(minPerKm);
    const s = Math.round((minPerKm - m) * 60);
    return `${m}:${String(s).padStart(2, "0")} /km`;
}

function fmtDistance(meters: number | null): string {
    if (!meters) return "N/A"
    if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
    return `${Math.round(meters)} m`;
}



export default function PaceRecordCard({ id, title, distance, pace, time, onDelete }: PaceRecordCardProps) {
    return (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col gap-2 m-1 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700 truncate">{title}</p>
                <button
                    onClick={() => onDelete(id)}
                    className="group-hover:opacity-100 text-gray-300 hover:text-red-400 hover:scale-[1.1] transition-all shrink-0 ml-2"
                >
                    <X/>
                </button>
            </div>
            <div className="flex justify-between">
                <div className="flex-col items-start ">
                    <div className="text-gray-400 text-xs">
                        Pace
                    </div>
                    <div className="text-gray-700 text-sm">
                        <span>{fmtPace(pace)}</span>
                    </div>
                </div>
                <div className="flex-col items-start ">
                    <div className="text-gray-400 text-xs">
                        Distance
                    </div>
                    <div className="text-gray-700 text-sm">
                        <span>{fmtDistance(distance)}</span>
                    </div>
                </div>
                <div className="flex-col items-start ">
                    <div className="text-gray-400 text-xs">
                        Time
                    </div>
                    <div className="text-gray-700 text-sm">
                        <span>{fmtTime(time)}</span>
                    </div>
                </div>
                
                
            </div>
        </div>
    );
}