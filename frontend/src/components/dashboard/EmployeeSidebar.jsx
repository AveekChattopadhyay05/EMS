import React from "react";
import { NavLink } from "react-router-dom";
import {FaBuilding, FaCalendar, FaCogs, FaMoneyBillWave, FaTachometerAlt, FaUser, FaUsers} from 'react-icons/fa'
export default function EmployeeSidebar(){
    return(
        <>
        <div className="bg-gray-800 text-white h-screen fixed left-0 top-0 bottom-0 space-y-2 w-64">
            <div className="bg-teal-600 h-12 flex items-center justify-center">
                <h3 className="text-2x1 text-enter">Something</h3>
            </div>
            <div>
                <NavLink to="/employee-dashboard"
                className="flex items-center space-x-4 block py-2.5 px-4 rounder">
                 <FaTachometerAlt/>
                 <span>Dashboard</span>
                </NavLink>
                <NavLink to="/employee-dashboard/leaves"
                  className="flex items-center space-x-4 block py-2.5 px-4 rounded">
                  <FaCalendar />
                  <span>Manage My Leaves</span>
                </NavLink>
                
            </div>

        </div>
        </>
    )
}