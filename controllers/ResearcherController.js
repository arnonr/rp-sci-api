const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { countDataAndOrder } = require("../utils/pagination");
const $table = "researcher";

const filterData = (req) => {
    let $where = {
        deleted_at: null,
    };

    if (req.query.id) {
        $where["id"] = Number(req.query.id);
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

    if (req.query.department_id) {
        $where["department_id"] = Number(req.query.department_id);
    }

    if (req.query.department_text) {
        $where["department_text"] = {
            contains: req.query.department_text,
        };
    }

    if (req.query.phone_number) {
        $where["phone_number"] = {
            contains: req.query.phone_number,
        };
    }

    if (req.query.researcher_type) {
        $where["researcher_type"] = Number(req.query.researcher_type);
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
    prefix_name: true,
    firstname: true,
    surname: true,
    department_id: true,
    department_text: true,
    phone_number: true,
    expertise: true,
    researcher_type: true,
    percentage: true,
    paper_id: true,
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    deleted_at: true,
    deleted_by: true,
    is_active: true,
};

const methods = {
    async onGetAll(req, res) {
        try {
            let $where = filterData(req);
            let other = await countDataAndOrder(req, $where,$table);

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
                department_id,
                department_text,
                phone_number,
                expertise,
                researcher_type,
                percentage,
                paper_id,
            } = req.body;

            const item = await prisma[$table].create({
                data: {
                    prefix_name,
                    firstname,
                    surname,
                    department_text,
                    phone_number,
                    expertise,
                    researcher_type: Number(researcher_type),
                    percentage: parseFloat(percentage),
                    department_id: Number(department_id),
                    paper_id: Number(paper_id),
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
                department_id,
                department_text,
                phone_number,
                expertise,
                researcher_type,
                percentage,
                paper_id,
            } = req.body;

            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    prefix_name: prefix_name || undefined,
                    firstname: firstname || undefined,
                    surname: surname || undefined,
                    department_text: department_text || undefined,
                    phone_number: phone_number || undefined,
                    expertise: expertise || undefined,
                    researcher_type: researcher_type
                        ? Number(researcher_type)
                        : undefined,
                    percentage: percentage ? Number(percentage) : undefined,
                    department_id: department_id
                        ? Number(department_id)
                        : undefined,
                    paper_id: paper_id ? Number(req.body.paper_id) : undefined,
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
