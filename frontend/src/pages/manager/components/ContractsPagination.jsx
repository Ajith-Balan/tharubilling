import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function ContractsPagination({ currentPage, totalPages, setCurrentPage }) {
  if (totalPages <= 1) return null;
  return <nav aria-label="Contract pages" className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
    <button onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><FaChevronLeft /> <span className="hidden sm:inline">Previous</span></button>
    <div className="text-center text-sm text-slate-500">Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong></div>
    <button onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><span className="hidden sm:inline">Next</span> <FaChevronRight /></button>
  </nav>;
}
