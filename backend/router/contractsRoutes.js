import express from "express"
import { createcontractController,  deletecontract,  getContracts,getonecontract,managerloginController,updatecontract,requireSignIn,getOnecontract,searchcontractController, bulkCreateContractsController } from "../controllers/contractController.js"

const router = express.Router()










router.get('/getcontracts', getContracts)
router.post('/createcontract', createcontractController)
router.post("/bulk-create", bulkCreateContractsController);
router.get('/getone-contract/:id', getonecontract)
router.get('/get-contract-by-fileno/:fileno', getOnecontract)
router.put('/update-contract/:id', updatecontract)
router.delete('/delete-contract/:id', deletecontract)
router.post('/managerlogin', managerloginController)
// Route to check if a user is authenticated (without admin check)
router.get('/userauth', requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});











// router.delete('/delete-site/:id', deletesite)







// router.delete('/delete-site/:id', deletesite)



 router.get('/search/:keyword', searchcontractController)




export default router
