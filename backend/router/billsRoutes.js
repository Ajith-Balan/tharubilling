import express from "express"
import {  requireSignIn } from "../middlewares/authmiddleware.js"
import { createbillController,getBills,getonebill,updatebill,deletebill, getcontractBills,bulkCreateBillsController,searchbillController,checkAndSendDailyEInvoices  } from "../controllers/billsController.js"

const router = express.Router()










router.get('/getbills', getBills)
router.get('/getcontractbills/:fileno', getcontractBills)
router.post('/createbill', createbillController)
router.post('/bulk-upload-bills', bulkCreateBillsController);
router.get('/getone-bill/:id', getonebill)
router.put('/update-bill/:id', updatebill)
router.delete('/delete-bill/:id', deletebill)
router.post('/invoiceupdate',checkAndSendDailyEInvoices )









// router.delete('/delete-site/:id', deletesite)







router.get('/search/:keyword', searchbillController)




export default router
