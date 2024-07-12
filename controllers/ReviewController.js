const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { countDataAndOrder } = require("../utils/pagination");
const nodemailer = require("nodemailer");
const $table = "review";

const sendEmail = async (mailto, subject, body) => {
    if (mailto == "" || mailto == "" || mailto == "") {
        return res.status(500).send("error");
    }

    if (!subject) {
        subject = "แบบฟอร์ม........";
    }

    if (!body) {
        body = "<h1>แบบฟอร์ม......</h1>";
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
            logger: true,
            debug: true,
        });

        await transporter.sendMail({
            from: process.env.EMAIL_FROM, // อีเมลผู้ส่ง
            to: mailto, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
            subject: subject, // หัวข้ออีเมล
            html: body, // html body
        });

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const filterData = (req) => {
    let $where = {
        deleted_at: null,
    };

    if (req.query.id) {
        $where["id"] = Number(req.query.id);
    }

    if (req.query.detail) {
        $where["detail"] = {
            contains: req.query.detail,
        };
    }

    if (req.query.review_status) {
        $where["review_status"] = Number(req.query.review_status);
    }

    if (req.query.reviewer_id) {
        $where["reviewer_id"] = Number(req.query.reviewer_id);
    }

    if (req.query.is_send_mail) {
        $where["is_send_mail"] = Number(req.query.is_send_mail);
    }

    if (req.query.paper_id) {
        $where["paper_id"] = Number(req.query.paper_id);
    }

    if (req.query.is_active) {
        $where["is_active"] = Number(req.query.is_active);
    }

    return $where;
};

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    detail: true,
    review_status: true,
    reviewer_id: true,
    paper_id: true,
    is_send_mail: true,
    time_no_send_mail: true,
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    is_active: true,
    reviewer: {
        select: {
            id: true,
            prefix_name: true,
            firstname: true,
            surname: true,
            email: true,
        },
    },
};

const methods = {
    async onGetAll(req, res) {
        try {
            let $where = filterData(req);
            let other = await countDataAndOrder(req, $where, $table);

            const item = await prisma[$table].findMany({
                select: selectField,
                where: $where,
                orderBy: other.$orderBy,
                skip: other.$offset,
                take: other.$perPage,
            });

            res.status(200).json({
                data: item,
                totalData: other.$count,
                totalPage: other.$totalPage,
                currentPage: other.$currentPage,
                msg: "success",
            });
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    async onGetById(req, res) {
        try {
            const item = await prisma[$table].findUnique({
                select: selectField,
                where: {
                    id: Number(req.params.id),
                },
            });

            res.status(200).json({
                data: item,
                msg: "success",
            });
        } catch (error) {
            res.status(404).json({ msg: error.message });
        }
    },

    // สร้าง
    async onCreate(req, res) {
        try {
            const {
                detail,
                review_status,
                reviewer_id,
                paper_id,
                is_send_mail,
                time_no_send_mail,
            } = req.body;

            const item = await prisma[$table].create({
                data: {
                    detail,
                    review_status: Number(review_status),
                    reviewer_id: Number(reviewer_id),
                    is_send_mail: Number(is_send_mail),
                    paper_id: Number(paper_id),
                    time_no_send_mail: Number(time_no_send_mail),
                },
            });

            res.status(201).json({ ...item, msg: "success" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    // แก้ไข
    async onUpdate(req, res) {
        try {
            const {
                detail,
                review_status,
                reviewer_id,
                paper_id,
                is_send_mail,
                time_no_send_mail,
            } = req.body;

            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    detail: detail || undefined,
                    review_status: review_status
                        ? Number(review_status)
                        : undefined,
                    reviewer_id: reviewer_id ? Number(reviewer_id) : undefined,
                    is_send_mail: is_send_mail
                        ? Number(is_send_mail)
                        : undefined,
                    paper_id: paper_id ? Number(paper_id) : undefined,
                    time_no_send_mail: time_no_send_mail
                        ? Number(time_no_send_mail)
                        : undefined,
                },
            });

            res.status(200).json({ ...item, msg: "success" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
    // ลบ
    async onDelete(req, res) {
        try {
            await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    deleted_at: new Date().toISOString(),
                },
            });

            res.status(200).json({
                msg: "success",
            });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    // ส่งเมล
    async onSendMail(req, res) {
        try {
            const { time_no_send_mail } = req.body;

            // Send Mail

            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    time_no_send_mail: time_no_send_mail
                        ? Number(time_no_send_mail)
                        : undefined,
                },
            });

            const reviewer = await prisma.reviewer.findUnique({
                select: {
                    email: true,
                },
                where: {
                    id: Number(item.reviewer_id),
                },
            });

            let mailto = reviewer.email;
            let subject = "กรุณาประเมินข้อเสนอโครงการวิจัย...........";
            let body =
                "ลิงค์การประเมิน : <a href='" +
                process.env.REVIEW_URL +
                "'>คลิก</a>";
            let result = await sendEmail(mailto, subject, body);

            if (result) {
                return res.status(200).json({ msg: "success" });
            } else {
                return res.status(500).json({ msg: "error" });
            }

            // res.status(200).json({ ...item, msg: "success" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
};

module.exports = { ...methods };
