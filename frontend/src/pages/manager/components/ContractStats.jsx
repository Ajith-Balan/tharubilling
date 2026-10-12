import React from "react";
import { FaFolderOpen, FaCheckCircle, FaClipboardCheck, FaTimesCircle, FaFileInvoiceDollar, FaChartLine, FaWallet, FaHourglassHalf } from "react-icons/fa";
import { formatINR } from "../utils/contractFormatters";

const cards = [
  { key: "total", label: "Total Contracts", icon: FaFolderOpen, color: "from-violet-600 to-indigo-600", note: "Matching current filters" },
  { key: "active", label: "Active", icon: FaCheckCircle, color: "from-emerald-500 to-green-600", note: "Currently running" },
  { key: "extended", label: "Extended", icon: FaClipboardCheck, color: "from-sky-500 to-cyan-600", note: "Extension status" },
  { key: "completed", label: "Completed", icon: FaCheckCircle, color: "from-blue-500 to-indigo-600", note: "Finished contracts" },
  { key: "closed", label: "Closed", icon: FaTimesCircle, color: "from-rose-500 to-red-600", note: "Inactive contracts" },
];

export default function ContractStats({ contracts, metrics }) {
  const values = {
    total: contracts.length,
    active: contracts.filter(c => c.status?.toLowerCase() === "active").length,
    extended: contracts.filter(c => c.status?.toLowerCase() === "extended").length,
    completed: contracts.filter(c => c.status?.toLowerCase() === "completed").length,
    closed: contracts.filter(c => c.status?.toLowerCase() === "closed").length
  };
  const financial = [
    { label: "Actual Billed", value: metrics.totalBilled, note: "Total of recorded bills", icon: FaFileInvoiceDollar, color: "from-blue-600 to-indigo-700" },
    { label: "Billable to Date", value: metrics.totalBillableToDate, note: "Recorded + projected to today", icon: FaChartLine, color: "from-amber-500 to-orange-600" },
    { label: "Balance to Bill", value: metrics.totalBalanceToBill, note: "Remaining contract value", icon: FaWallet, color: "from-teal-500 to-emerald-600" },
    { label: "Unbilled Projection", value: metrics.totalBillableToDate - metrics.totalBilled, note: "Projected amount not yet billed", icon: FaHourglassHalf, color: "from-fuchsia-600 to-purple-700" }
  ];
  return (
    <section className="mb-7">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map(card => {
          const Icon = card.icon;
          return <article key={card.key} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-4 text-white shadow-sm`}>
            <Icon className="absolute -right-2 -top-2 text-6xl opacity-15" />
            <p className="text-xs font-semibold text-white/85">{card.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{values[card.key]}</p>
            <p className="mt-2 text-[11px] text-white/75">{card.note}</p>
          </article>;
        })}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {financial.map(item => {
          const Icon = item.icon;
          return <article key={item.label} className={`rounded-2xl bg-gradient-to-br ${item.color} p-4 text-white shadow-sm`}>
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-semibold text-white/80">{item.label}</p><p className="mt-2 text-xl font-bold sm:text-2xl">{formatINR(item.value)}</p></div>
              <span className="rounded-xl bg-white/15 p-2"><Icon /></span>
            </div>
            <p className="mt-2 text-[11px] text-white/75">{item.note}</p>
          </article>;
        })}
      </div>
    </section>
  );
}
