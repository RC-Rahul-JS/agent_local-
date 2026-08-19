import { useEffect, useState } from 'react'
import './App.css'
import Home from './Components/Home'
import TPIN from './Components/TPIN'
import { BrowserRouter as Router, Routes,Route, useNavigate, Navigate } from 'react-router-dom'
import MemberApplicationForm from './routes/Addmember'
import ApplyLoan from './routes/ApplyLoan'
import LoanList from './routes/LoanList'
import LoanDetails from './routes/LoanDetails'
import ViewCommission from './routes/ViewCommission'
import ApplyAgent from './routes/ApplyAgent'
import ChangePassword from './routes/ChangePassword'
import MembershipFee from './routes/MembershipFee'
import Login from './routes/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Requests from './routes/Requests'
import MemberList from './routes/MemberList'
import MemberDetails from './routes/MemberDetails'
import AgentHierarchyView from './routes/AgentHierarchyView'
import AgentList from './routes/AgentList'
import FirstMembershipFee from './routes/FirstMembershipFee'
import TPINManager from './routes/TPINManager'



import ViewCommission1 from './routes/vc2'
import DrAppoint from './routes/DrAppoint'
import AppointlmentList from './routes/AppointlmentList'

import Swal from 'sweetalert2';


function App() {
    const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('AUID');
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

   





  return (
    <>
      <Router>

      <ToastContainer/>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/addmember"
          element={
            <PrivateRoute>
              <MemberApplicationForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/applyloan"
          element={
            <PrivateRoute>
              <ApplyLoan />
            </PrivateRoute>
          }
        />
        <Route
          path="/loanlist"
          element={
            <PrivateRoute>
              <LoanList />
            </PrivateRoute>
          }
        />
        <Route
          path="/loandetails"
          element={
            <PrivateRoute>
              <LoanDetails />
            </PrivateRoute>
          }
        />
        {/* <Route
          path="/commission"
          element={
            <PrivateRoute>
              <ViewCommission />
            </PrivateRoute>
          }
        /> */}
        <Route
          path="/commission"
          element={
            <PrivateRoute>
              <ViewCommission1 />
            </PrivateRoute>
          }
        />
        <Route
          path="/agent"
          element={
            <PrivateRoute>
              <ApplyAgent />
            </PrivateRoute>
          }
        />
        <Route
          path="/change"
          element={
            <PrivateRoute>
              <ChangePassword />
            </PrivateRoute>
          }
        />
        <Route
          path="/membershipfee"
          element={
            <PrivateRoute>
              <MembershipFee />
            </PrivateRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <PrivateRoute>
              <Requests />
            </PrivateRoute>
          }
        />
         <Route
          path="/memberlist"
          element={
            <PrivateRoute>
              <MemberList />
            </PrivateRoute>
          }
        />
         <Route
          path="/member_details"
          element={
            <PrivateRoute>
              <MemberDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/firstmemberfee"
          element={
            <PrivateRoute>
              <FirstMembershipFee />
            </PrivateRoute>
          }
        />
        <Route
          path="/agentsview"
          element={
            <PrivateRoute>
              <AgentHierarchyView />
            </PrivateRoute>
          }
        />
        <Route
          path="/agentlist"
          element={
            <PrivateRoute>
              <AgentList />
            </PrivateRoute>
          }
        />
        <Route
          path="/tpin"
          element={
            <PrivateRoute>
              <TPIN/>
            </PrivateRoute>
          }
        />
        <Route
          path="/tpin_manage"
          element={
            <PrivateRoute>
              <TPINManager/>
            </PrivateRoute>
          }
        />
        <Route
          path="/dr_appointment"
          element={
            <PrivateRoute>
              <DrAppoint/>
            </PrivateRoute>
          }
        />
        <Route
          path="/appointment_list"
          element={
            <PrivateRoute>
              <AppointlmentList/>
            </PrivateRoute>
          }
        />
        {/* Fallback to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
