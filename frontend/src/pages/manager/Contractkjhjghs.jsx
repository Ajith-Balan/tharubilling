import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import BackButton from "../../components/layout/BackButton";
import { useNavigate } from "react-router-dom";
import { useContracts } from "./hooks/useContracts";
import { exportContractsExcel } from "./services/exportContractsExcel";
import { formatDate, formatINR } from "./utils/contractFormatters";
import ContractsHeader from "./components/ContractsHeader";
import ContractStats from "./components/ContractStats";
import ContractNotifications from "./components/ContractNotifications";
import ContractFilters from "./components/ContractFilters";
import ContractsTable from "./components/ContractsTable";
import ContractMobileCards from "./components/ContractMobileCards";
import ContractsPagination from "./components/ContractsPagination";

export default function Contracts() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    loading, contracts, bills, searchTerm, setSearchTerm,
    statusFilter, setStatusFilter, divisionFilter, setDivisionFilter,
    subFilter, setSubFilter, sortBy, setSortBy, currentPage,
    setCurrentPage, sortedContracts, currentDisplayedContracts,
    totalPages, uniqueDivisions, matchedBills, contractNotifications,
    aggregateMetrics, refreshContracts
  } = useContracts();

  const handleExport = async () => {
    await exportContractsExcel(sortedContracts, bills);
  };

  if (loading) {
    return (
      <Layout title="Contract & Bill Management - Manager">
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 animate-pulse">
          <div className="h-9 w-64 rounded-lg bg-slate-200 mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-200" />)}
          </div>
          <div className="h-72 rounded-2xl bg-slate-200" />
        </main>
      </Layout>
    );
  }

  return (
    <Layout title="Contract & Bill Management - Manager">
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1800px] p-3 sm:p-5 lg:p-7">
          <BackButton />
          <ContractsHeader
            count={sortedContracts.length}
            onExport={handleExport}
            onRefresh={refreshContracts}
          />

          <ContractStats
            contracts={sortedContracts}
            metrics={aggregateMetrics}
          />

          <ContractNotifications
            notifications={contractNotifications}
            open={showNotifications}
            onToggle={() => setShowNotifications(v => !v)}
            onClose={() => setShowNotifications(false)}
          />

          <ContractFilters
            searchTerm={searchTerm}
            setSearchTerm={value => { setSearchTerm(value); setCurrentPage(1); }}
            divisionFilter={divisionFilter}
            setDivisionFilter={value => { setDivisionFilter(value); setCurrentPage(1); }}
            statusFilter={statusFilter}
            setStatusFilter={value => { setStatusFilter(value); setCurrentPage(1); }}
            sortBy={sortBy}
            setSortBy={value => { setSortBy(value); setCurrentPage(1); }}
            subFilter={subFilter}
            setSubFilter={value => { setSubFilter(value); setCurrentPage(1); }}
            uniqueDivisions={uniqueDivisions}
          />

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
            <span>
              Showing {sortedContracts.length ? (currentPage - 1) * 100 + 1 : 0}–
              {Math.min(currentPage * 100, sortedContracts.length)} of {sortedContracts.length} contracts
            </span>
            <span className="text-xs">Select a contract to open its bills</span>
          </div>

          {currentDisplayedContracts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <span className="text-2xl">⌕</span>
              </div>
              <h3 className="font-semibold text-slate-800">No contracts found</h3>
              <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
            </div>
          ) : (
            <>
              <ContractsTable
                contracts={currentDisplayedContracts}
                matchedBills={matchedBills}
                onOpen={fileno => navigate(`/dashboard/manager/bills/${fileno}`)}
                formatDate={formatDate}
              />
              <ContractMobileCards
                contracts={currentDisplayedContracts}
                matchedBills={matchedBills}
                onOpen={fileno => navigate(`/dashboard/manager/bills/${fileno}`)}
                formatDate={formatDate}
              />
            </>
          )}

          <ContractsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </main>
    </Layout>
  );
}
