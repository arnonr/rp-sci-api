const { PrismaClient } = require("@prisma/client");
const { countDataAndOrder } = require("../utils/pagination");
const prisma = new PrismaClient();
const $table = "about";

const filterData = (req) => {
    let $where = {
        deleted_at: null,
    };

    if (req.query.id) {
        $where["id"] = Number(req.query.id);
    }

    if (req.query.title) {
        $where["title"] = {
            contains: req.query.title,
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
    title: true,
    detail: true,
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    is_active: true,
};

const cutFroala = (detail) => {
    let detail_success =
        detail != null
            ? detail
                  .replaceAll("Powered by", "")
                  .replaceAll(
                      '<p data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;">',
                      ""
                  )
                  .replaceAll(
                      '<a href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor">',
                      ""
                  )
                  .replaceAll("Froala Editor</a></p>", "")
            : undefined;
    return detail_success;
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
            const { title, detail } = req.body;

            const item = await prisma[$table].create({
                data: {
                    title,
                    detail: cutFroala(req.body.detail),
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
            const { title, detail } = req.body;

            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    title: title || undefined,
                    detail: cutFroala(detail) || undefined,
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
