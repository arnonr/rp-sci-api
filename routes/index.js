const express = require("express");
// import api from './api/index.js'
const router = express.Router();

const role = require("./api/role");
const user = require("./api/user");
const loginLog = require("./api/login-log");
const froala = require("./api/froala");
const fileAttach = require("./api/file-attach");
const email = require("./api/email");
const budget = require("./api/budget");
const paper = require("./api/paper");
const researcher = require("./api/researcher");
const methodList = require("./api/methodList");
const review = require("./api/review");
const reviewer = require("./api/reviewer");
const returnPaper = require("./api/return-paper");

router.use(
  `/api/v${process.env.API_VERSION}`,
  router.use("/role", role),
  router.use("/user", user),
  router.use("/login-log", loginLog),
  router.use("/froala", froala),
  router.use("/file-attach", fileAttach),
  router.use("/email", email),
  router.use("/paper", paper),
  router.use("/budget", budget),
  router.use("/researcher", researcher),
  router.use("/method-list", methodList),
  router.use("/review", review),
  router.use("/reviewer", reviewer),
  router.use("/return-paper", returnPaper),

);

module.exports = router;
