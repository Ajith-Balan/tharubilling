import billsmodel from "../models/bills.model.js";
import cron from 'node-cron';
import nodemailer from 'nodemailer'
import contractModel from "../models/contract.model.js";



export async function createbillController(req, res) {
  try {
    const {  ...data } = req.body;

    // Validation (add additional checks if necessary)

    // Create the train
    const bill = await billsmodel.create({...data
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
        fileno: c.fileno || c["File No"] || c["File Number"] || "N/A",
        einvoicedate: c.einvoicedate || c["E-Invoice Date (YYYY-MM-DD)"] || c["E Date"]  ,

        billno: c.billno || c["Bill No."] ,
        billfrom: c.billfrom || c["Bill From (YYYY-MM-DD)"] || c["From"] ,
        billto: c.billto || c["Bill To (YYYY-MM-DD)"] || c["To "] ,
        netamount: c.netamount || c["Net Amount"] || c["Amount"] ,
        epf: c.epf || c["EPF"],
        esi: c.esi || c["ESI"],

        gst: c.gst || c["GST"] ,
        berth_charges: c.berth_charges || c["Berth Charges"],
        
        totalamount: c.totalamount || c["Total"] || c["Total Amount"] ,
        cheque: c.cheque || c["Cheque Number"] || c["Cheque"] ,
        billpassdt: c.billpassdt || c["Bill Pass Date (YYYY-MM-DD)"] || c["Passed Date"]  ,
        amountpssd: c.amountpssd || c["Amount Passed"] || c["Amount Passed"] ,
        tds: c.tds || c["TDS"] ,
        gsttds: c.gsttds || c["TDS-GST"] ,
        sd: c.sd || c["SD"] ,
        cc: c.cc || c["CC"] ,

        esi_pfpenalty: c.esi_pfpenalty || c["ESI/PF Penalty"],
        Linen_Loss: c.Linen_Loss || c["Linen Loss"] ,
        others: c.others || c["Others"] ,
        
        penalty: c.penalty || c["Penalty"] ,
        pg: c.pg || c["PG"],
        postage: c.postage || c["Postage"],
        welfare_cess: c.welfare_cess || c["welfare cess"],
        water_cess_charge: c.water_cess_charge || c["Water & cess charge"],
        electricity: c.electricity || c["Electricity"],
        building_cess: c.building_cess || c["Building Cess"],
        overpayment: c.overpayment || c["Over Payment"],

        status: c.status || c["Status"], // changed to pending to match your initialState
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














  const transporter = nodemailer.createTransport({
       service: 'smtpout.secureserver.net',
    host: "smtpout.secureserver.net",
    port:587, //465 true
    secure:false,// You can change this to your email service provider
    auth: {
      user: process.env.EMAIL_USER, // Your email address from the environment variables
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });



// Import your existing transporter configuration
// Import your bill model
export const checkAndSendDailyEInvoices = async () => {
const formatDate = (dateVal) => {
  if (!dateVal || dateVal === 'N/A') return 'N/A';
  
  let d = new Date(dateVal);
  
  // If native parsing fails for existing dash strings like '12-june-2012'
  if (isNaN(d.getTime()) && typeof dateVal === 'string') {
    const parts = dateVal.split('-');
    if (parts.length === 3) {
      const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthStr = parts[1].toLowerCase().substring(0, 3);
      const monthIndex = shortMonths.indexOf(monthStr);
      
      if (monthIndex !== -1) {
        const year = parts[2];
        const month = String(monthIndex + 1).padStart(2, '0');
        const day = parts[0].padStart(2, '0');
        d = new Date(`${year}-${month}-${day}`);
      }
    }
  }

  // Fallback if parsing completely fails
  if (isNaN(d.getTime())) return dateVal; 
  
  // Array of months formatted with capitalized names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const day = String(d.getDate()).padStart(2, '0');
  const monthText = months[d.getMonth()]; // Gets the text string name
  const year = d.getFullYear();
  
  // Returns your target string format
  return `${day}-${monthText}-${year}`;
};

const formatCurrency = (amount) => {
  if (!amount) return '₹0.00';
  // Formats to Indian Rupee (₹) layout. Swap 'en-IN' to 'en-US' if you need dollars ($).
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};
  try {
    const todayStr = new Date().toISOString().split('T')[0]; 

    // 1. Fetch today's bills that haven't been sent yet
    const billsToday = await billsmodel.find({ 
      einvoicedate: todayStr,
      sendmail: { $ne: 1 } 
    });

    if (billsToday.length === 0) {
      return;
    }

    // 2. Loop through each bill individually and try to claim it atomically
    for (const bill of billsToday) {
      
      // This update will ONLY match if another instance hasn't updated it yet
      const result = await billsmodel.updateOne(
        { _id: bill._id, sendmail: { $ne: 1 } }, 
        { $set: { sendmail: 1 } }
      );

      // If modifiedCount is 1, this process successfully "locked" the bill
      if (result.modifiedCount === 1) {
        
        // FETCH THE CONTRACT FOR THIS SPECIFIC BILL ATOMICALLY INSIDE THE LOOP
        const contract = await contractModel.findOne({ fileno: bill.fileno });
        
        const estimatedPassedDate = bill.estimatedPassedDate || "N/A";

        const mailOptions = {
          from: { name: 'Tharu & Sons', address: process.env.EMAIL_USER },
          to: "info@tharuandsons.in",
          subject: `E-Invoice Notification - Bill No: ${bill.billno}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="background-color: #0044cc; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">T & S - E-Invoice Alert</h2>
              </div>
              <div style="padding: 20px; line-height: 1.6; color: #333;">
                <h3>Hello,</h3>
<p>This is to notify you that an E-Invoice has been raised today for <strong>${contract?.division ? `${contract.division} - ` : ''}${contract?.workname || 'N/A'}</strong>.</p>                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
               
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Bill No:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${bill.billno}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Billing Period:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${formatDate(bill.billfrom) || 'N/A'} to ${formatDate(bill.billto) || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Total Amount:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #0044cc;">${formatCurrency(bill.totalamount)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Penalty Applied:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; color: #cc0000;">${formatCurrency(bill.penalty) || '0'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Estimated Passed Date:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${estimatedPassedDate}</td>
                  </tr>
                </table>

                <br>

                <p>Thank you,<br>AB TEAM</p>
              </div>
            </div>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (mailError) {
          // Rollback flag if email physically fails to transmit
          await billsmodel.updateOne({ _id: bill._id }, { $set: { sendmail: 0 } });
        }
      }
    }

  } catch (error) {
    console.error("Error in automated daily e-invoice cron job:", error);
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

// ID CARD
