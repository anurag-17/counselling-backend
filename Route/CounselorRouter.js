const express = require('express');
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
    registerCounselor,
    counselorLogin,
    verifyCounselor,
    updateCounselor,
    getAllCounselors,
    getCounselorById,
    deleteCounselor,
    updateCounselorPassword,
    forgotPasswordCounselor,
    resetPasswordCounselor
} = require("../Controller/CounselorController");


router.post("/addCounselor", registerCounselor);

router.post("/counselorLogin", counselorLogin);

router.get("/verifyCounselor/:token", verifyCounselor);

router.put("/updateCounselor/:id",isAuthenticatedUser, updateCounselor);

router.get("/getAllCounselors", getAllCounselors);

router.get("/getCounselorById/:id", getCounselorById);

router.delete("/deleteCounselor/:id", deleteCounselor);

router.put("/updateCounselorPassword",isAuthenticatedUser, updateCounselorPassword);

router.post("/forgot-password", forgotPasswordCounselor);

router.post("/reset-password/:resetToken", resetPasswordCounselor);

module.exports = router;
