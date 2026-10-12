import React from "react";
import { FaSearch, FaBuilding, FaFilter, FaSortAmountDown } from "react-icons/fa";

const selectClass = "w-full min-w-0 bg-transparent text-sm font-medium text-slate-700 outline-none";
const shellClass = "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100";

export default function ContractFilters(props) {
  const { searchTerm, setSearchTerm, divisionFilter, setDivisionFilter, statusFilter, setStatusFilter, sortBy, setSortBy, subFilter, setSubFilter, uniqueDivisions } = props;
  return (
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-slate-800">Find contracts</h2><span className="text-xs text-slate-400">Search · Filter · Sort</span></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className={shellClass}><FaSearch className="shrink-0 text-slate-400" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search file, work, contract..." className="w-full bg-transparent text-sm outline-none" /></label>
        <label className={shellClass}><FaBuilding className="shrink-0 text-slate-400" /><select value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)} className={selectClass}><option value="All">All divisions</option>{uniqueDivisions.map(div => <option key={div} value={div}>{div}</option>)}</select></label>
        <label className={shellClass}><FaFilter className="shrink-0 text-slate-400" /><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClass}><option value="All">All statuses</option><option value="Active">Active</option><option value="extended">Extended</option><option value="Completed">Completed</option><option value="Closed">Closed</option><option value="Pending">Pending</option></select></label>
        <label className={shellClass}><FaSortAmountDown className="shrink-0 text-slate-400" /><select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectClass}><option value="all">Default order</option><option value="date-desc">Newest contract first</option><option value="date-asc">Oldest contract first</option><option value="value-desc">Value: high to low</option><option value="value-asc">Value: low to high</option></select></label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {[["All", "All owners"], ["sub", "Only SUB"], ["removeSub", "Exclude SUB"]].map(([value, label]) =>
          <button type="button" key={value} onClick={() => setSubFilter(value)} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${subFilter === value ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{label}</button>
        )}
      </div>
    </section>
  );
}
