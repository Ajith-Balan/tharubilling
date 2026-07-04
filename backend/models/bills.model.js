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

    berth_charges:{
    type:String
  }, 
  
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
    pg:{
      type:String
    },
    Linen_Loss:{
      type:String
    },

    others:{
type:String
    },

    cc_postage:{
type:String
    },

      postage:{
type:String
    }, 
    
    water_cess_charges:{
type:String
    },  
      welfare_cess:{
type:String
    },  
    electricity:{
type:String
    },
building_cess:{
type:String
},
    overpayment:{
type:String
    },
    status: {
      type: String,
    },

  },
  { timestamps: true }
);

export default mongoose.model("bills", billsSchema);
