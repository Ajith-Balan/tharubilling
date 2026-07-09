import contractModel from "../models/contract.model.js";
import { comparePassword } from "../helpers/authhelper.js";
import JWT from "jsonwebtoken"
import dotenv from 'dotenv'


export async function createcontractController(req, res) {
  try {
    const {date, railway,division,trainname, workname,nameofthework, fileno,contractNumber,extension, password, startdate, enddate, contractvalue, bg, validity,status,remarks,owner,managername,managerphone } = req.body;

    // Validation (add additional checks if necessary)
        const exisitingContract = await contractModel.findOne({ fileno });
        //exisiting user
        if (exisitingContract) {
          return res.status(200).send({
            success: false,
            msg: "Contract already exists",
          });
        }

            // ✅ Generate Contract ID
    const prefix = "CON";
    const latestContract = await contractModel.findOne({ fileno: { $exists: true } })
      .sort({ createdAt: -1 });

    let newFileno = `${prefix}1`;

    if (latestContract?.fileno) {
      const lastNum = parseInt(latestContract.fileno.replace(prefix, "")) || 0;
      newFileno = `${prefix}${lastNum + 1}`;
    }

    // Create the train
    const contract = await contractModel.create({
      railway, division, trainname, workname, nameofthework, fileno: newFileno, contractNumber, extension, password, startdate, enddate, contractvalue, bg, validity,status,remarks,owner,managername,managerphone
    });

    // Send success response with the created site
    res.status(201).send({
      success: true,
      message: "Contract Created Successfully",
      contract, 
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating site",
    });
  }
};




export const bulkCreateContractsController = async (req, res) => {
  try {
    const { contracts } = req.body;

    if (!contracts || !Array.isArray(contracts) || contracts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload layout structure provided.",
      });
    }

    // 1. Fetch the latest document with a valid fileno to determine our sequence starting point
    const prefix = "CON";
    const latestContract = await contractModel.findOne({ fileno: { $regex: `^${prefix}` } })
      .sort({ createdAt: -1 });

    let currentSequenceNum = 0;
    if (latestContract?.fileno) {
      // Extract numeric value from 'CON12' -> 12
      currentSequenceNum = parseInt(latestContract.fileno.replace(prefix, ""), 10) || 0;
    }

    // 2. Map and loop through inputs, incrementing our tracker index sequentially
    const sanitizedContracts = contracts.map((c, index) => {
      // Assign an incremental file number per row item context 
      const assignedFileno = `${prefix}${currentSequenceNum + index + 1}`;

      
      return {
        fileno: c.fileno || c["File No"] || c["fileno"] || "",// Assigned sequentially
        railway: c.railway || c["Railway"] || "",
        division: c.division || c["Division"] || "",
        workname: c.workname || c["Work Name"] || "",
        trainname: c.trainname || c["Train Name/NOS"] || c["Train Name"] || "",
        
        contractNumber: c.contractNumber || c["Contract Number"] || c["LOA Number"] || "",
        date: c.date || c["Date"] || (c[" Date"]) ||  "",
        startdate: c.startdate || c["Start Date"] || (c["Start Date"]) ||  "",
        enddate: c.enddate || c["End Date"] || (c["End Date"])|| "",
        extension: c.extension || c["Extension"] || "",
        contractvalue: Number(c.contractvalue || c["Contract Value"] || 0),

    
        bg: c.bg || c["Bank Guarantee"] || "",
        validity: c.validity || c["Validity Date"] || (c["Validity Date"]) || "",
        status: c.status || c["Status"] || "Active",
       nameofthework: c.nameofthework || c["Name of the Work"] || "",
       remarks: c.remarks || c["Remarks"] || "",
        password: c.password || String(c["Password"] || "DefaultPass123"),
        owner: c.owner || c["owner"] ,
        managerphone: c.managerphone || c["managerphone"],
        managername: c.managername || c["managername"]

      };
    });

    
    // 3. Write all mapped configuration objects into MongoDB at once
    const data = await contractModel.insertMany(sanitizedContracts);

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



export const managerloginController = async (req, res) => {
    try {
      const { fileno, password } = req.body;
      //validation
      if (!fileno || !password) {
        return res.status(404).send({
          success: false,
          msg: "Invalid fileno or password",
        });
      }
      //check user
      const user = await contractModel.findOne({ fileno: fileno });
      if (!user) {
        return res.status(405).send({
          success: false,
          msg: "Fileno is not registered",
        });
      }
const match = password === user.password;
      if (!match) {
        return res.status(404).send({
          success: false,
          msg: "Invalid Password",
        });
      }
      //token
      const token = await JWT.sign({ _id: user._id }, process.env.JWTSECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({
        success: true,
        msg: "login successfully",
        user: {
          _id: user._id,
          workname: user.workname,
          fileno: user.fileno,
          role: user.role,

        },
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        msg: "Error in login",
        error,
      });
    }
  };


  
  export const requireSignIn = async (req, res, next) => {
    try {
      const decode = JWT.verify(
        req.headers.authorization,
        process.env.JWTSECRET
      );
      req.user = decode;
      next();
    } catch (error) {
      console.log(error);
    }
  };
  


export async function getContracts(req,res) {
  try {
    const contracts= await contractModel.find()
    res.status(200).send({
      success:true,
      message:"gett contracts",
      contracts
    })
  } catch (error) {
    res.status(500).send({
      success:false,
      error,
      message: "error in getting contract details"
    })
  
    
  }
}


export async function getonecontract(req,res) {
  try {
      const {id}=req.params;
      const contract = await contractModel.findOne({_id:id})
      res.status(200).send(contract)
  } catch (error) {
      res.status(400).send(error)
  }
}


export async function getOnecontract(req,res) {
  try {
      const {fileno}=req.params;
      const contract = await contractModel.findOne({fileno:fileno})
      res.status(200).send(contract)
  } catch (error) {
      res.status(400).send(error)
  }
}


export async function updatecontract(req,res){
  try{
      const {id}=req.params;

      const{...data}=req.body
      await contractModel.updateOne({_id:id},{$set:{...data}})
      res.status(201).send({msg:"updated"})
      
  }catch (error){
      res.status(400).send(error)
}
}



export async function deletecontract(req,res){
  try{
      const {id}=req.params;
      await contractModel.deleteOne({_id:id});
      res.status(200).send({msg:"sucessfully deleted"})
  }catch (error){
      console.error(error);
      res.status(400).send({error})
  }
 }




// export async function deletesite(req,res){
//   try{
//       const {id}=req.params;
//       await siteModel.deleteOne({_id:id});
//       res.status(200).send({msg:"sucessfully deleted"})
//   }catch (error){
//       console.error(error);
//       res.status(400).send({error})
//   }
// }







export const searchcontractController = async (req, res) => {
  try {
    const { keyword } = req.params;

    const results = await contractModel.find({
      $or: [
        { workname: { $regex: keyword, $options: "i" } },
        { fileno: { $regex: keyword, $options: "i" } },
        { managername: { $regex: keyword, $options: "i" } },
        { contractNumber: { $regex: keyword, $options: "i" } },
      ],
    });

    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error while searching contracts",
    });
  }
};

