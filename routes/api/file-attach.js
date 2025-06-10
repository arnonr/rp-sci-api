const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/FileAttachController");

router.get("/", controllers.onGetAll);
router.get("/:id", controllers.onGetById);
router.delete("/:id", controllers.onDelete);

module.exports = router;
