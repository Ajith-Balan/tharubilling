import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const BackButton = ({ label = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:shadow transition-all duration-200"
    >
      <FaArrowLeft className="text-slate-600" />
      <span className="font-medium text-slate-700">{label}</span>
    </button>
  );
};

export default BackButton;