const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { countDataAndOrder } = require("../utils/pagination");
const $table = "review";

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
                detail,
                review_status,
                reviewer_id,
                paper_id,
                is_send_mail,
            } = req.body;

            const item = await prisma[$table].create({
                data: {
                    detail,
                    review_status: Number(review_status),
                    reviewer_id: Number(reviewer_id),
                    is_send_mail: Number(is_send_mail),
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
                detail,
                review_status,
                reviewer_id,
                paper_id,
                is_send_mail,
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
