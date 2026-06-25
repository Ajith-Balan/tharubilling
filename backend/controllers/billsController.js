import billsmodel from "../models/bills.model.js";




export async function createbillController(req, res) {
  try {
    const { work, fileno, einvoicedate,billno,billfrom,billto,netamount,gst,totalamount,cheque,billpassdt,amountpssd,tds,gsttds,cc,sd,esi_pfpenalty,Linen_Loss,others,penalty,status } = req.body;

    // Validation (add additional checks if necessary)

    // Create the train
    const bill = await billsmodel.create({
      work, fileno, einvoicedate,billno,billfrom,billto,netamount,gst,totalamount,cheque,billpassdt,amountpssd,tds,gsttds,cc,sd,esi_pfpenalty,Linen_Loss,others,penalty,status
    });

    // Send success response with the created site
    res.status(201).send({
      success: true,
      message: "Bill Created Successfully",
      bill, 
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating bill",
    });
  }
}



export const bulkCreateBillsController = async (req, res) => {
  try {
    const { bills } = req.body;

    if (!bills || !Array.isArray(bills) || bills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload layout structure provided.",
      });
    }


    // 2. Map and loop through inputs, incrementing our tracker index sequentially
  const sanitizedBills = bills.map((c, index) => {
      return {
        work: c.work || c["Work Category"] || c["Work"] || "N/A",
        fileno: c.fileno || c["File No"] || c["File Number"] || "N/A",
        einvoicedate: c.einvoicedate || c["E-Invoice Date (YYYY-MM-DD)"] || c["Date"] || "N/A",

        billno: c.billno || c["Bill No."] || "N/A",
        billfrom: c.billfrom || c["Bill From (YYYY-MM-DD)"] || c["From"] || "N/A",
        billto: c.billto || c["Bill To (YYYY-MM-DD)"] || c["To "] || "N/A",
        netamount: c.netamount || c["Net Amount"] || c["Amount"] ||  0,
        gst: c.gst || c["GST"] || 0,
        totalamount: c.totalamount || c["Total"] || c["Total Amount"] || 0,
        cheque: c.cheque || c["Cheque Number"] || c["Cheque"] || "N/A",
        billpassdt: c.billpassdt || c["Bill Pass Date (YYYY-MM-DD)"] || c["Passed Date"] || "N/A",
        amountpssd: c.amountpssd || c["Amount Passed"] || c["Amount Passed"] || 0,
        tds: c.tds || c["TDS"] || 0,
        gsttds: c.gsttds || c["TDS-GST"] || 0,
        cc: c.cc || c["CC"] || 0,
        sd: c.sd || c["SD"] || 0,
        esi_pfpenalty: c.esi_pfpenalty || c["ESI/PF Penalty"] || 0,
        Linen_Loss: c.Linen_Loss || c["Linen Loss"] || 0,
        others: c.others || c["Others"] || 0,
        
        penalty: c.penalty || c["Penalty"] || 0,
        status: c.status || "pending", // changed to pending to match your initialState
      };
    });

    
    // 3. Write all mapped configuration objects into MongoDB at once
    const data = await billsmodel.insertMany(sanitizedBills);

    res.status(201).json({
      success: true,
      message: "Bulk insertion parsed and sequentially numbered successfully.",
      count: data.length,
    });
  } catch (error) {
    console.error("Bulk Insert Error:", error);
    res.status(500).json({
      success: false,
      message: "Error executing backend bulk database insertions.",
      error: error.message,
    });
  }
};


export async function getBills(req,res) {
  try {
    const bills= await billsmodel.find()
    res.status(200).send({
      success:true,
      message:"gett bills",
      bills
    })
  } catch (error) {
    res.status(500).send({
      success:false,
      error,
      message: "error in getting bill details"
    })
  
    
  }
}



export async function getcontractBills(req,res) {
  try {
    const {fileno} = req.params
    const bills= await billsmodel.find({fileno:fileno})
    res.status(200).send({
      success:true,
      message:"gett bills",
      bills
    })
  } catch (error) {
    res.status(500).send({
      success:false,
      error,
      message: "error in getting bill details"
    })
  
    
  }
}

export async function getonebill(req,res) {
  try {
      const {id}=req.params;
      const bill = await billsmodel.findOne({_id:id})
      res.status(200).send(bill)
  } catch (error) {
      res.status(400).send(error)
  }
}



export async function updatebill(req,res){
  try{
      const {id}=req.params;

      const{...data}=req.body
      await billsmodel.updateOne({_id:id},{$set:{...data}})
      res.status(201).send({msg:"updated"})
      
  }catch (error){
      res.status(400).send(error)
}
}



export async function deletebill(req,res){
  try{
      const {id}=req.params;
      await billsmodel.deleteOne({_id:id});
      res.status(200).send({msg:"sucessfully deleted"})
  }catch (error){
      console.error(error);
      res.status(400).send({error})
  }
 }



export const searchbillController = async (req, res) => {
  try {
    const { keyword } = req.params;

    const results = await billsmodel.find({
      $or: [
        { billno: { $regex: keyword, $options: "i" } },
        { fileno: { $regex: keyword, $options: "i" } },
        { workname: { $regex: keyword, $options: "i" } },
      ],
    });

    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error while searching bills",
    });
  }
};


// export async function deletesite(req,res){
//   try{
//       const {id}=req.params;
//       await billsmodel.deleteOne({_id:id});
//       res.status(200).send({msg:"sucessfully deleted"})
//   }catch (error){
//       console.error(error);
//       res.status(400).send({error})
//   }
// }







// export const searchsiteController = async(req,res)=>{
//   try {
//     const {keyword}= req.params
//     const results= await billsmodel.find({
      
//       $or:[
//         {name:{$regex : keyword,$options :"i"}},
//         {description:{$regex : keyword,$options:"i"}}
//       ]
//     })
//     res.send(results);
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       error,
//       message:"error in search site"
//     })
    
//   }
// }

