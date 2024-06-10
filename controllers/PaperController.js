const { PrismaClient } = require("@prisma/client");
const uploadController = require("./UploadsController");
const { v4: uuidv4 } = require("uuid");
const $table = "paper";
const $table_file_attach = "file-attach";

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
    title_en: true,
    abstract: true,
    keyword: true,
    department_id: true,
    paper_type_id: true,
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
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    deleted_at: true,
    deleted_by: true,
    is_active: true,

    budget: {
        select: {
            detail: true,
            amount: true,
        },
    },
    file_attach: {
        select: {
            filename: true,
            secret_key: true,
        },
    },
    method_list: {
        select: {
            start_date: true,
            end_date: true,
            detail: true,
        },
    },
    researcher: {
        select: {
            prefix_name: true,
            firstname: true,
            surname: true,
            department_id: true,
            department_text: true,
            phone_number: true,
            expertise: true,
            researcher_type: true,
            percentage: true,
        },
    },
    return_paper: {
        select: {
            detail: true,
        },
    },
    review: {
        select: {
            detail: true,
            review_status: true,
            reviewer_id: true,
            is_send_mail: true,
            reviewer: {
                select: {
                    prefix_name: true,
                    firstname: true,
                    surname: true,
                    organization_name: true,
                },
            },
        },
    },

    user: {
        select: {
            // prefix_name: true,
            firstname: true,
            lastname: true,
        },
    },
};

const filterData = (req) => {
    let $where = {
        deleted_at: null,
    };

    if (req.query.fullname) {
        const [firstName, lastName] = req.query.fullname.split(" ");
        $where["some"] = {
            OR: [
                { firstname: firstName },
                { lastname: lastName },
                { firstname: lastName },
                { lastname: firstName },
            ],
        };
    }

    if (req.query.create_year) {
        const year = parseInt(req.query.create_year, 10);
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
        $where["user_id"] = parseInt(req.query.user_id);
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
        $where["department_id"] = {
            contains: parseInt(req.query.department_id),
        };
    }

    if (req.query.paper_type_id) {
        $where["paper_type_id"] = {
            contains: parseInt(req.query.paper_type_id),
        };
    }

    if (req.query.status_id) {
        $where["status_id"] = {
            contains: parseInt(req.query.status_id),
        };
    }

    if (req.query.is_active) {
        $where["is_active"] = parseInt(req.query.is_active);
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

const deleteComplaintChannelHistory = async (complaint_id) => {
    const complaint_history = await prisma.complaint_channel_history.deleteMany(
        {
            where: {
                complaint_id: Number(complaint_id),
            },
        }
    );
};

const addComplaintChannelHistory = async (
    complaint_id,
    complaint_channel_ids,
    authUsername
) => {
    if (complaint_channel_ids) {
        // console.log(channel_ids);
        const complaint_channel_ids_array = complaint_channel_ids.split(",");
        for (let i = 0; i < complaint_channel_ids_array.length; i++) {
            const item = await prisma.complaint_channel_history.create({
                data: {
                    complaint_id: Number(complaint_id),
                    complaint_channel_id: Number(
                        complaint_channel_ids_array[i]
                    ),
                    created_by: authUsername,
                    created_at: new Date(),
                },
            });
        }
    }
};

const generateCode = async (id) => {
    const item = await prisma[$table].findUnique({
        select: {
            rp_no: true,
        },
        where: {
            id: Number(id),
        },
    });

    if (item.rp_no != null) {
        return null;
    }

    /* Update JCOMS Month Running */
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Months are zero-based

    const maxRunning = await prisma[$table].aggregate({
        _max: {
            jcoms_month_running: true,
        },
        where: {
            created_at: {
                gte: new Date(currentYear, currentMonth - 1, 1), // Start of the current month
                lt: new Date(currentYear, currentMonth, 1), // Start of the next month
            },
        },
    });

    const newRunningMonth = maxRunning._max.jcoms_month_running + 1;
    const newRunningCode = newRunningMonth.toString().padStart(5, "0");
    const yearCode = (currentYear + 543).toString().substring(2, 4);
    const monthCode = currentMonth.toString().padStart(2, "0");

    const jcoms_code = `jcoms${yearCode}${monthCode}${newRunningCode}`;

    if (item.jcoms_no == null) {
        await prisma[$table].update({
            where: {
                id: Number(id),
            },
            data: {
                jcoms_no: jcoms_code,
                jcoms_month_running: newRunningMonth,
            },
        });
    }

    return { jcoms_code: jcoms_code, jcoms_month_running: newRunningMonth };
};

const generateJcomsYearCode = async (id) => {
    const item = await prisma[$table].findUnique({
        select: {
            jcoms_no: true,
            jcoms_year_running: true,
        },
        where: {
            id: Number(id),
        },
    });

    if (item.jcoms_no != null) {
        return null;
    }

    /* Update JCOMS Year Running */

    const currentYear = new Date().getFullYear();

    const maxRunning = await prisma[$table].aggregate({
        _max: {
            jcoms_year_running: true,
        },
        where: {
            created_at: {
                gte: new Date(`${currentYear}-01-01`),
                lt: new Date(`${currentYear + 1}-01-01`),
            },
        },
    });

    const newRunningYear = maxRunning._max.jcoms_year_running + 1;
    const newRunningCode = newRunningYear.toString().padStart(5, "0");
    const yearCode = (currentYear + 543).toString();

    const jcoms_code = `JCOMS${yearCode}${newRunningCode}`;

    if (item.jcoms_no == null) {
        await prisma[$table].update({
            where: {
                id: Number(id),
            },
            data: {
                jcoms_no: jcoms_code,
                jcoms_year_running: newRunningYear,
            },
        });
    }

    return { jcoms_code: jcoms_code, jcoms_year_running: newRunningYear };
};

const getComplainantUUIDbyPhoneNumber = async (phoneNumber) => {
    try {
        const item = await prisma.complainant.findUnique({
            where: {
                phone_number: phoneNumber,
            },
            select: {
                uuid: true,
            },
        });

        if (item) {
            return item.uuid;
        }
    } catch (error) {
        return null;
    }
};

const methods = {
    async onGetAll(req, res) {
        try {
            let $where = filterData(req);
            let other = await countDataAndOrder(req, $where);

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
        let select = excludeSpecificField(req, selectField);

        try {
            const item = await prisma[$table].findUnique({
                select: select,
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
                user_id,
                title_th,
                title_en,
                abstract,
                keyword,
                department_id,
                paper_type_id,
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
            } = req.body;

            const item = await prisma[$table].create({
                data: {
                    user_id: Number(user_id),
                    title_th: title_th,
                    title_en: title_en,
                    abstract: abstract,
                    keyword: keyword,
                    department_id: Number(department_id),
                    paper_type_id: Number(paper_type_id),
                    history: history,
                    objective: objective,
                    scope: scope,
                    review_literature: review_literature,
                    method: method,
                    benefit: benefit,
                    location: location,
                    references: references,
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

            // await addComplaintChannelHistory(
            //     item.id,
            //     req.body.complaint_channel_ids
            // );
            // // const JcomsCode = await generateJcomsCode(item.id);
            // const JcomsCode = await generateJcomsYearCode(item.id);
            // item.jcoms_no = JcomsCode.jcoms_code;

            // /* Update File Attach */
            // if (req.body.secret_key != null) {
            //     await prisma[$table_file_attach].updateMany({
            //         where: {
            //             secret_key: req.body.secret_key,
            //         },
            //         data: {
            //             complaint_id: item.id,
            //         },
            //     });
            // }

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

        let receiveDocPathFile = await uploadController.onUploadFile(
            req,
            "/complaint/",
            "receive_doc_filename"
        );

        if (receiveDocPathFile == "error") {
            return res.status(500).send("error");
        }

        try {
            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    is_active:
                        req.body.is_active != null
                            ? Number(req.body.is_active)
                            : undefined,
                    complaint_code:
                        req.body.complaint_code != null
                            ? req.body.complaint_code
                            : undefined,
                    tracking_satisfaction:
                        req.body.tracking_satisfaction != null
                            ? Number(req.body.tracking_satisfaction)
                            : undefined,
                    tracking_satisfaction_at:
                        req.body.tracking_satisfaction_at != null
                            ? new Date(req.body.tracking_satisfaction_at)
                            : undefined,
                    complaint_satisfaction:
                        req.body.complaint_satisfaction != null
                            ? Number(req.body.complaint_satisfaction)
                            : undefined,
                    complaint_satisfaction_at:
                        req.body.complaint_satisfaction_at != null
                            ? new Date(req.body.complaint_satisfaction_at)
                            : undefined,

                    receive_at:
                        req.body.receive_at != null
                            ? new Date(req.body.receive_at)
                            : undefined,
                    receive_user_id:
                        req.body.receive_user_id != null
                            ? Number(req.body.receive_user_id)
                            : undefined,
                    pol_no:
                        req.body.pol_no != null ? req.body.pol_no : undefined,
                    receive_doc_no:
                        req.body.receive_doc_no != null
                            ? req.body.receive_doc_no
                            : undefined,
                    receive_doc_date:
                        req.body.receive_doc_date != null
                            ? new Date(req.body.receive_doc_date)
                            : undefined,
                    receive_status:
                        req.body.receive_status != null
                            ? Number(req.body.receive_status)
                            : undefined,
                    receive_comment:
                        req.body.receive_comment != null
                            ? req.body.receive_comment
                            : undefined,
                    receive_doc_filename:
                        receiveDocPathFile != null
                            ? receiveDocPathFile
                            : undefined,

                    complaint_type_id:
                        req.body.complaint_type_id != null
                            ? Number(req.body.complaint_type_id)
                            : undefined,
                    complainant_id:
                        req.body.complainant_id != null
                            ? Number(req.body.complainant_id)
                            : undefined,
                    is_anonymous:
                        req.body.is_anonymous != null
                            ? Number(req.body.is_anonymous)
                            : undefined,
                    complaint_title:
                        req.body.complaint_title != null
                            ? req.body.complaint_title
                            : undefined,
                    complaint_detail:
                        req.body.complaint_detail != null
                            ? req.body.complaint_detail
                            : undefined,
                    incident_datetime:
                        req.body.incident_datetime != null
                            ? new Date(req.body.incident_datetime)
                            : undefined,
                    location_coordinates:
                        req.body.location_coordinates != null
                            ? req.body.location_coordinates
                            : undefined,
                    incident_location:
                        req.body.incident_location != null
                            ? req.body.incident_location
                            : undefined,
                    day_time:
                        req.body.day_time != null
                            ? Number(req.body.day_time)
                            : undefined,

                    complaint_channel_id:
                        req.body.complaint_channel_id != null
                            ? Number(req.body.complaint_channel_id)
                            : undefined,
                    channel_history_text:
                        req.body.channel_history_text != null
                            ? req.body.channel_history_text
                            : undefined,
                    evidence_url:
                        req.body.evidence_url != null
                            ? req.body.evidence_url
                            : undefined,

                    inspector_id:
                        req.body.inspector_id != null
                            ? Number(req.body.inspector_id)
                            : undefined,
                    bureau_id:
                        req.body.bureau_id != null
                            ? Number(req.body.bureau_id)
                            : undefined,
                    division_id:
                        req.body.division_id != null
                            ? Number(req.body.division_id)
                            : undefined,
                    agency_id:
                        req.body.agency_id != null
                            ? Number(req.body.agency_id)
                            : undefined,
                    topic_type_id:
                        req.body.topic_type_id != null
                            ? Number(req.body.topic_type_id)
                            : undefined,
                    house_number:
                        req.body.house_number != null
                            ? req.body.house_number
                            : undefined,
                    building:
                        req.body.building != null
                            ? req.body.building
                            : undefined,
                    moo: req.body.moo != null ? req.body.moo : undefined,
                    soi: req.body.soi != null ? req.body.soi : undefined,
                    road: req.body.road != null ? req.body.road : undefined,
                    postal_code:
                        req.body.postal_code != null
                            ? req.body.postal_code
                            : undefined,
                    sub_district_id:
                        req.body.sub_district_id != null
                            ? Number(req.body.sub_district_id)
                            : undefined,
                    district_id:
                        req.body.district_id != null
                            ? Number(req.body.district_id)
                            : undefined,
                    province_id:
                        req.body.province_id != null
                            ? Number(req.body.province_id)
                            : undefined,
                    state_id:
                        req.body.state_id != null
                            ? Number(req.body.state_id)
                            : undefined,
                    notice_type:
                        req.body.notice_type != null
                            ? req.body.notice_type
                            : undefined,

                    forward_doc_no:
                        req.body.forward_doc_no != null
                            ? req.body.forward_doc_no
                            : undefined,
                    forward_doc_date:
                        req.body.forward_doc_date != null
                            ? new Date(req.body.forward_doc_date)
                            : undefined,

                    closed_at:
                        req.body.closed_at != null
                            ? new Date(req.body.closed_at)
                            : undefined,
                    closed_user_id:
                        req.body.closed_user_id != null
                            ? Number(req.body.closed_user_id)
                            : undefined,
                    closed_comment:
                        req.body.closed_comment != null
                            ? req.body.closed_comment
                            : undefined,

                    updated_by: authUsername,
                    updated_at: new Date(),
                },
            });

            if (req.body.complaint_channel_ids !== undefined) {
                await deleteComplaintChannelHistory(req.params.id);
                await addComplaintChannelHistory(
                    req.params.id,
                    req.body.complaint_channel_ids
                );
            }

            if (item.jcoms_no == null) {
                // const JcomsCode = await generateJcomsCode(req.params.id);
                const JcomsCode = await generateJcomsYearCode(req.params.id);
                // console.log(JcomsCode);
                if (JcomsCode != null) {
                    item.jcoms_no = JcomsCode.jcoms_no;
                }
            }

            /* Update File Attach */
            if (req.body.secret_key != null) {
                await prisma[$table_file_attach].updateMany({
                    where: {
                        secret_key: req.body.secret_key,
                    },
                    data: {
                        complaint_id: item.id,
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
};

module.exports = { ...methods };
