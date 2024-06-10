const { PrismaClient } = require("@prisma/client");
const uploadController = require("./UploadsController");

const $table = "user";
const { v4: uuidv4 } = require("uuid");
jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const encrypt = (text) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(text, salt);
    return hash;
};

// const prisma = new PrismaClient();
const prisma = new PrismaClient().$extends({
    result: {
        user: {
            fullname: {
                needs: { firstname: true, lastname: true },
                compute(user) {
                    return user.firstname + " " + user.lastname;
                },
            },
        },
    },
});

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    uuid: true,
    fullname: true,
    firstname: true,
    lastname: true,
    officer_code: true,
    id_card: true,
    position_id: true,
    section_id: true,
    role_id: true,
    inspector_id: true,
    bureau_id: true,
    division_id: true,
    agency_id: true,
    phone_number: true,
    status: true,
    email: true,
    line_id: true,
    birthday: true,
    
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    deleted_at: true,
    deleted_by: true,
    is_active: true,
};

const filterData = (req) => {
    let $where = {
        deleted_at: null,
    };

    if (req.query.id) {
        $where["id"] = parseInt(req.query.id);
    }

    if (req.query.firstname) {
        $where["firstname"] = { contains: req.query.firstname };
    }

    if (req.query.lastname) {
        $where["lastname"] = { contains: req.query.lastname };
    }

    if (req.query.officer_code) {
        $where["officer_code"] = { contains: req.query.officer_code };
    }

    if (req.query.id_card) {
        $where["id_card"] = { contains: req.query.id_card };
    }

    if (req.query.position_id) {
        $where["position_id"] = parseInt(req.query.position_id);
    }

    if (req.query.section_id) {
        $where["section_id"] = parseInt(req.query.section_id);
    }

    if (req.query.role_id) {
        $where["role_id"] = parseInt(req.query.role_id);
    }

    if (req.query.phone_number) {
        $where["phone_number"] = { contains: req.query.phone_number };
    }

    if (req.query.status) {
        $where["status"] = parseInt(req.query.status);
    }

    if (req.query.email) {
        $where["email"] = { contains: req.query.email };
    }

    if (req.query.is_active) {
        $where["is_active"] = parseInt(req.query.is_active);
    }

    if (req.query.fullname) {
        const [firstName, lastName] = req.query.fullname.split(" ");
        $where = {
            ...$where,
            OR: [
                { firstname: { contains: firstName } },
                { lastname: { contains: lastName } },
                { firstname: { contains: lastName } },
                { lastname: { contains: firstName } },
            ],
        };
    }

    return $where;
};

// หาจำนวนทั้งหมดและลำดับ
const countDataAndOrder = async (req, $where) => {
    //   Order
    let $orderBy = {};
    if (req.query.orderBy) {
        $orderBy[req.query.orderBy] = req.query.order;
    } else {
        $orderBy = { created_at: "asc" };
    }

    //Count
    let $count = await prisma[$table].count({
        where: $where,
    });

    let $perPage = req.query.perPage ? Number(req.query.perPage) : 10;
    let $currentPage = req.query.currentPage
        ? Number(req.query.currentPage)
        : 1;
    let $totalPage =
        Math.ceil($count / $perPage) == 0 ? 1 : Math.ceil($count / $perPage);
    let $offset = $perPage * ($currentPage - 1);

    return {
        $orderBy: $orderBy,
        $offset: $offset,
        $perPage: $perPage,
        $count: $count,
        $totalPage: $totalPage,
        $currentPage: $currentPage,
    };
};

const checkLanguage = (req) => {
    let prismaLang = prisma.$extends({
        result: {
            table: {
                name: {
                    needs: { name_th: true },
                    compute(table) {
                        return req.query.lang && req.query.lang == "en"
                            ? table.name_en
                            : table.name_th;
                    },
                },
            },
        },
    });

    return prismaLang;
};

const methods = {
    async onGetAll(req, res) {
        try {
            let $where = filterData(req);
            let other = await countDataAndOrder(req, $where);

            let prismaLang = checkLanguage(req);

            const item = await prismaLang[$table].findMany({
                select: selectField,
                where: $where,
                orderBy: other.$orderBy,
                skip: other.$offset,
                take: other.$perPage,
            });

            res.status(200).json({
                totalData: other.$count,
                totalPage: other.$totalPage,
                currentPage: other.$currentPage,
                lang: req.query.lang ? req.query.lang : "",
                msg: "success",
                data: item,
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
           
            const user = await prisma[$table].findUnique({
                where: {
                    email: req.body.email,
                },
            });

            if (user != null) {
                throw new Error("Email are already exist");
            }

            const item = await prisma[$table].create({
                data: {
                    uuid: uuidv4(),
                    prefix_name_id: Number(req.body.prefix_name_id),
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    officer_code: req.body.officer_code,
                    id_card: req.body.id_card,
                    role_id: Number(req.body.role_id),

                    position_id: Number(req.body.position_id),
                    section_id: Number(req.body.section_id),
                    phone_number: req.body.phone_number,
                    status: Number(req.body.status),
                    email: req.body.email,
                    password: encrypt(req.body.password),
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
            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    firstname:
                        req.body.firstname != null
                            ? req.body.firstname
                            : undefined,
                    lastname:
                        req.body.lastname != null
                            ? req.body.lastname
                            : undefined,
                    officer_code:
                        req.body.officer_code != null
                            ? req.body.officer_code
                            : undefined,
                    id_card:
                        req.body.id_card != null ? req.body.id_card : undefined,
                    position_id:
                        req.body.position_id != null
                            ? Number(req.body.position_id)
                            : undefined,
                    role_id:
                        req.body.role_id != null
                            ? Number(req.body.role_id)
                            : undefined,

                    section_id:
                        req.body.section_id != null
                            ? Number(req.body.section_id)
                            : undefined,
                    phone_number:
                        req.body.phone_number != null
                            ? req.body.phone_number
                            : undefined,
                    status:
                        req.body.status != null
                            ? Number(req.body.status)
                            : undefined,
                    email: req.body.email != null ? req.body.email : undefined,
                    password:
                        req.body.password != null
                            ? encrypt(req.body.password)
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

    async onLogin(req, res) {
        try {
            const item = await prisma[$table].findUnique({
                select: { ...selectField, password: true },
                where: {
                    email: req.body.email,
                    is_active: 1,
                },
            });

            // if(item == null) throw new Error("Username หรือ Password ไม่ถูกต้อง")

            if (
                item == null ||
                bcrypt.compareSync(req.body.password, item.password) == false
            ) {
                throw new Error("Invalid credential");
            }

            if (item.status == 2) {
                throw new Error("Not Confirm Email");
            }

            const payload = item;
            const secretKey = process.env.SECRET_KEY;

            const token = jwt.sign(payload, secretKey, {
                expiresIn: "90d",
            });

            res.status(200).json({
                data: item,
                token: token,
                msg: "success",
            });
        } catch (error) {
            res.status(404).json({ msg: error.message });
        }
    },
};

module.exports = { ...methods };
