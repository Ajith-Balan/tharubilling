import React, { useState, useEffect } from "react";
import { useNavigate ,useLocation } from "react-router-dom";

const Spinner = () => {
  const [count, setCount] = useState(3);
  const navigate = useNavigate();
  const Location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevValue) => --prevValue);
    }, 1000);
    if (count === 0) {
      navigate('/login',{
        state: location.pathname
      });
    }
    return () => clearInterval(interval);
  }, [count, navigate, location]);

  return (
    <>
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold text-center mb-4">
          Redirecting you in {count} second{count !== 1 && "s"}
        </h1>
        <div className="relative w-16 h-16">
       
          <div className="absolute border-t-4 border-l-4 border-red-500 rounded-full w-8 h-8 animate-spin"></div>
        </div>
      </div>
    </>
  );
};

export default Spinner;
