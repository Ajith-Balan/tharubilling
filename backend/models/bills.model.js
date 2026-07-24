import mongoose from "mongoose";

const billsSchema = new mongoose.Schema(
  {
    fileno: {
      type: String,
    },
    einvoicedate: {
      type: String,
    },
    billno: {
      type: String,
    },
    billfrom: {
      type: String,
    },
    billto: {
      type: String,
    },
    netamount: {
      type: String,
    },
    gst: {
      type: String,
    },
    totalamount: {
      type: String,
    },
    cheque: {
      type: String,
    },
    billpassdt: {
      type: String,
    },
    amountpssd: {
      type: String,
    },
    tds: {
      type: String,
    },
    gsttds: {
      type: String,
    },
    penalty: {
      type: String,
    },
    overpay: {
      type: String,
    },
    electricity: {
      type: String,
    },
    cess: {
      type: String,
    },
    building_cess: {
      type: String,
    },
    labour_cess: {
      type: String,
    },
    sd: {
      type: String,
    },
    deposit: {
      type: String,
    },
    postage: {
      type: String,
    },
    postal_charge: {
      type: String,
    },
    cc: {
      type: String,
    },
    security: {
      type: String,
    },
    postage_bill_copy: {
      type: String,
    },
    welfare_cess: {
      type: String,
    },
    conservency: {
      type: String,
    },
    pg: {
      type: String,
    },
    pg_interest: {
      type: String,
    },
    esi: {
      type: String,
    },
    pf: {
      type: String,
    },
    esi_pfpenalty: {
      type: String,
    },
    Linen_Loss: {
      type: String,
    },
    berth_charge: {
      type: String,
    },
    others: {
      type: String,
    },
    Debit_recovery: {
      type: String,
    },
    Water_cess_charge: {
      type: String,
    },
    low_scoring: {
      type: String,
    },
    Material_cost_r: {
      type: String,
    },
    BG_late_fee: {
      type: String,
    },
    ESI_PF_R: {
      type: String,
    },
    short_payment: {
      type: String,
    },
    status: {
      type: String,
    },
    sendmail: {
      type: String,
    },
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("bills", billsSchema);