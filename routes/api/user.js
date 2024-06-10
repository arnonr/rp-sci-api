const express = require("express");
const router = express.Router();

const { body, validationResult } = require('express-validator');

const controllers = require("../../controllers/UserController");

const loginValidator = [
    body('email', 'Email does not Empty').not().isEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password does not Empty').not().isEmpty(),
]

router.post('/login',
    loginValidator, (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        next()
    },
    controllers.onLogin
);
// router.post("/login", controllers.onLogin);
router.get("/", controllers.onGetAll);
router.get("/:id", controllers.onGetById);

router.post("/", controllers.onCreate);


// router.put("/:id", controllers.onUpdate);
router.post("/:id", controllers.onUpdate); /* POST method for Upload file */

router.delete("/:id", controllers.onDelete);

module.exports = router;
