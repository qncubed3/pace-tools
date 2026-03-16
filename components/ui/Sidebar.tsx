export default function Sidebar({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-card bg-white relative z-sidebar shrink-0 overflow-hidden w-[384px] h-full shadow">
            {children}
        </div>
    )
}