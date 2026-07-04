import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';

import Home from './pages/home';
import About from './pages/About';
import Contact from './pages/Contact';
import Policy from './pages/Policy';
import Pagenotfound from './pages/Pagenotfound';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import Dashboard from './pages/user/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import PrivateRoute from './components/Routes/PrivateRoute';
import ManagerRoute from './components/Routes/AdminRoute';

import Forget from './pages/Auth/Forget';
import Managerhome from './pages/manager/Managerhome';
import Site from './components/Site';

import Billdetails from './pages/manager/Billdetails';
import Addbill from './pages/manager/Addbill';
import Addcontracts from './pages/manager/Addcontracts';
import Managerlogin from './pages/Auth/Managerlogin';
import Contracts from './pages/manager/Contracts';
import BillHistory from './pages/manager/BillHistory';
import EditContract from './pages/manager/EditContract';
import Profitability from './pages/manager/ProfitabilityPage';

function App() {
  return (
    <>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
        <Route path='/' element={<Site/>} />
        <Route path='/home' element={<Site/>} />
        {/* <Route path='/search' element={<SearchResult />} /> */}


        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forget' element={<Forget />} />
        <Route path='/managerlogin' element={<Managerlogin />} />
         {/* <Route path='/user/dashboard' element={<Dashboard />}  */}

     
   {/* Private Route Wrapper */}
   <Route path='/dashboard' element={<PrivateRoute />} >
          <Route path='user' element={<Dashboard />} />
          <Route path='user/addbills' element={<Addbill />} />




          </Route>


          <Route path='/dashboard' element={<ManagerRoute />} >
          <Route path='manager' element={<Managerhome />} />
          <Route path='manager/bills/:fileno' element={<Billdetails />} />
         <Route path='manager/addbills' element={<Addbill />} />
         <Route path='manager/createcontracts' element={<Addcontracts />} />
         <Route path='manager/contracts' element={<Contracts />} />
        <Route path='manager/billdetails' element={<BillHistory />} />
       <Route path='manager/editcon/:id' element={<EditContract />} />
       <Route path='manager/profitability' element={<Profitability />} />

         



        



          </Route>

          {/* <Route path='/addsupervisors' element={<Addsupervisor />} /> */}


          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/policy' element={<Policy />} />
          <Route path='*' element={<Pagenotfound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
