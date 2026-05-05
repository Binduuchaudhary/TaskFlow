const express = require("express");
const { body } = require("express-validator");
const { changePassword, login, me, signup } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["admin", "member"]).withMessage("Role must be admin or member")
  ],
  validateRequest,
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validateRequest,
  login
);

router.get("/me", protect, me);


router.patch(
  "/change-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
  ],
  validateRequest,
  changePassword
);


module.exports = router;
