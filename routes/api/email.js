const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/EmailController");

router.post("/send-email", controllers.onSendEmail);

module.exports = router;
