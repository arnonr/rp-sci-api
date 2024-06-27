const { PrismaClient } = require("@prisma/client");
const { countDataAndOrder } = require("../utils/pagination");
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
        $where["some"] = {
            OR: [
                { firstname: firstName },
                { surname: surName },
                { firstname: surName },
                { surname: firstName },
            ],
        };
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
    prefix_name: true,
    firstname: true,
    surname: true,
    fullname: true,
    email: true,
    organization_name: true,
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    is_active: true,
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
                prefix_name,
                firstname,
                surname,
                organization_name,
                email,
            } = req.body;

            const item = await prisma[$table].create({
                data: {
                    prefix_name,
                    firstname,
                    surname,
                    organization_name,
                    email,
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
                prefix_name,
                firstname,
                surname,
                organization_name,
                email,
            } = req.body;

            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    detail: detail || undefined,
                    prefix_name: prefix_name || undefined,
                    firstname: firstname || undefined,
                    surname: surname || undefined,
                    organization_name: organization_name || undefined,
                    email: email || undefined,
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
};

module.exports = { ...methods };
