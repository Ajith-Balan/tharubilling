import React from "react";
import { getContractBillingMetrics } from "../utils/contractCalculations";
import { formatDate, formatINR } from "../utils/contractFormatters";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700",
  Completed: "bg-blue-50 text-blue-700",
  Closed: "bg-rose-50 text-rose-700",
  Pending: "bg-amber-50 text-amber-700",
  extended: "bg-sky-50 text-sky-700",
  Extended: "bg-sky-50 text-sky-700"
};

export default function ContractMobileCards({ contracts, matchedBills, onOpen }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
    {contracts.map(contract => {
      const relatedBills = matchedBills.filter(bill => bill.fileno === contract.fileno);
      const metrics = getContractBillingMetrics(contract, relatedBills);
      const percentage = metrics.billableToDatePercentage;
      const barColor = percentage >= 100 ? "bg-violet-600" : percentage >= 75 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-500" : "bg-sky-500";
      const penalty = relatedBills.reduce((sum, bill) => sum + (Number(bill.penalty) || 0), 0);
      return <article key={contract._id || contract.fileno} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && onOpen(contract.fileno)} onClick={() => onOpen(contract.fileno)} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md active:scale-[.99]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">File number</p><h3 className="mt-0.5 text-lg font-bold text-indigo-700">{contract.fileno || "N/A"}</h3></div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[contract.status] || "bg-slate-100 text-slate-600"}`}>{contract.status || "N/A"}</span>
        </div>
        <h4 className="mt-3 line-clamp-2 text-sm font-semibold capitalize text-slate-800">{contract.workname || "Name of work not provided"}</h4>
        <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-xs">
          <div className="flex justify-between gap-3"><span className="text-slate-400">Division</span><span className="text-right font-medium text-slate-700">{contract.division || "N/A"}</span></div>
          <div className="flex justify-between gap-3"><span className="text-slate-400">Manager</span><span className="text-right font-medium capitalize text-slate-700">{contract.managername || "N/A"}</span></div>
          <div className="flex justify-between gap-3"><span className="text-slate-400">Contract no.</span><span className="max-w-[65%] text-right font-medium text-slate-700">{contract.contractNumber || "N/A"}</span></div>
          <div className="flex justify-between gap-3"><span className="text-slate-400">Start date</span><span className="font-medium text-slate-700">{formatDate(contract.startdate)}</span></div>
          <div className="flex justify-between gap-3"><span className="text-slate-400">End date</span><span className="font-medium text-slate-700">{formatDate(contract.extension || contract.enddate)}</span></div>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="text-slate-500">Billable to date</span><strong className="text-slate-800">{percentage}%</strong></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} /></div>
          <div className="mt-2 flex justify-between gap-3 text-xs"><span className="text-slate-500">Projected value</span><strong>{formatINR(metrics.currentBillableValue)}</strong></div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          <div className="rounded-xl bg-blue-50 p-2.5"><p className="text-[10px] font-medium text-blue-600">Actual billed</p><p className="mt-1 text-sm font-bold text-blue-800">{formatINR(metrics.actualBilledAmount)}</p></div>
          <div className="rounded-xl bg-emerald-50 p-2.5"><p className="text-[10px] font-medium text-emerald-600">Balance to bill</p><p className="mt-1 text-sm font-bold text-emerald-800">{formatINR(metrics.balanceToBill)}</p></div>
        </div>
        {penalty > 0 && <p className="mt-3 text-xs font-semibold text-rose-600">Penalty recorded: {formatINR(penalty)}</p>}
      </article>;
    })}
  </div>;
}
