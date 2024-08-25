const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/ReviewController");

router.get("/", controllers.onGetAll);
router.get("/:id", controllers.onGetById);

router.post("/", controllers.onCreate);
router.post("/:id", controllers.onUpdate); /* POST method for Upload file */

router.put("/:id", controllers.onUpdate);
router.put("/send-mail/:id", controllers.onSendMail);

router.delete("/:id", controllers.onDelete);

module.exports = router;
