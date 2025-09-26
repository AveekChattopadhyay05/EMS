import { useAuth } from "../context/AuthContext"
import AdminSidebar from "../components/dashboard/AdminSidebar"
import Navbar from "../components/dashboard/Navbar"
import AdminSummary from "../components/AdminSummary"
import { Outlet } from "react-router-dom"
export default function AdminDashboard(){
    const {user}=useAuth()
    return(
        <>
        <div className="flex">
        <AdminSidebar/>
        <div className="flex-1 ml-64 bg-gray-100 h-screen">
            <Navbar/>
           <Outlet/>
        </div>
        </div>
        
        </>
    )
}
