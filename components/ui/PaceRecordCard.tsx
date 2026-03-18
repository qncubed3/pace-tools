interface PaceRecordCardProps {
    title: string;
    distance: number;
    pace: number;
    time: number;
}

function fmtTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtPace(mps: number): string {
    // m/s to min/km
    const minPerKm = 1000 / (mps * 60);
    const m = Math.floor(minPerKm);
    const s = Math.round((minPerKm - m) * 60);
    return `${m}:${String(s).padStart(2, "0")} /km`;
}

function fmtDistance(meters: number): string {
    if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
    return `${Math.round(meters)} m`;
}

export default function PaceRecordCard({ title, distance, pace, time }: PaceRecordCardProps) {
    return (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col gap-2 m-1 shadow-sm">
            <p className="text-lg font-semibold text-gray-900 truncate">{title}</p>
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