const { PrismaClient } = require("@prisma/client");
const uploadController = require("./UploadsController");

const prisma = new PrismaClient().$extends({
    result: {
        review: {
            //extend Model name
            review_file: {
                // the name of the new computed field
                needs: { review_file: true } /* field */,
                compute(model) {
                    let review_file = null;

                    if (model.review_file != null) {
                        review_file =
                            process.env.PATH_UPLOAD + model.review_file;
                    }

                    return review_file;
                },
            },
        },
    },
});

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

    if (req.query.time_no_send_mail) {
        if (req.query.time_no_send_mail == "not zero") {
            $where["time_no_send_mail"] = { gt: 0 };
        }
    }

    return $where;
};

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    detail: true,
    review_file: true,
    review_status: true,
    reviewer_id: true,
    paper_id: true,
    is_send_mail: true,
    time_no_send_mail: true,
    score_1: true,
    score_2: true,
    score_3: true,
    score_4: true,
    score_5: true,
    score_6: true,
    score_7: true,
    score_8: true,
    score_9: true,
    score_10: true,
    score_11: true,
    score_12: true,
    score_13: true,
    budget_status: true,
    comment: true,
    budget_comment: true,
    confident_comment: true,
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
    paper: {
        select: {
            rp_no: true,
            title_th: true,
            paper_type: {
                select: {
                    name: true,
                },
            },
        },
    },
};

const body_email = (link) => {
    let body = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #333333;
        }
        p {
            color: #555555;
            line-height: 1.6;
        }
        a.button {
            display: inline-block;
            background-color: #007bff;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        a.button:hover {
            background-color: #0056b3;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #999999;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>เรียน ท่านผู้ประเมิน</h2>
        <p>ท่านได้รับเชิญให้ประเมินข้อเสนอโครงการวิจัย โปรดใช้ลิงก์ด้านล่างนี้ในการเข้าถึงแบบประเมิน:</p>
        <a href="${link}" class="button">คลิกที่นี่เพื่อประเมิน</a>
        <p>หากท่านมีข้อสงสัย หรือต้องการข้อมูลเพิ่มเติม กรุณาติดต่อเราที่ [email or phone number].</p>
        <p>ขอขอบคุณท่านที่สละเวลาประเมินข้อเสนอโครงการนี้</p>
        <div class="footer">
            <p>&copy; 2567 คณะวิทยาศาสตร์ประยุกต์. สงวนลิขสิทธิ์</p>
        </div>
    </div>
</body>
</html>
`;

    return body;
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
                score_1,
                score_2,
                score_3,
                score_4,
                score_5,
                score_6,
                score_7,
                score_8,
                score_9,
                score_10,
                score_11,
                score_12,
                score_13,
                budget_status,
                comment,
                budget_comment,
                confident_comment,
            } = req.body;

            let reviewPathFile = await uploadController.onUploadFile(
                req,
                "/review/",
                "review_file"
            );

            if (reviewPathFile == "error") {
                return res.status(500).send("error");
            }

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

                    score_1: score_1 ? Number(score_1) : undefined,
                    score_2: score_2 ? Number(score_2) : undefined,
                    score_3: score_3 ? Number(score_3) : undefined,
                    score_4: score_4 ? Number(score_4) : undefined,
                    score_5: score_5 ? Number(score_5) : undefined,
                    score_6: score_6 ? Number(score_6) : undefined,
                    score_7: score_7 ? Number(score_7) : undefined,
                    score_8: score_8 ? Number(score_8) : undefined,
                    score_9: score_9 ? Number(score_9) : undefined,
                    score_10: score_10 ? Number(score_10) : undefined,
                    score_11: score_11 ? Number(score_11) : undefined,
                    score_12: score_12 ? Number(score_12) : undefined,
                    score_13: score_13 ? Number(score_13) : undefined,
                    budget_status: budget_status
                        ? Number(budget_status)
                        : undefined,
                    comment: comment || undefined,
                    budget_comment: budget_comment || undefined,
                    confident_comment: confident_comment || undefined,
                    review_file: reviewPathFile != null ? reviewPathFile : undefined,
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
            const { time_no_send_mail, paper_id } = req.body;

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

            const paper = await prisma["paper"].findUnique({
                select: {
                    title_th: true,
                },
                where: {
                    id: Number(paper_id),
                },
            });

            const reviewer = await prisma.reviewer.findUnique({
                select: {
                    id: true,
                    email: true,
                    is_change_password: true,
                    password: true,
                },
                where: {
                    id: Number(item.reviewer_id),
                },
            });

            let link = process.env.FRONTEND_URL + process.env.REVIEW_URL;
            console.log(reviewer);
            if (reviewer.is_change_password == true) {
                link =
                    process.env.FRONTEND_URL +
                    process.env.CHANGE_PASSWORD_URL +
                    "?id=" +
                    reviewer.id +
                    "&token=" +
                    reviewer.password;
            }

            let mailto = reviewer.email;
            let subject =
                "กรุณาประเมินข้อเสนอโครงการวิจัยหัวข้อ " + paper.title_th;
            let result = await sendEmail(mailto, subject, body_email(link));

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
