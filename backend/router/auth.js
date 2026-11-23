import express from 'express';
import {
  registerController,
  loginController,
  testController,
  updateProfile,

  Forget,
  verifyotp,
  updatePassword,
  getManagers,
  getUsers,
  deleteUser,
} from '../controllers/authcontroller.js';
import {   isAdmin, isManager,  requireSignIn } from '../middlewares/authmiddleware.js';

const router = express.Router();

// User registration route
router.post('/register', registerController);

// User login route
router.post('/login', loginController);

// Test route for admin access, protected by sign-in and admin check
router.get('/test', requireSignIn,  testController);

router.get('/getusers',   getUsers);

router.get('/getmanager',   getManagers);





// Route to check if a user is authenticated (without admin check)
router.get('/userauth', requireSignIn,(req, res) => {
  res.status(200).send({ ok: true });
});


router.get('/adminauth', requireSignIn, isManager, (req, res) => {
  res.status(200).send({ ok: true });

});


router.get('/viewauth', requireSignIn,  isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

// // Admin Access
// router.get('/adminauthh', requireSignIn,  isSuperAdmin, (req, res) => {
//   res.status(200).send({ ok: true });
// });

// router.get('/managerauthh', requireSignIn,  isSiteManager, (req, res) => {
//   res.status(200).send({ ok: true });
// });



router.put('/profile/:id', requireSignIn, updateProfile)

router.put('/resetpassword/:id',  updatePassword)
router.delete('/deleteuser/:id',  deleteUser)







router.post('/forgetpswd',  Forget)

router.post('/verifyotp',  verifyotp)




export default router;

