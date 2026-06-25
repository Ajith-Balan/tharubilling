import mongoose from "mongoose";

const billsSchema = new mongoose.Schema(
  {
    work: {
      type: String,
    },

    fileno: {
      type: String,
    },
       einvoicedate:{
type:String
    },

    billno: {
      type: String,
    },
    billfrom:{
type:String
    }, 
      billto:{
type:String
    },
 
    netamount: {
      type: Number,
    },
  gst:{
type: Number,  },

    totalamount:{
    type:Number
  }, 
   cheque:{
    type:String
  },

billpassdt: {
      type: String,
    },
 
      amountpssd:{
    type:Number
  }, 
  tds:{
    type:Number
  },
  gsttds:{
    type:Number
  },

  cc:{
    type:Number
  },
 sd:{
type:Number
 },

 esi_pfpenalty:{
    type:Number
 },
    penalty: {
      type: Number,
    },
    Linen_Loss:{
      type:Number
    },

    others:{
type:Number
    },

    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("bills", billsSchema);
