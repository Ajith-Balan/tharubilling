import React from "react";
import { getDateCompletionPercentage, getContractBillingMetrics } from "../utils/contractCalculations";
import { formatDate, formatINR } from "../utils/contractFormatters";

const timelineColor = value => value >= 100 ? "bg-violet-600" : value >= 75 ? "bg-rose-500" : value >= 50 ? "bg-amber-500" : "bg-indigo-500";
const billingColor = value => value >= 100 ? "bg-emerald-600" : value >= 75 ? "bg-teal-500" : value >= 50 ? "bg-blue-500" : "bg-sky-500";

function ProgressLine({ label, value, color }) {
  return <div>
    <div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="text-slate-500">{label}</span><strong className="text-slate-700">{value}%</strong></div>
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
  </div>;
}

export default function ContractProgress({ contract, contractBills }) {
  const metrics = getContractBillingMetrics(contract, contractBills);
  const dateProgress = getDateCompletionPercentage(contract);
  return <div className="min-w-[220px] space-y-3">
    <ProgressLine label={`Timeline · ${formatDate(contract.extension || contract.enddate)}`} value={dateProgress} color={timelineColor(dateProgress)} />
    <ProgressLine label="Billable to date" value={metrics.billableToDatePercentage} color={billingColor(metrics.billableToDatePercentage)} />
    <div className="flex flex-wrap gap-1.5">
      <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-800">Actual {formatINR(metrics.actualBilledAmount)}</span>
      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">Balance {formatINR(metrics.balanceToBill)}</span>
    </div>
    {!metrics.isExpired && <div className="space-y-1 border-t border-slate-100 pt-2 text-[11px]">
      {metrics.lastBillToDate && <div className="flex justify-between gap-2"><span className="text-slate-400">Last bill to</span><span className="font-medium text-slate-700">{formatDate(metrics.lastBillToDate)}</span></div>}
      <div className="flex justify-between gap-2"><span className="text-slate-400">Unbilled projection</span><span className="font-medium text-slate-700">{formatINR(metrics.currentBillableValue - metrics.actualBilledAmount)}</span></div>
      <div className="flex justify-between gap-2"><span className="text-slate-400">Billed + projected</span><span className="font-semibold text-slate-800">{formatINR(metrics.currentBillableValue)}</span></div>
    </div>}
  </div>;
}
