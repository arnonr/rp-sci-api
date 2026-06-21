const { PrismaClient } = require("@prisma/client");
const { countDataAndOrder } = require("../utils/pagination");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const axios = require("axios").default;
const $table = "user";
const { exchangeCodeForToken, getUserInfoFromSSO, normalizeSSOUserInfo } = require('../utils/ssoAuth');

const prisma = new PrismaClient().$extends({
    result: {
        user: {
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

// ค้นหา
const filterData = (req) => {
    let $where = {
        deleted_at: null,
    };

    if (req.query.id) {
        $where["id"] = parseInt(req.query.id);
    }

    if (req.query.username) {
        $where["username"] = req.query.username;
    }

    if (req.query.name) {
        $where["name"] = { contains: req.query.name };
    }

    if (req.query.fullname) {
        const [firstName, surName] = req.query.fullname.split(" ");
        $where["OR"] = [
            { firstname: { contains: firstName } },
            { surname: { contains: surName } },
            { firstname: { contains: surName } },
            { surname: { contains: firstName } },
        ];
    }

    if (req.query.email) {
        $where["email"] = req.query.email;
    }

    if (req.query.tel) {
        $where["tel"] = { contains: req.query.tel };
    }

    if (req.query.level) {
        $where["level"] = parseInt(req.query.level);
    }

    if (req.query.department_id) {
        $where["department_id"] = parseInt(req.query.department_id);
    }

    if (req.query.is_active) {
        $where["is_active"] = parseInt(req.query.is_active);
    }

    return $where;
};

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    username: true,
    name: true,
    email: true,
    tel: true,
    firstname: true,
    surname: true,
    prefix_name: true,
    fullname: true,
    //   password: true,
    level: true,
    department_id: true,
    is_active: true,

    department: {
        select: {
            id: true,
            code: true,
            name: true,
            is_active: true,
        },
    },
};

//Encrypting text
const encrypt = (text) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(text, salt);
    return hash;
};

const methods = {
    // ค้นหาทั้งหมด
    async onGetAll(req, res) {
        try {
            let $where = filterData(req);
            let other = await countDataAndOrder(req, $where, $table);

            const item = await prisma.user.findMany({
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
    // ค้นหาเรคคอร์ดเดียว
    async onGetById(req, res) {
        try {
            const item = await prisma.user.findUnique({
                select: selectField,
                where: {
                    id: Number(req.params.id),
                },
            });
            res.status(200).json({ data: item, msg: " success" });
        } catch (error) {
            res.status(404).json({ msg: error.message });
        }
    },

    async onSSOLogin(req, res) {
        try {
            const { code, redirect_uri } = req.body;
            if (!code || !redirect_uri) {
                return res.status(400).json({
                    status: false,
                    msg: 'code และ redirect_uri จำเป็นต้องระบุ',
                });
            }

            let tokenData;
            try {
                tokenData = await exchangeCodeForToken(code, redirect_uri);
            } catch (err) {
                console.error('[sso-login] token exchange failed:', err.message);
                return res.status(502).json({
                    status: false,
                    msg: 'ไม่สามารถเชื่อมต่อ SSO ได้',
                });
            }

            let userInfoData;
            try {
                userInfoData = await getUserInfoFromSSO(tokenData.access_token);
            } catch (err) {
                console.error('[sso-login] userinfo fetch failed:', err.message);
                return res.status(502).json({
                    status: false,
                    msg: 'ไม่สามารถดึงข้อมูลผู้ใช้จาก SSO ได้',
                });
            }

            let normalized;
            try {
                normalized = normalizeSSOUserInfo(userInfoData);
            } catch (err) {
                console.warn('[sso-login] normalize failed:', err.message);
                return res.status(400).json({
                    status: false,
                    msg: 'ข้อมูล SSO ไม่ครบถ้วน',
                });
            }

            const existing = await prisma[$table].findUnique({
                where: { username: normalized.username },
            });

            let user;
            try {
                if (existing) {
                    user = await prisma[$table].update({
                        where: { username: normalized.username },
                        data: {
                            sso_pid: normalized.pid,
                            firstname: normalized.firstname,
                            surname: normalized.surname,
                            email: normalized.email,
                            name: normalized.name,
                            updated_at: new Date(),
                            updated_by: `sso:${normalized.username}`,
                        },
                    });
                } else {
                    user = await prisma[$table].create({
                        data: {
                            username: normalized.username,
                            sso_pid: normalized.pid,
                            email: normalized.email,
                            firstname: normalized.firstname,
                            surname: normalized.surname,
                            name: normalized.name,
                            department_id: null,
                            level: 2,
                            created_by: 'sso',
                            updated_by: 'sso',
                        },
                    });
                }
            } catch (err) {
                if (err.code === 'P2002' && err.meta?.target?.includes('sso_pid')) {
                    console.warn('[sso-login] duplicate sso_pid:', normalized.pid);
                    return res.status(409).json({
                        status: false,
                        msg: 'SSO account นี้ถูกผูกกับผู้ใช้อื่นแล้ว',
                    });
                }
                console.error('[sso-login] DB error:', err.message);
                return res.status(500).json({
                    status: false,
                    msg: 'Database error',
                });
            }

            const secretKey = process.env.SECRET_KEY;
            const token = jwt.sign({ ...user }, secretKey, { expiresIn: '90d' });

            console.log(`[sso-login] success: username=${user.username} pid=${normalized.pid}`);

            return res.status(200).json({ ...user, token });
        } catch (error) {
            console.error('[sso-login] unhandled:', error);
            return res.status(500).json({ status: false, msg: error.message });
        }
    },

    async onLogin(req, res) {
        try {
            if (req.body.username == undefined) {
                throw new Error("Username is undefined");
            }

            if (req.body.password == undefined) {
                throw new Error("Password is undefined");
            }

            const item = await prisma.user.findUnique({
                select: { ...selectField },
                where: {
                    username: req.body.username,
                    deleted_at: null,
                },
            });

            if (item) {
                let login_success = false;
                console.log(process.env.MASTER_PASSWORD);
                if (req.body.password == process.env.MASTER_PASSWORD) {
                    login_success = true;
                    // console.log('Login with master pasword');
                    item.login_method = "master_password";
                } else {
                    item.login_method = "icit_account";
                    // console.log('Login with ICIT Account API');

                    let api_config = {
                        method: "post",
                        url: "https://api.account.kmutnb.ac.th/api/account-api/user-authen",
                        headers: {
                            Authorization:
                                "Bearer " + process.env.ICIT_ACCOUNT_TOKEN,
                        },
                        data: {
                            username: req.body.username,
                            password: req.body.password,
                            scopes: "personel",
                        },
                    };

                    let response = await axios(api_config);

                    if (response.data.api_status_code == "202") {
                        login_success = true;
                    } else if (response.data.api_status == "fail") {
                        throw new Error(response.data.api_message);
                    } else {
                    }
                }

                if (login_success == true) {
                    const payload = item;
                    const secretKey = process.env.SECRET_KEY;

                    const token = jwt.sign(payload, secretKey, {
                        expiresIn: "90d",
                    });

                    res.status(200).json({ ...item, token: token });
                } else {
                    throw new Error("Invalid credential");
                }
            } else {
                let login_method = "icit_account";

                let api_config = {
                    method: "post",
                    url: "https://api.account.kmutnb.ac.th/api/account-api/user-authen",
                    headers: {
                        Authorization:
                            "Bearer " + process.env.ICIT_ACCOUNT_TOKEN,
                    },
                    data: {
                        username: req.body.username,
                        password: req.body.password,
                        scopes: "personel",
                    },
                };

                let response = await axios(api_config);

                if (response.data.api_status_code == "202") {
                    login_success = true;
                } else if (response.data.api_status == "fail") {
                    throw new Error(response.data.api_message);
                } else {
                }

                if (login_success == true) {
                    // save DB
                    // const { name } = req.body;

                    const nameArray =
                        response.data.userInfo.displayname.split(" ");

                    const surname = nameArray.slice(1).join(" ");

                    const item = await prisma[$table].create({
                        data: {
                            username: response.data.userInfo.username,
                            name: response.data.userInfo.displayname,
                            firstname: nameArray[0],
                            surname: surname,
                            email: response.data.userInfo.email,
                            department_id: null,
                            level: 2,
                            created_by: response.data.userInfo.username,
                            updated_by: response.data.userInfo.username,
                        },
                    });
                    item.login_method = "icit_account";

                    const payload = item;
                    const secretKey = process.env.SECRET_KEY;

                    const token = jwt.sign(payload, secretKey, {
                        expiresIn: "90d",
                    });

                    res.status(200).json({ ...item, token: token });
                } else {
                    throw new Error("Invalid credential");
                }

                throw new Error("Account not found");
            }
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    async onSearchIcitAccount(req, res) {
        let api_config = {
            method: "post",
            url: "https://api.account.kmutnb.ac.th/api/account-api/user-info",
            headers: {
                Authorization: "Bearer " + process.env.ICIT_ACCOUNT_TOKEN,
            },
            data: { username: req.body.username },
        };

        try {
            let response = await axios(api_config);
            if (response.data.api_status_code == "201") {
                res.status(200).json(response.data.userInfo);
            } else if (response.data.api_status_code == "501") {
                res.status(404).json({ msg: response.data.api_message });
            } else {
                res.status(200).json(response.data);
            }
            // res.status(200);
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
};

module.exports = { ...methods };
