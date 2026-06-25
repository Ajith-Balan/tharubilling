import express from 'express'
import dotenv from 'dotenv'
import connection from './connection.js'
import auth from './router/auth.js'
import contractsRoutes from './router/contractsRoutes.js'
import billsRoutes from './router/billsRoutes.js'
import cors from 'cors'
import path from 'path';
dotenv.config()
connection()
const app =express()
app.use(cors())
app.use(express.json({ limit: "50mb" }));



app.use('/api/v1/auth',auth)


// app.get('/',(req,res)=>{
//     res.send({message:'welcome to ecom app'})
// })

app.use('/api/v1/contracts', contractsRoutes)
app.use('/api/v1/bills', billsRoutes)

const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all handler for any request that doesn't match the above routes

app.get("*", (req, res) => res.sendFile(path.join(__dirname,"../frontend/dist",'index.html')));


const PORT = process.env.PORT || 4000




app.listen(PORT, ()=>{
    console.log(`server running on ${PORT}`);
    
})
