import mongoose, {Mongoose,model}from "mongoose";
const expenseSchema=new mongoose.Schema
({

   
     state: {
        type: String,
        required: true,
      },

    date: {
        type: String,
        required: true,
      },

      items: {
        type: String,
        required: true,
      },

      password: {
        type: String,
       
      },
      

      role: {
        type: Number,
      },
    },
    { timestamps: true }

)
export default mongoose.model.expenses || mongoose.model('expenses',expenseSchema)
