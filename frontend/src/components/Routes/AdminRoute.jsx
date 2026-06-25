import { useState, useEffect } from "react";
import { useAuth } from "../../context/Auth.jsx";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner.jsx";

export default function AdminRoute() {
  const [ok, setOk] = useState(false);
  const [auth, setAuth] = useAuth();

  useEffect(() => {
    const authCheck = async () => {
        const res = await axios.get(`${import.meta.env.VITE_APP_BACKEND}/api/v1/auth/adminauth`)
        if (res.data.ok) {
          setOk(true);
        } else {
          setOk(false);
        }
      
      }
      if (auth?.token) authCheck();
    },[auth?.token]);
  

   return ok ?  <Outlet />: <Spinner /> // Show spinner while checking auth status
}
