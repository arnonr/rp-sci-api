const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/PaperController");

router.get("/", controllers.onGetAll);
router.get("/:id", controllers.onGetById);

router.post("/", controllers.onCreate);
router.post("/approve", controllers.onApprove);

router.put("/:id", controllers.onUpdate);

router.delete("/:id", controllers.onDelete);

module.exports = router;
