"use client"

import { useSession } from "next-auth/react";
import Sidebar from "../components/ui/Sidebar";
import SliderCard from "../components/ui/SliderCard";
import SidebarHeader from "./components/SidebarHeader";

export default function Page() {
    const {data: session} = useSession()
    return (<div className="flex h-screen bg-gray-50">
        <Sidebar>
            <SidebarHeader/>
            <div className="bg-red-200">hi</div>
            <div>{session?.expires}</div>
        </Sidebar>
        <div className="flex-1 flex items-center justify-center space-x-24">
            <SliderCard
                title="pace"
                primaryFn={(t) => 3 + t * 10}
                invertFn={(miles) => (miles-3) / 10}
                convertFn={(minPerMile) => minPerMile / 1.60934}
                primaryUnit="min/mi"
                secondaryUnit="min/km"
                displayMode="time"
                step={1/60}
            />
            <SliderCard
                title="distance"
                primaryFn={(t) => t*30}
                invertFn={(miles) => miles/30}
                convertFn={(miles) => miles * 1.60934}
                primaryUnit="mi"
                secondaryUnit="km"
                displayMode="decimal"
                step={0.1}
            />
        </div>
        
    </div>) 
}