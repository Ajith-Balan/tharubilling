import express from 'express';
import {
  registerController,
  loginController,
  testController,
  updateProfile,

  Forget,
  verifyotp,
  updatePassword,
  getoneSupervisor,
  getManagers,
} from '../controllers/authcontroller.js';
import {  isAdminn, isManager, isManagerr, requireSignIn } from '../middlewares/authmiddleware.js';

const router = express.Router();

// User registration route
router.post('/register', registerController);

// User login route
router.post('/login', loginController);

// Test route for admin access, protected by sign-in and admin check
router.get('/test', requireSignIn,  testController);

router.get('/getsupervisor',   getoneSupervisor);

router.get('/getmanager',   getManagers);



// Route to check if a user is authenticated (without admin check)
router.get('/userauth', requireSignIn,(req, res) => {
  res.status(200).send({ ok: true });
});


router.get('/adminauth', requireSignIn, isManager, (req, res) => {
  res.status(200).send({ ok: true });

});

router.get('/managerauth', requireSignIn,  isManager, (req, res) => {
  res.status(200).send({ ok: true });
});

// Admin Access
router.get('/adminauthh', requireSignIn,  isAdminn, (req, res) => {
  res.status(200).send({ ok: true });
});

router.get('/managerauthh', requireSignIn,  isManagerr, (req, res) => {
  res.status(200).send({ ok: true });
});



router.put('/profile', requireSignIn, updateProfile)

router.post('/resetpassword',  updatePassword)







router.post('/forgetpswd',  Forget)

router.post('/verifyotp',  verifyotp)




export default router;

