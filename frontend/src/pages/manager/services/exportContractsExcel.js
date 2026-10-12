import ExcelJS from "exceljs";
import { toast } from "react-toastify";
import { getContractBillingMetrics } from "../utils/contractCalculations";
import { getContractMonths, safeNumber } from "../utils/contractFormatters";

export async function exportContractsExcel(contracts = [], allBills = []) {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "THARU & SONS";
    workbook.lastModifiedBy = "THARU & SONS";
    workbook.created = new Date();
    workbook.modified = new Date();

    const C = { yellow: "FFC000", green: "C6E0B4", blue: "0000FF", red: "FF0000", white: "FFFFFF", grey: "D9E1F2" };
    const border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } }
    };
    const moneyFormat = "#,##0";
    const asExcelDate = value => {
      if (!value) return "";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? String(value) : date;
    };
    const sheetNameFor = (name, used) => {
      let base = String(name || "Contract").replace(/[:\\/?*\[\]]/g, "-").replace(/^'+|'+$/g, "").substring(0, 31) || "Contract";
      let result = base;
      let index = 1;
      while (used.has(result.toLowerCase())) {
        const suffix = `-${index++}`;
        result = base.substring(0, 31 - suffix.length) + suffix;
      }
      used.add(result.toLowerCase());
      return result;
    };
    const exportBills = allBills.filter(bill => contracts.some(contract => contract.fileno === bill.fileno));
    const usedNames = new Set(["contracts", "bills"]);
    const sheetMap = new Map();
    contracts.forEach(contract => {
      sheetMap.set(contract.fileno || contract._id, sheetNameFor(contract.workname || contract.fileno, usedNames));
    });

    // All contracts summary
    const summary = workbook.addWorksheet("Contracts", { views: [{ state: "frozen", ySplit: 1 }] });
    summary.columns = [
      { width: 10 }, { width: 18 }, { width: 18 }, { width: 36 }, { width: 28 },
      { width: 25 }, { width: 15 }, { width: 14 }, { width: 15 }, { width: 15 },
      { width: 15 }, { width: 18 }, { width: 16 }, { width: 18 }, { width: 18 },
      { width: 14 }, { width: 16 }, { width: 14 }
    ];
    const headers = ["File No.", "Railway", "Division", "Name of Work", "Train Name/Nos.", "Contract No.", "Date", "Duration", "Start", "End", "Extension", "Total Contract Value", "Work Complete (%)", "Maximum Penalty", "Actual Penalty", "% Penalty", "Status", "Owner"];
    const header = summary.addRow(headers);
    header.height = 26;
    header.eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.yellow } };
      cell.font = { bold: true, color: { argb: C.blue } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = border;
    });

    contracts.forEach((contract, index) => {
      const related = exportBills.filter(bill => bill.fileno === contract.fileno);
      const metrics = getContractBillingMetrics(contract, related);
      const total = safeNumber(contract.contractvalue) + safeNumber(contract.extendedvalue);
      const penalty = safeNumber(contract.penalty) || related.reduce((sum, bill) => sum + safeNumber(bill.penalty), 0);
      const maxPenalty = total * 0.1;
      const row = summary.addRow([
        contract.fileno || "", contract.railway || "", contract.division || "", contract.workname || "",
        contract.trainname || "", contract.contractNumber || "", asExcelDate(contract.date),
        getContractMonths(contract.startdate, contract.enddate) === "" ? "" : `${getContractMonths(contract.startdate, contract.enddate)} Months`,
        asExcelDate(contract.startdate), asExcelDate(contract.enddate), asExcelDate(contract.extension),
        total, metrics.billableToDatePercentage, maxPenalty, penalty, maxPenalty ? penalty / maxPenalty : 0,
        contract.status || "", contract.owner || ""
      ]);
      row.eachCell(cell => { cell.border = border; cell.alignment = { vertical: "middle" }; });
      [12, 14, 15].forEach(col => row.getCell(col).numFmt = moneyFormat);
      row.getCell(13).numFmt = "0";
      row.getCell(16).numFmt = "0.00%";
      const target = sheetMap.get(contract.fileno || contract._id);
      if (target) {
        row.getCell(4).value = { text: contract.workname || "", hyperlink: `#'${target}'!A1` };
        row.getCell(4).font = { color: { argb: C.blue }, underline: true, bold: true };
      }
      if (String(contract.status).toLowerCase() === "completed") {
        row.eachCell(cell => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2CC" } }; });
        row.getCell(4).font = { color: { argb: C.blue }, underline: true, bold: true };
      }
    });
    summary.autoFilter = { from: "A1", to: "R1" };

    // All bills sheet
    const billsWS = workbook.addWorksheet("Bills", { views: [{ state: "frozen", ySplit: 1 }] });
    billsWS.columns = [{ width: 18 }, { width: 18 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }];
    const billHeaders = ["File No.", "Bill No.", "Invoice Date", "From", "To", "Amount", "GST", "Total", "Collection", "Penalty"];
    const billHeader = billsWS.addRow(billHeaders);
    billHeader.eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.yellow } };
      cell.font = { bold: true, color: { argb: C.blue } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = border;
    });
    exportBills.forEach(bill => {
      const row = billsWS.addRow([bill.fileno || "", bill.billno || "", asExcelDate(bill.einvoicedate), asExcelDate(bill.billfrom), asExcelDate(bill.billto), safeNumber(bill.netamount), safeNumber(bill.gst), safeNumber(bill.totalamount), safeNumber(bill.amountpssd), safeNumber(bill.penalty)]);
      row.eachCell(cell => { cell.border = border; cell.alignment = { vertical: "middle" }; });
      [6, 7, 8, 9, 10].forEach(col => row.getCell(col).numFmt = moneyFormat);
      const target = sheetMap.get(bill.fileno);
      if (target) {
        row.getCell(1).value = { text: bill.fileno || "", hyperlink: `#'${target}'!A1` };
        row.getCell(1).font = { color: { argb: C.blue }, underline: true };
      }
    });
    billsWS.autoFilter = { from: "A1", to: "J1" };

    // One sheet per contract, named from the work name
    contracts.forEach(contract => {
      const fileNo = contract.fileno || contract._id;
      const ws = workbook.addWorksheet(sheetMap.get(fileNo));
      ws.columns = Array.from({ length: 16 }, (_, i) => ({ width: i === 0 ? 22 : 16 }));
      ws.getCell("A1").value = { text: `File No. ${fileNo}`, hyperlink: "#'Contracts'!A1" };
      ws.getCell("A1").font = { bold: true, color: { argb: C.blue }, size: 12 };
      ws.mergeCells("E1:J1");
      ws.getCell("E1").value = "THARU & SONS";
      ws.getCell("E1").font = { bold: true, size: 18 };
      ws.getCell("E1").alignment = { horizontal: "center" };
      ws.getCell("N1").value = { text: "CONTRACTS", hyperlink: "#'Contracts'!A1" };
      ws.getCell("N1").font = { bold: true, color: { argb: C.blue }, underline: true };
      ws.getCell("P1").value = { text: "ALL BILLS", hyperlink: "#'Bills'!A1" };
      ws.getCell("P1").font = { bold: true, color: { argb: C.blue }, underline: true };
      ws.mergeCells("E2:J2");
      ws.getCell("E2").value = `${contract.railway || ""} - ${contract.division || ""}`;
      ws.getCell("E2").font = { bold: true, color: { argb: C.red }, size: 14 };
      ws.getCell("E2").alignment = { horizontal: "center" };
      ws.getCell("A4").value = "Name of the Work:";
      ws.getCell("A4").font = { bold: true };
      ws.mergeCells("B4:P4");
      ws.getCell("B4").value = contract.workname || contract.nameofthework || "";
      ws.getCell("B4").font = { bold: true };
      [
        ["A6", "Contract Agreement No:", "B6", contract.contractNumber || fileNo],
        ["D6", "Date", "E6", asExcelDate(contract.date)],
        ["A7", "LOA No:", "B7", contract.loa || ""],
        ["A8", "Period:", "B8", `${getContractMonths(contract.startdate, contract.enddate) || 0} Months`],
        ["A9", "Date of Commencement:", "B9", asExcelDate(contract.startdate)],
        ["A10", "Date of Completion:", "B10", asExcelDate(contract.extension || contract.enddate)],
        ["A11", "Total Contract Value", "B11", safeNumber(contract.contractvalue) + safeNumber(contract.extendedvalue)],
        ["F8", "Work Executed (%)", "G8", getContractBillingMetrics(contract, exportBills.filter(b => b.fileno === fileNo)).billableToDatePercentage],
        ["F11", "Monthly Bill", "G11", safeNumber(contract.contractvalue) / Math.max(1, getContractMonths(contract.startdate, contract.enddate) || 1)],
        ["J12", "Maximum Applicable Penalty", "K12", (safeNumber(contract.contractvalue) + safeNumber(contract.extendedvalue)) * 0.1],
        ["J13", "Penalty Imposed Till Date", "K13", safeNumber(contract.penalty)]
      ].forEach(([labelCell, label, valueCell, value]) => {
        ws.getCell(labelCell).value = label;
        ws.getCell(labelCell).font = { bold: true };
        ws.getCell(valueCell).value = value;
        ws.getCell(valueCell).border = border;
      });
      ws.getCell("B11").numFmt = moneyFormat;
      ws.getCell("G11").numFmt = moneyFormat;
      ws.getCell("K12").numFmt = moneyFormat;
      ws.getCell("K13").numFmt = moneyFormat;
      const total = safeNumber(contract.contractvalue) + safeNumber(contract.extendedvalue);
      ws.getCell("L13").value = total ? safeNumber(contract.penalty) / (total * 0.1) : 0;
      ws.getCell("L13").numFmt = "0.00%";
      ["J12", "K12", "J13", "K13", "L13"].forEach(address => {
        ws.getCell(address).fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.green } };
        ws.getCell(address).border = border;
      });

      const tableStart = 16;
      const detailHeaders = ["Date", "Bill No.", "From", "To", "Amount", "GST", "Total", "Cheque", "Pass Date", "Amount Passed", "TDS", "GST-TDS", "Penalty", "CC", "Postal", "Balance"];
      const detailHeader = ws.getRow(tableStart);
      detailHeaders.forEach((label, index) => {
        const cell = detailHeader.getCell(index + 1);
        cell.value = label;
        cell.font = { bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.grey } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = border;
      });
      const related = exportBills.filter(bill => bill.fileno === fileNo);
      related.forEach((bill, index) => {
        const row = ws.getRow(tableStart + index + 1);
        const values = [asExcelDate(bill.einvoicedate), bill.billno || "", asExcelDate(bill.billfrom), asExcelDate(bill.billto), safeNumber(bill.netamount), safeNumber(bill.gst), safeNumber(bill.totalamount), bill.cheque || "TFR", asExcelDate(bill.billpassdt), safeNumber(bill.amountpssd), safeNumber(bill.tds), safeNumber(bill.gsttds), safeNumber(bill.penalty), safeNumber(bill.cc), safeNumber(bill.postage), safeNumber(bill.balance)];
        values.forEach((value, index) => {
          const cell = row.getCell(index + 1);
          cell.value = value;
          cell.border = border;
          cell.alignment = { horizontal: index >= 4 ? "right" : "center", vertical: "middle" };
          if (index >= 4) cell.numFmt = moneyFormat;
        });
      });
      ws.views = [{ state: "frozen", ySplit: tableStart }];
      ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Tharu_Sons_Contracts_Bills_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Excel exported successfully");
  } catch (error) {
    console.error("Excel export error:", error);
    toast.error("Failed to export Excel");
  }
}
