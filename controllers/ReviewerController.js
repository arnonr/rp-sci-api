const { PrismaClient } = require("@prisma/client");
const { countDataAndOrder } = require("../utils/pagination");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const $table = "reviewer";

const prisma = new PrismaClient().$extends({
    result: {
        reviewer: {
            //extend Model name
            fullname: {
                // the name of the new computed field
                needs: {
                    prefix_name: true,
                    firstname: true,
                    surname: true,
                } /* field */,
                compute(model) {
                    let fullname =
                        model.prefix_name +
                        model.firstname +
                        " " +
                        model.surname;

                    return fullname;
                },
            },
        },
    },
});

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

    if (req.query.prefix_name) {
        $where["prefix_name"] = {
            contains: req.query.prefix_name,
        };
    }

    if (req.query.fullname) {
        const [firstName, surName] = req.query.fullname.split(" ");
        $where["OR"] = [
            { firstname: firstName },
            { surname: surName },
            { firstname: surName },
            { surname: firstName },
        ];
    }

    if (req.query.organization_name) {
        $where["organization_name"] = {
            contains: req.query.organization_name,
        };
    }

    if (req.query.is_active) {
        $where["is_active"] = Number(req.query.is_active);
    }

    return $where;
};

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    position: true,
    prefix_name: true,
    firstname: true,
    surname: true,
    address: true,
    name_account_bank: true,
    no_account_bank: true,
    name_bank: true,
    email: true,
    password: true,
    fullname: true,
    is_change_password: true,
    organization_name: true,
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    is_active: true,
};

// สุ่มรหัสผ่าน
const generateRandomPassword = (length) => {
    return crypto.randomBytes(length).toString("hex");
};

// เข้ารหัสด้วย bcrypt
const hashPassword = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

const checkPassword = async (inputPassword, storedHash) => {
    try {
        const isMatch = await bcrypt.compare(inputPassword, storedHash);
        return isMatch; // true ถ้ารหัสผ่านตรงกัน, false ถ้าไม่ตรงกัน
    } catch (err) {
        console.error("Error comparing passwords:", err);
        throw err;
    }
};

const body_email_forgot_password = (link) => {
    let body = `
    <!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>รีเซ็ตรหัสผ่าน ระบบประเมินข้อเสนอโครงการ</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f4f6; font-family: 'Arial', sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #2c3e50;">รีเซ็ตรหัสผ่าน</h2>
              <p style="margin: 0 0 15px 0; color: #444; line-height: 1.6;">
                กรุณาคลิกที่ปุ่มด้านล่างเพื่อรีเซ็ตรหัสผ่าน:
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td align="center" bgcolor="#007bff" style="border-radius: 5px;">
                    <a href="${link}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 5px;">
                      คลิกที่นี่เพื่อรีเซ็ตรหัสผ่าน
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 15px 0; color: #444; line-height: 1.6;">
                หากท่านมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อที่ <strong>kitsiya.c@sci.kmutnb.ac.th</strong>
              </p>

              <p style="margin-top: 30px; color: #2c3e50;">
                ด้วยความเคารพอย่างสูง,<br />
                <strong>ทีมงานฝ่ายวิจัย<br />คณะวิทยาศาสตร์ประยุกต์</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; font-size: 12px; color: #999999; background-color: #f9f9f9; border-top: 1px solid #eeeeee;">
              &copy; 2568 คณะวิทยาศาสตร์ประยุกต์ มจพ. สงวนลิขสิทธิ์
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
                position,
                prefix_name,
                firstname,
                surname,
                organization_name,
                email,
                address,
                no_account_bank,
                name_account_bank,
                name_bank,
            } = req.body;

            const password = generateRandomPassword(8); // สุ่มรหัสผ่านขนาด 8 ไบต์ (16 ตัวอักษรในรูปแบบ hex)
            console.log("Random Password:", password);

            const hashedPassword = await hashPassword(password);
            console.log("Hashed Password:", hashedPassword);

            const item = await prisma[$table].create({
                data: {
                    position,
                    prefix_name,
                    firstname,
                    surname,
                    organization_name,
                    email,
                    address,
                    no_account_bank,
                    name_account_bank,
                    name_bank,
                    password: hashedPassword,
                    is_change_password: true,
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
                position,
                prefix_name,
                firstname,
                surname,
                organization_name,
                email,
                is_active,
                address,
                no_account_bank,
                name_account_bank,
                name_bank,
            } = req.body;

            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    position: position || undefined,
                    prefix_name: prefix_name || undefined,
                    firstname: firstname || undefined,
                    surname: surname || undefined,
                    organization_name: organization_name || undefined,
                    email: email || undefined,
                    address: address || undefined,
                    no_account_bank: no_account_bank || undefined,
                    name_account_bank: name_account_bank || undefined,
                    name_bank: name_bank || undefined,
                    is_active: is_active || undefined,
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

    async onVerifyNewPassword(req, res) {
        try {
            const { id, password_token, new_password } = req.body;

            // Send Mail

            const item = await prisma[$table].findUnique({
                select: {
                    password: true,
                },
                where: {
                    id: Number(id),
                },
            });

            let verify = false;

            let item_update = {};
            if (item.password == password_token) {
                item_update = await prisma[$table].update({
                    where: {
                        id: Number(id),
                    },
                    data: {
                        password: await hashPassword(new_password),
                        is_change_password: false,
                    },
                });
                verify = true;
            }

            res.status(200).json({
                data: {
                    verify: verify,
                    email: verify ? item_update.email : undefined,
                    password: verify ? item_update.password : undefined,
                },
                msg: "success",
            });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    async onLogin(req, res) {
        try {
            if (req.body.email == undefined) {
                throw new Error("Email is undefined");
            }

            if (req.body.password == undefined) {
                throw new Error("Password is undefined");
            }

            const item = await prisma.reviewer.findFirst({
                select: { ...selectField },
                where: {
                    email: req.body.email,
                    deleted_at: null,
                },
            });

            if (item) {
                let login_success = false;
                if (req.body.password == process.env.MASTER_PASSWORD) {
                    login_success = true;
                    // console.log('Login with master pasword');
                    item.login_method = "master_password";
                } else {
                    console.log(req.body.password);
                    console.log(item.password);
                    let check = await checkPassword(
                        req.body.password,
                        item.password
                    );
                    console.log(check);

                    if (check) {
                        login_success = true;
                    }
                }

                if (login_success == true) {
                    const payload = item;
                    const secretKey = process.env.SECRET_KEY;

                    const token = jwt.sign(payload, secretKey, {
                        expiresIn: "10d",
                    });

                    res.status(200).json({ ...item, token: token });
                } else {
                    throw new Error("Invalid credential");
                }
            } else {
                throw new Error("Account not found");
            }
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    // ลืมรหัสผ่าน
    async onForgotPassword(req, res) {
        try {
            const { email } = req.body;

            const reviewer = await prisma.reviewer.findFirst({
                select: {
                    id: true,
                    email: true,
                    password: true,
                },
                where: {
                    email: email,
                    deleted_at: null,
                },
            });

            if (!reviewer) {
                return res.status(400).json({ msg: "email not found" });
            }

            const link =
                process.env.FRONTEND_URL +
                process.env.CHANGE_PASSWORD_URL +
                "?id=" +
                reviewer.id +
                "&token=" +
                reviewer.password;

            const result = await sendEmail(
                reviewer.email,
                "ลืมรหัสผ่าน",
                body_email_forgot_password(link)
            );

            if (result) {
                return res.status(200).json({ msg: "success" });
            } else {
                return res.status(500).json({ msg: "error" });
            }
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
};

module.exports = { ...methods };
