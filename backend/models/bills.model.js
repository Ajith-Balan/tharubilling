import mongoose from "mongoose";

const billsSchema = new mongoose.Schema(
  {
 

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
      type: String,
    },
    epf: {
      type:String
    },
      esi: {
      type:String
    },
    

  gst:{
type: String,  },


  
    totalamount:{
    type:String
  }, 
   cheque:{
    type:String
  },

billpassdt: {
      type: String,
    },
 
      amountpssd:{
    type:String
  }, 
  tds:{
    type:String
  },
  gsttds:{
    type:String
  },

  cc:{
    type:String
  },
 sd:{
type:String
 },

 esi_pfpenalty:{
    type:String
 },
    penalty: {
      type: String,
    },

    Linen_Loss:{
      type:String
    },

    others:{
type:String
    },


 
    status: {
      type: String,
    },
    sendmail:{
type:String
    },


    customFields: {
  type: Map,
  of: mongoose.Schema.Types.Mixed,
  default: {},
}

  },
  { timestamps: true }
);

export default mongoose.model("bills", billsSchema);
