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
import DebugTree from './components/leads/DebugTree';
import SetupAccount from './pages/SetupAccount';
import LeadDashbooard from './pages/LeadDashboard';
import EmpLeave from './pages/EmpLeave';
import LeadLeave from './pages/LeadLeave'
import LeadApprove from './pages/LeadApprove';
import EditLeadPassword from './components/leads/EditLeadPassword';
import ForgotPassword from './pages/ForgotPassword';
import AdminApprove from './pages/AdminApprove';
import ChatWidget from './AI-Service/ChatWidget';
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
    path:'/setup-account',
    element:<SetupAccount/>
  },
  {path:'/forgot-password',
    element:<ForgotPassword/>
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
      element:<DebugTree/>
    },
    {
      path:'add-lead',
      element:<AddLead/>
    },
    {
      path:'edit-lead/:email',
      element:<EditLead/>
    },
    {
      path:'reset-password',
      element:<EditLeadPassword/>

    },
    {
    path:'leaves',
    element:<Leave/>
  },
  {
    path:'manage-leaves',
    element:<AdminApprove/>
  }
  ]
}
,
  
  {
    path: '/employee-dashboard',
    element: (
      <ProtectedRoute role="employee">
        <EmployeeDashboard />
      </ProtectedRoute>
    ),
    children:[
      {
        path:'leaves',
        element:<EmpLeave/>
      }
    ]
  },
  {
    path: '/lead-dashboard',
    element: (
      <ProtectedRoute role="lead">
        <LeadDashbooard />
      </ProtectedRoute>
    ),
    children:[
      {
        path:'leaves',
        element:<LeadLeave/>
      },
      {
        path:'approve',
        element:<LeadApprove/>
      }
    ]
  },
],
);

function App() {
  return(
    <>
    <RouterProvider router={router} />
    
    </>
  ) ;
}

export default App;
