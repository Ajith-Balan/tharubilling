import mongoose from "mongoose";

const contractschema = new mongoose.Schema(
  {
    date:{
      type:String
    },

    railway: {
      type: String,
    },
    division: {
      type: String,
    },
    trainname: {
      type: String,
    },

    workname: {
      type: String,
    },
    nameofthework: {
      type: String,
    },
    fileno: {
      type: String,
    },
    contractNumber: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    startdate: {
      type: String, 
    },
    enddate: {
      type: String,
    },
    extension: {
      type: String,
    },

    contractvalue: {
      type: Number,
    },
//bank Guarantee
    bg: {
      type: String,
    },

     validity:{
type:String
    },
owner:{
type:String
},

managerphone:{
  type:String
},
managername:{
  type:String
},
     
 
    status: {
      type: String,
    },
    remarks:{
      type:String
    },

    role: {
      type: Number,
      default: 0,
    },
 


  },
  { timestamps: true }
);

export default mongoose.model("contract", contractschema);
