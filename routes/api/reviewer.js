const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/ReviewerController");

router.get("/", controllers.onGetAll);
router.get("/:id", controllers.onGetById);

router.post("/verify-new-password", controllers.onVerifyNewPassword);
router.post("/login", controllers.onLogin);
router.post("/", controllers.onCreate);

router.put("/:id", controllers.onUpdate);

router.delete("/:id", controllers.onDelete);

module.exports = router;
