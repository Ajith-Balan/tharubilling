import React, { useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa";

export default function ContractNotifications({ notifications, open, onToggle, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = event => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="mb-4 flex justify-end" ref={ref}>
      <div className="relative">
        <button onClick={onToggle} aria-label="Toggle contract notifications" className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50">
          <FaBell />
          {notifications.length > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">{notifications.length}</span>}
        </button>
        {open && <div className="absolute right-0 z-30 mt-2 w-[min(90vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div><p className="font-semibold">Billing alerts</p><p className="text-xs text-white/70">Active contracts at 100% or above</p></div>
            <span className="rounded-full bg-white/15 px-2 py-1 text-xs">{notifications.length}</span>
          </div>
          {!notifications.length ? <div className="p-8 text-center text-sm text-slate-500">All clear — no billing alerts.</div> :
            <div className="max-h-80 overflow-y-auto">
              {notifications.map(item => <div key={item.fileno} className="border-b border-slate-100 p-4 last:border-0">
                <p className="font-semibold text-slate-800">{item.fileno}{item.contractNumber ? ` · ${item.contractNumber}` : ""}</p>
                <p className="mt-1 text-sm text-slate-500">Billable-to-date reached <strong className="text-rose-600">{item.percentage}%</strong>.</p>
              </div>)}
            </div>}
        </div>}
      </div>
    </div>
  );
}
