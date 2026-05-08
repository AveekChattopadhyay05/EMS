import React from "react";
import { NavLink } from "react-router-dom";
import {FaBuilding, FaCalendar, FaCogs, FaMoneyBillWave, FaTachometerAlt, FaUser, FaUsers} from 'react-icons/fa'

export default function AdminSidebar(){
    return(
        <>
        <div className="bg-gray-800 text-white h-screen fixed left-0 top-0 bottom-0 space-y-2 w-64">
            <div className="bg-teal-600 h-12 flex items-center justify-center">
                <h3 className="text-2x1 text-enter">Employee MS</h3>
            </div>
            <div>
                <NavLink to="/admin-dashboard"
                className="flex items-center space-x-4 block py-2.5 px-4 rounder">
                 <FaTachometerAlt/>
                 <span>Dashboard</span>
                </NavLink>
                <NavLink to="/admin-dashboard/employees"
  className="flex items-center space-x-4 block py-2.5 px-4 rounded">
  <FaUsers />
  <span>Employee</span>
</NavLink>

<NavLink to="/admin-dashboard/departments"
  className="flex items-center space-x-4 block py-2.5 px-4 rounded">
  <FaBuilding />
  <span>Department</span>
</NavLink>
 <NavLink to="/admin-dashboard/leads"
  className="flex items-center space-x-4 block py-2.5 px-4 rounded">
  <FaUsers />
  <span>Leads</span>
</NavLink>

<NavLink to="/admin-dashboard/leaves"
  className="flex items-center space-x-4 block py-2.5 px-4 rounded">
  <FaCalendar />
  <span>Leave</span>
</NavLink>
<NavLink to="/admin-dashboard/manage-leaves"
  className="flex items-center space-x-4 block py-2.5 px-4 rounded">
  <FaCalendar />
  <span>Approve Leave</span>
</NavLink>

<NavLink to="/admin-dashboard/salaries"
  className="flex items-center space-x-4 block py-2.5 px-4 rounded">
  <FaMoneyBillWave />
  <span>Salary</span>
</NavLink>

<NavLink to="/admin-dashboard/settings"
  className="flex items-center space-x-4 block py-2.5 px-4 rounded">
  <FaCogs />
  <span>Settings</span>
</NavLink>

            </div>
        </div>
        </>
    )
}