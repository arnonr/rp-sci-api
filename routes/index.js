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
const budget2 = require("./api/budget2");
const budget3 = require("./api/budget3");
const paper = require("./api/paper");
const researcher = require("./api/researcher");
const methodList = require("./api/methodList");
const review = require("./api/review");
const reviewer = require("./api/reviewer");
const returnPaper = require("./api/return-paper");
const paperType = require("./api/paper-type");
const paperKind = require("./api/paper-kind");
const department = require("./api/department");
const about = require("./api/about");

router.use(
    // `${process.env.SUB_URL}/api/v${process.env.API_VERSION}`,
    `/api/v${process.env.API_VERSION}`,
    router.use("/role", role),
    router.use("/user", user),
    router.use("/login-log", loginLog),
    router.use("/froala", froala),
    router.use("/file-attach", fileAttach),
    router.use("/email", email),
    router.use("/paper", paper),
    router.use("/budget", budget),
    router.use("/budget2", budget2),
    router.use("/budget3", budget3),
    router.use("/researcher", researcher),
    router.use("/method-list", methodList),
    router.use("/review", review),
    router.use("/reviewer", reviewer),
    router.use("/return-paper", returnPaper),
    router.use("/paper-type", paperType),
    router.use("/paper-kind", paperKind),
    router.use("/department", department),
    router.use("/about", about)
);

module.exports = router;
