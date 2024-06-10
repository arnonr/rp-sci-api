var path = require("path");
// const sharp = require('sharp');
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
var fs = require('fs');

const methods = {
    async onUploadFile(req, real_path, attribute_name) {

        try {

        let pathFile = null;

        if (!req.files || Object.keys(req.files).length === 0) {

        } else {

            // console.log(Object.keys(req.files));
            // console.log(req.files);
            // console.log(attribute_name);
            // let fileObject = Object.keys(req.files);
            // console.log(typeof fileObject); //;
            if(req.files[attribute_name] == undefined) {
                return null;
            }

            let uploadFile = req.files[attribute_name];
            let typeFile = uploadFile.mimetype.split("/");

            const today = new Date();
            const month = `${today.getMonth() + 1}`.padStart(2, '0');
            const date = `${today.getDate()}`.padStart(2, '0');

            const dateFormat = today.getFullYear() + "" + month + "" + date;
            const nameFile = dateFormat + "_" + uuidv4() + "." + typeFile[1];

            const dir = "public/uploads" + real_path;

            /* Create path if not exists */
            try{
                if (!fs.existsSync(dir)){
                    console.log("Create path: " + dir);

                    /* Create path */
                    fs.mkdir(dir, { recursive: true }, (err) => {
                        if(err) console.log(err);
                    })
                }
            } catch (error) {
                console.log(error);
            }

            const uploadFolder = "/../" + dir;
            let pathUpload = path.resolve(
                __dirname + uploadFolder + nameFile
            );

            // console.log(pathUpload);

            // console.log(uploadFile.data.buffer);

            // /* Resize and save to path */
            // sharp(uploadFile.data.buffer)
            // .resize(300)
            // .toFile(pathUpload, (err, info) => {
            //     console.log(info);
            //     if (err) return err;
            // });

            /* Move to path */
            uploadFile.mv(pathUpload, function (err) {
                if (err) return err;
                // console.log('File uploaded and moved!');
            });

            pathFile = real_path + nameFile;

            // console.log(pathFile);
            // sharp(pathUpload)
            // .resize(100, 100)
            // // .toBuffer();
            // .toFile(pathUpload, (err, info) => {

            // })
        }

        return pathFile;

        } catch (error) {
            return "error";
            // return error;
        }
    },
};

module.exports = { ...methods };
