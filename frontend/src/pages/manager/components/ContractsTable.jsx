import React from "react";
import ContractProgress from "./ContractProgress";
import { formatDate, formatINR } from "../utils/contractFormatters";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-800",
  Completed: "bg-blue-50 text-blue-800",
  Closed: "bg-rose-50 text-rose-800",
  Pending: "bg-amber-50 text-amber-800",
  extended: "bg-sky-50 text-sky-800",
  Extended: "bg-sky-50 text-sky-800"
};

export default function ContractsTable({ contracts, matchedBills, onOpen }) {
  return <div className="mb-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
    <div className="overflow-x-auto">
      <table className="min-w-[1250px] w-full text-left text-sm">
        <thead className="bg-slate-100 text-[11px] uppercase tracking-wide text-slate-600">
          <tr>{["File no.", "Division", "Name of work", "Manager / owner", "Contract number", "Contract value", "Started on", "Validity / progress", "Extension", "Status"].map(label => <th key={label} className="border-b border-slate-200 px-4 py-3 font-bold">{label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {contracts.map(contract => {
            const contractBills = matchedBills.filter(bill => bill.fileno === contract.fileno);
            return <tr key={contract._id || contract.fileno} onClick={() => onOpen(contract.fileno)} className="cursor-pointer transition hover:bg-indigo-50/40">
              <td className="whitespace-nowrap px-4 py-4 font-bold text-indigo-700">{contract.fileno || "N/A"}</td>
              <td className="px-4 py-4 text-slate-600">{contract.division || "N/A"}</td>
              <td className="max-w-[260px] px-4 py-4 font-medium text-slate-800"><p className="line-clamp-2 capitalize">{contract.workname || "N/A"}</p></td>
              <td className="px-4 py-4"><p className="font-medium capitalize text-slate-700">{contract.managername || "N/A"}</p>{contract.owner && <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">{contract.owner}</span>}</td>
              <td className="max-w-[180px] break-words px-4 py-4 text-slate-600">{contract.contractNumber || "N/A"}</td>
              <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">{formatINR(contract.contractvalue)}</td>
              <td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatDate(contract.startdate)}</td>
              <td className="px-4 py-4"><ContractProgress contract={contract} contractBills={contractBills} /></td>
              <td className="px-4 py-4 text-slate-600">{contract.extension ? <div><p>{formatDate(contract.extension)}</p>{Number(contract.extendedvalue) > 0 && <p className="mt-1 text-xs font-semibold text-amber-700">+ {formatINR(contract.extendedvalue)}</p>}</div> : "—"}</td>
              <td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[contract.status] || "bg-slate-100 text-slate-700"}`}>{contract.status || "N/A"}</span></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </div>;
}
