const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");

const controllers = require("../../controllers/AuthController");

const loginValidator = [
    body("email", "Email does not Empty").not().isEmpty(),
    body("email", "Invalid email").isEmail(),
    body("password", "Password does not Empty").not().isEmpty(),
];

router.post("/login", controllers.onLogin);
router.get("/:id", controllers.onGetById);

module.exports = router;
