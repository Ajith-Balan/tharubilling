import mongoose, {Mongoose,model}from "mongoose";
const userSchema=new mongoose.Schema
({

   
    name: {
        type: String,
        required: true,
      },

      email: {
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
export default mongoose.model.users || mongoose.model('users',userSchema)
