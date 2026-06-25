import mongoose from "mongoose";
export default async function connection(){
    try {
        const URL=process.env.dburl
        const db=await mongoose.connect(URL)
        console.log("database connected");
        return db
    } catch (error) {
        console.log(`error in mongodb`);
        
    }

}
