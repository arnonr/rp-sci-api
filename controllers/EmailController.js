const { PrismaClient } = require("@prisma/client");

const nodemailer = require("nodemailer");
const prisma = new PrismaClient();

const sendEmail = async (mailto, subject, body) => {

    if(mailto == "" || mailto == "" || mailto == "") {
        return res.status(500).send("error");
    }

    if(!subject) {
        subject = "JCOMS notification";
    }

    if(!body) {
        body = "<h1>JCOMS notification</h1>";
    }

    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                // ข้อมูลการเข้าสู่ระบบ
                user: process.env.EMAIL_USERNAME, // email user ของเรา
                pass: process.env.EMAIL_PASSWORD, // email password
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_FROM, // อีเมลผู้ส่ง
            to: mailto, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
            subject: subject, // หัวข้ออีเมล
            html: body, // html body
        });

        return true
    } catch (error) {
        console.log(error)
        return false
    }
};

const methods = {

    async onSendEmail(req, res) {

        let mailto = req.body.mailto;
        let subject = req.body.subject;
        let body = req.body.body;

        if(!mailto) {
            return res.status(400).json({ msg: "mailto is undefined" });
        }

        if(!subject) {
            return res.status(400).json({ msg: "subject is undefined" });
        }

        if(!body) {
            return res.status(400).json({ msg: "body is undefined" });
        }

        let result = await sendEmail(mailto, subject, body);

        if(result) {
            return res.status(200).json({ msg: "success" });
        } else {
            return res.status(500).json({ msg: "error" });
        }
    }
};

module.exports = { ...methods, sendEmail };
