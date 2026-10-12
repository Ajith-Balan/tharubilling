export const parseLocalDate = value => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const formatDate = value => {
  const date = parseLocalDate(value);
  return date ? date.toLocaleDateString("en-GB").replace(/\//g, "-") : "N/A";
};

export const formatINR = value =>
  `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

export const safeNumber = value => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const getContractMonths = (startDate, endDate) => {
  if (!startDate || !endDate) return "";
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return "";
  return (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
};
