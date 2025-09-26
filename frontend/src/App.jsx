import React from 'react';
import './App.css';
import Login from './pages/Login';
import Leave from './pages/Leave';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; 
import PrivateRoutes from './utils/PrivateRoutes';
import RoleBasedRoutes from './utils/RoleBasedRoutes';
import AdminSummary from './components/AdminSummary';
import DepartmentList from './components/departments/DepartmentList';
import AddDepartment from './components/departments/AddDepartment';
import EditDepartment from './components/departments/EditDepartment';
import EmployeeList from './components/employee/EmployeeList';
import AddEmployee from './components/employee/AddEmployee';
import EditEmployee from './components/employee/EditEmployee';
import LeadsList from './components/leads/LeadsList';
import AddLead from './components/leads/AddLead';
import EditLead from './components/leads/EditLead';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/login' />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
  path: '/admin-dashboard',
  element: (
    <ProtectedRoute role="admin">
      <PrivateRoutes>
        <RoleBasedRoutes requiredRole={["admin"]}>
          <AdminDashboard />
        </RoleBasedRoutes>
      </PrivateRoutes>
    </ProtectedRoute>
  ),
  children:[
    {
      index:true,
      element:<AdminSummary/>
    },
    {
      path:'departments',
      element:<DepartmentList/>
    },
    {
      path:'add-department',
      element:<AddDepartment/>
    },
    {
      path:'department/:id',
      element:<EditDepartment/>
    },
    {
      path:'employees',
      element:<EmployeeList/>
    },
    {
      path:'add-employee',
      element:<AddEmployee/>
    },
    {
      path:'employee/:id',
      element:<EditEmployee/>
    },
    {
      path:'leads',
      element:<LeadsList/>
    },
    {
      path:'add-lead',
      element:<AddLead/>
    },
    {
      path:'edit-lead/:email',
      element:<EditLead/>
    }
  ]
}
,
  {
    path:'/leaves',
    element:<Leave/>
  },
  {
    path: '/employee-dashboard',
    element: (
      <ProtectedRoute role="employee">
        <EmployeeDashboard />
      </ProtectedRoute>
    )
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
