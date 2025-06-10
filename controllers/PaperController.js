const { PrismaClient } = require("@prisma/client");
const uploadController = require("./UploadsController");
const { v4: uuidv4 } = require("uuid");
const $table = "paper";
const $table_file_attach = "file_attach";
const { countDataAndOrder } = require("../utils/pagination");

const prisma = new PrismaClient();

// const prisma = new PrismaClient();
// .$extends({
//   result: {
//     paper: {
//       //extend Model name
//       receive_doc_filename: {
//         // the name of the new computed field
//         needs: { receive_doc_filename: true } /* field */,
//         compute(model) {
//           let receive_doc_filename = null;

//           if (model.receive_doc_filename != null) {
//             receive_doc_filename =
//               process.env.PATH_UPLOAD + model.paper_filename;
//           }

//           return receive_doc_filename;
//         },
//       },
//     },
//   },
// });

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    rp_no: true,
    user_id: true,
    title_th: true,
    department_id: true,
    paper_type_id: true,
    paper_kind_id: true,
    status_id: true,
    sended_at: true,
    sended_user_id: true,
    approved_at: true,
    approved_user_id: true,
    approved_detail: true,
    is_active: true,
    created_at: true,
    created_by: true,
    paper_type: {
        select: {
            id: true,
            name: true,
        },
    },
    paper_kind: {
        select: {
            id: true,
            name: true,
        },
    },
    department: {
        select: {
            id: true,
            name: true,
        },
    },
    review: {
        select: {
            id: true,
            review_status: true,
            // score_1: true,
            // score_2: true,
            // score_3: true,
            // score_4: true,
            // score_5: true,
            // score_6: true,
            // score_7: true,
            // score_8: true,
            // score_9: true,
            // score_10: true,
            // score_11: true,
            // score_12: true,
            // score_13: true,
        },
    },
    user: {
        select: {
            // prefix_name: true,
            id: true,
            prefix_name: true,
            firstname: true,
            surname: true,
        },
    },
};

const selectFieldId = {
    id: true,
    rp_no: true,
    user_id: true,
    title_th: true,
    title_en: true,
    abstract: true,
    keyword: true,
    department_id: true,
    paper_type_id: true,
    paper_kind_id: true,
    history: true,
    objective: true,
    scope: true,
    review_literature: true,
    method: true,
    benefit: true,
    location: true,
    references: true,
    status_id: true,
    sended_at: true,
    sended_user_id: true,
    approved_at: true,
    approved_user_id: true,
    approved_detail: true,
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    is_active: true,
    budget: {
        select: {
            id: true,
            detail: true,
            amount: true,
        },
    },
    budget2: {
        select: {
            id: true,
            detail: true,
            amount: true,
        },
    },
    budget3: {
        select: {
            id: true,
            detail: true,
            amount: true,
        },
    },
    file_attach: {
        select: {
            id: true,
            filename: true,
            secret_key: true,
        },
    },
    method_list: {
        select: {
            id: true,
            start_date: true,
            end_date: true,
            detail: true,
        },
    },
    researcher: {
        select: {
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
            department: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    return_paper: {
        select: {
            id: true,
            detail: true,
        },
    },
    review: {
        select: {
            id: true,
            detail: true,
            review_status: true,
            reviewer_id: true,
            is_send_mail: true,
            reviewer: {
                select: {
                    id: true,
                    prefix_name: true,
                    firstname: true,
                    surname: true,
                    organization_name: true,
                },
            },
        },
    },
    paper_type: {
        select: {
            id: true,
            name: true,
        },
    },
    paper_kind: {
        select: {
            id: true,
            name: true,
        },
    },

    department: {
        select: {
            id: true,
            name: true,
        },
    },

    user: {
        select: {
            // prefix_name: true,
            id: true,
            prefix_name: true,
            firstname: true,
            surname: true,
        },
    },
};

const filterData = (req) => {
    let $where = {
        deleted_at: null,
    };

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

    if (req.query.create_year) {
        const year = Number(req.query.create_year, 10);
        const startOfYear = new Date(year, 0, 1); // January 1st of the given year
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st of the given year

        $where["created_at"] = {
            gte: startOfYear,
            lte: endOfYear,
        };
    }

    if (req.query.create_from && req.query.create_to) {
        let date_from = new Date(
            req.query.create_from + "T00:00:00.000+0000"
        ).toISOString();
        let date_to = new Date(
            req.query.create_to + "T23:59:59.000+0000"
        ).toISOString();

        $where["created_at"] = {
            gte: date_from,
            lte: date_to,
        };
    } else if (req.query.create_from) {
        let date_from = new Date(
            req.query.create_from + "T00:00:00.000+0000"
        ).toISOString();
        $where["created_at"] = {
            gte: date_from,
        };
    } else if (req.query.create_to) {
        let date_to = new Date(
            req.query.create_to + "T23:59:59.000+0000"
        ).toISOString();
        $where["created_at"] = {
            lte: date_to,
        };
    }

    if (req.query.rp_no) {
        $where["rp_no"] = {
            contains: req.query.rp_no,
        };
    }

    if (req.query.user_id) {
        $where["user_id"] = Number(req.query.user_id);
    }

    if (req.query.title_th) {
        $where["title_th"] = {
            contains: req.query.title_th,
        };
    }

    if (req.query.title_en) {
        $where["title_en"] = {
            contains: req.query.title_en,
        };
    }

    if (req.query.department_id) {
        $where["department_id"] = req.query.department_id;
    }

    if (req.query.paper_type_id) {
        $where["paper_type_id"] = req.query.paper_type_id;
    }

    if (req.query.status_id) {
        $where["status_id"] = Number(req.query.status_id);
    }

    if (req.query.in_status_id) {
        $where["status_id"] = {
            in: req.query.in_status_id
                .split(",")
                .map((item) => Number(item.trim())),
        };
    }

    if (req.query.is_active) {
        $where["is_active"] = Number(req.query.is_active);
    }

    return $where;
};

const generateCode = async (id) => {
    const currentYear = new Date().getFullYear();

    let year = Number(currentYear) + 543;

    year = year.toString().slice(-2);
    year = Number(year);

    const find_max_item = await prisma[$table].findFirst({
        where: {
            running_year: year,
            deleted_at: null,
        },
        orderBy: {
            running_code: "desc",
        },
        take: 1,
    });

    const padNumber = (num) => {
        let strNum = num.toString(); // แปลงตัวเลขเป็นสตริง
        while (strNum.length < 4) {
            strNum = "0" + strNum; // เพิ่ม 0 ไปด้านหน้า
        }
        return strNum;
    };

    let rp_no = null;
    let running_code = null;
    let running_year = year;

    if (!find_max_item) {
        running_code = 1;
        rp_no = "sci-" + year + "000001";
    } else {
        running_code = find_max_item.running_code + 1;
        rp_no = "sci-" + year + padNumber(running_code);
    }

    await prisma[$table].update({
        where: {
            id: Number(id),
        },
        data: {
            running_code: running_code,
            running_year: Number(year),
            rp_no: rp_no,
        },
    });

    return {
        rp_no: rp_no,
        running_code: running_code,
        running_year: running_year,
    };
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
                totalData: other.$count,
                totalPage: other.$totalPage,
                currentPage: other.$currentPage,
                msg: "success",
                data: item,
            });
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    async onGetById(req, res) {
        // let select = excludeSpecificField(req, selectField);

        try {
            const item = await prisma[$table].findUnique({
                select: selectFieldId,
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
        let authUsername = null;
        if (req.headers.authorization !== undefined) {
            const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
            authUsername = decoded.username;
        }

        try {
            const {
                is_send,
                user_id,
                title_th,
                title_en,
                abstract,
                keyword,
                department_id,
                paper_type_id,
                paper_kind_id,
                history,
                objective,
                scope,
                review_literature,
                method,
                benefit,
                location,
                references,
                status_id,
                sended_at,
                is_active,
                secret_key,
            } = req.body;

            const item = await prisma[$table].create({
                data: {
                    user_id: Number(user_id),
                    title_th: title_th,
                    title_en: title_en,
                    abstract: cutFroala(abstract),
                    keyword: keyword,
                    department_id: Number(department_id),
                    paper_type_id: Number(paper_type_id),
                    paper_kind_id: Number(paper_kind_id),
                    history: cutFroala(history),
                    objective: cutFroala(objective),
                    scope: cutFroala(scope),
                    review_literature: cutFroala(review_literature),
                    method: cutFroala(method),
                    benefit: cutFroala(benefit),
                    location: cutFroala(location),
                    references: cutFroala(references),
                    status_id: status_id ? Number(status_id) : undefined,
                    sended_at: sended_at ? new Date(sended_at) : undefined,
                    sended_user_id: Number(user_id),
                    is_active: Number(is_active),
                    created_by: authUsername,
                    updated_by: authUsername,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });

            if (is_send == 1 && item.rp_no == null) {
                const code = await generateCode(item.id);

                item.rp_no = code.rp_no;
                item.running_year = code.running_year;
                item.running_code = code.running_code;
            }

            // /* Update File Attach */
            if (secret_key != null) {
                await prisma[$table_file_attach].updateMany({
                    where: {
                        secret_key: secret_key,
                    },
                    data: {
                        paper_id: item.id,
                    },
                });
            }

            res.status(201).json({ ...item, msg: "success" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    // แก้ไข
    async onUpdate(req, res) {
        let authUsername = null;
        if (req.headers.authorization !== undefined) {
            const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
            authUsername = decoded.username;
        }
        console.log(req.body);
        try {
            const {
                user_id,
                title_th,
                title_en,
                abstract,
                keyword,
                department_id,
                paper_type_id,
                paper_kind_id,
                history,
                objective,
                scope,
                review_literature,
                method,
                benefit,
                location,
                references,
                status_id,
                sended_at,
                sended_user_id,
                is_active,
                secret_key,
                is_send,
            } = req.body;

            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    is_active:
                        req.body.is_active != null
                            ? Number(is_active)
                            : undefined,
                    user_id: user_id != null ? Number(user_id) : undefined,
                    title_th: title_th != null ? title_th : undefined,
                    title_en: title_en != null ? title_en : undefined,
                    abstract:
                        abstract != null ? cutFroala(abstract) : undefined,
                    keyword: keyword != null ? cutFroala(keyword) : undefined,
                    department_id:
                        department_id != null
                            ? Number(department_id)
                            : undefined,
                    paper_type_id:
                        paper_type_id != null
                            ? Number(paper_type_id)
                            : undefined,
                    paper_kind_id:
                        paper_kind_id != null
                            ? Number(paper_kind_id)
                            : undefined,
                    history: history != null ? cutFroala(history) : undefined,
                    objective:
                        objective != null ? cutFroala(objective) : undefined,
                    scope: scope != null ? cutFroala(scope) : undefined,
                    scope: scope != null ? cutFroala(scope) : undefined,
                    review_literature:
                        review_literature != null
                            ? cutFroala(review_literature)
                            : undefined,
                    method: method != null ? cutFroala(method) : undefined,
                    benefit: benefit != null ? cutFroala(benefit) : undefined,
                    location:
                        location != null ? cutFroala(location) : undefined,
                    references:
                        references != null ? cutFroala(references) : undefined,
                    status_id:
                        status_id != null ? Number(status_id) : undefined,
                    sended_at:
                        sended_at != null ? new Date(sended_at) : undefined,
                    sended_user_id:
                        sended_user_id != null
                            ? Number(sended_user_id)
                            : undefined,
                    updated_by: authUsername,
                    updated_at: new Date(),
                },
            });

            if (is_send == 1 && item.rp_no == null) {
                const code = await generateCode(item.id);

                item.rp_no = code.rp_no;
                item.running_year = code.running_year;
                item.running_code = code.running_code;
            }

            /* Update File Attach */
            if (secret_key != null) {
                await prisma[$table_file_attach].updateMany({
                    where: {
                        secret_key: secret_key,
                    },
                    data: {
                        paper_id: item.id,
                    },
                });
            }

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

    // อนุมติ
    async onApprove(req, res) {
        let authUsername = null;
        if (req.headers.authorization !== undefined) {
            const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
            authUsername = decoded.username;
        }

        try {
            const {
                approved_at,
                approved_user_id,
                approved_detail,
                status_id,
            } = req.body;

            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    approved_at:
                        approved_at != null ? new Date(approved_at) : undefined,
                    approved_user_id:
                        approved_user_id != null
                            ? Number(approved_user_id)
                            : undefined,
                    approved_detail:
                        approved_detail != null ? approved_detail : undefined,
                    status_id:
                        status_id != null ? Number(status_id) : undefined,
                    updated_by: authUsername,
                    updated_at: new Date(),
                },
            });
            res.status(200).json({ ...item, msg: "success" });
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
};

module.exports = { ...methods };
