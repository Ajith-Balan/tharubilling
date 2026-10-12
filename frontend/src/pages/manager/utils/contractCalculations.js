import { parseLocalDate, safeNumber } from "./contractFormatters";

export const getDateCompletionPercentage = contract => {
  if (!contract?.startdate || !contract?.enddate) return 0;
  const start = parseLocalDate(contract.startdate);
  const originalEnd = parseLocalDate(contract.enddate);
  if (!start || !originalEnd) return 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today < start) return 0;

  const extension = parseLocalDate(contract.extension);
  const end = extension || originalEnd;
  const msDay = 86400000;
  const originalDays = Math.max(1, Math.floor((originalEnd - start) / msDay));

  if (today >= end) {
    if (!extension) return 100;
    return Math.max(100, Math.round((Math.max(1, Math.floor((end - start) / msDay)) / originalDays) * 100));
  }

  const elapsed = Math.floor((today - start) / msDay);
  const duration = Math.max(1, Math.floor((end - start) / msDay));
  return Math.max(0, Math.round((elapsed / duration) * 100));
};

export const getContractBillingMetrics = (contract, contractBills = []) => {
  const empty = {
    lastBillToDate: null, actualBilledAmount: 0, currentBillableValue: 0,
    balanceToBill: 0, requiredDailyRate: 0, billableToDatePercentage: 0, isExpired: false
  };
  if (!contract?.startdate || !contract?.enddate) return empty;

  const start = parseLocalDate(contract.startdate);
  const originalEnd = parseLocalDate(contract.enddate);
  const extension = parseLocalDate(contract.extension);
  const effectiveEnd = extension || originalEnd;
  if (!start || !originalEnd || !effectiveEnd) return empty;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isExpired = today >= effectiveEnd;
  const baseValue = safeNumber(contract.contractvalue);
  const totalValue = baseValue + safeNumber(contract.extendedvalue);
  const actualBilledAmount = contractBills.reduce((sum, bill) => sum + safeNumber(bill.totalamount), 0);

  let lastBillToDate = null;
  contractBills.forEach(bill => {
    const raw = bill.billto || bill.billpassdt || bill.billdate || bill.date || bill.createdAt;
    const parsed = parseLocalDate(raw);
    if (parsed && (!lastBillToDate || parsed > lastBillToDate)) lastBillToDate = parsed;
  });

  let currentBillableValue = actualBilledAmount;
  let requiredDailyRate = 0;

  if (totalValue > 0) {
    const totalDays = Math.max(1, Math.floor((effectiveEnd - start) / 86400000) + 1);
    requiredDailyRate = totalValue / totalDays;

    // Projection only applies to active contracts; expired contracts remain actual-only.
    if (!isExpired) {
      const calculationEnd = today < effectiveEnd ? today : effectiveEnd;
      const unbilledStart = lastBillToDate
        ? new Date(lastBillToDate.getFullYear(), lastBillToDate.getMonth(), lastBillToDate.getDate() + 1)
        : start;
      let unbilledDays = 0;
      if (unbilledStart <= calculationEnd) {
        unbilledDays = Math.floor((calculationEnd - unbilledStart) / 86400000) + 1;
      }
      currentBillableValue = actualBilledAmount + unbilledDays * requiredDailyRate;
    }
  }

  const balanceToBill = Math.max(0, totalValue - currentBillableValue);
  const billableToDatePercentage = totalValue > 0
    ? Math.round((currentBillableValue / totalValue) * 100)
    : 0;

  return {
    lastBillToDate, actualBilledAmount, currentBillableValue,
    balanceToBill, requiredDailyRate, billableToDatePercentage, isExpired
  };
};
