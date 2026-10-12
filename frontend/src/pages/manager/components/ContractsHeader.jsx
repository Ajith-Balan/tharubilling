import React from "react";
import { FaFileExcel, FaSyncAlt } from "react-icons/fa";

export default function ContractsHeader({ count, onExport, onRefresh }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Tharu & Sons / Operations</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Contract Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor contract timelines, billing progress and outstanding value.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={onRefresh} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
          <FaSyncAlt /> Refresh
        </button>
        <button onClick={onExport} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
          <FaFileExcel className="text-lg" /> Export Excel ({count})
        </button>
      </div>
    </header>
  );
}
