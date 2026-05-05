const express = require("express");
const { getUsers } = require("../controllers/userController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin"), getUsers);

module.exports = router;
