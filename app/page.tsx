import Sidebar from "../components/ui/Sidebar";
import SliderCard from "../components/ui/SliderCard";
import SidebarHeader from "./components/SidebarHeader";

export default function Page() {
    return (<div className="flex h-screen bg-gray-50">
        <Sidebar>
            <SidebarHeader/>
            <div className="bg-red-200">hi</div>
        </Sidebar>
        <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-8">
                <SliderCard />
                <SliderCard />
            </div>
        </div>
        
    </div>) 
}