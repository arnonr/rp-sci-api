const uploadController = require("./UploadsController");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

const methods = {
  // สร้าง
  async onUploadImage(req, res) {
    try {
      let pathFile = await uploadController.onUploadFile(
        req,
        "/froala/images/",
        "file"
      );

      if (pathFile == "error") {
        res.status(500).send("error");
      } else {
        res.status(201).json({ link: process.env.PATH_UPLOAD + pathFile });
      }
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  async onUploadDocument(req, res) {
    try {
      let pathFile = await uploadController.onUploadFile(
        req,
        "/froala/documents/",
        "file"
      );

      if (pathFile == "error") {
        res.status(500).send("error");
      } else {
        res.status(201).json({ link: process.env.PATH_UPLOAD + pathFile });
      }
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  async onUploadVideo(req, res) {
    try {
      let pathFile = await uploadController.onUploadFile(
        req,
        "/froala/videos/",
        "file"
      );

      if (pathFile == "error") {
        res.status(500).send("error");
      } else {
        res.status(201).json({ link: process.env.PATH_UPLOAD + pathFile });
      }
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  async onUploadUppy(req, res) {

    let authUsername = null;
    if(req.headers.authorization !== undefined){
        const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
        authUsername = decoded.username;
    }

    try {
      let table_name = req.body.table_name;

      let pathFile = await uploadController.onUploadFile(
        req,
        "/uppy/" + table_name + "/",
        "file"
      );

      if (pathFile == "error") {
        res.status(500).send("error");
      } else {
        let data = {};
        data[table_name + "_id"] = req.body[table_name + "_id"] != null ? Number(req.body[table_name + "_id"]) : null;
        data["filename"] = pathFile;
        data["secret_key"] = req.body.secret_key;
        data["created_by"] = authUsername;
        data["updated_by"] = authUsername;

        const item = await prisma["file_attach"].create({
          data: data,
        });

        let return_json = {};
        return_json["message"] = "success";
        return_json["link"] = pathFile;
        return_json["secret_key"] = req.body.secret_key;
        return_json[table_name + "_id"] = item[table_name + "_id"];
        return_json["id"] = item.id;
        res.status(201).json(return_json);
      }
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = { ...methods };
