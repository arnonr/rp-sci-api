const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const initDatabase = async () => {
    try {
        console.log("[init-db] Initializing master data...");

        // 1. paper_type
        const paperTypeName = "โครงการวิจัยบูรณาการระหว่างสาขา";
        const existingPaperType = await prisma.paper_type.findFirst({
            where: { name: paperTypeName, deleted_at: null }
        });
        if (!existingPaperType) {
            await prisma.paper_type.create({
                data: {
                    name: paperTypeName,
                    is_active: 1
                }
            });
            console.log(`[init-db] Created paper_type: "${paperTypeName}"`);
        }

        // 2. paper_kind
        const paperKindName = "ผสมผสาน";
        const existingPaperKind = await prisma.paper_kind.findFirst({
            where: { name: paperKindName, deleted_at: null }
        });
        if (!existingPaperKind) {
            await prisma.paper_kind.create({
                data: {
                    name: paperKindName,
                    is_active: 1
                }
            });
            console.log(`[init-db] Created paper_kind: "${paperKindName}"`);
        }

        // 3. personal_type & condition
        // Find academic staff
        const academicPT = await prisma.personal_type.findFirst({
            where: {
                name: { contains: "วิชาการ" },
                deleted_at: null
            }
        });
        // Find support staff
        const supportPT = await prisma.personal_type.findFirst({
            where: {
                name: { contains: "สนับสนุน" },
                deleted_at: null
            }
        });

        const conditionName = "เผยแพร่ผลงานวิจัยในรูปบทความทางวิชาการที่ตีพิมพ์ในวารสารวิชาการระดับชาติหรือนานาชาติที่อยู่ในฐานข้อมูล SCOPUS หรือ ได้รับการจดทะเบียนทรัพย์สินทางปัญญาโดยมีสำเนาหนังสือสำคัญการจดทะเบียนสิทธิบัตรหรืออนุสิทธิบัตรประกอบการปิดโครงการ โดยจะได้รับทุนสนับสนุนการวิจัยไม่เกินทุนละ 150,000 บาท";

        if (academicPT) {
            const existingCond = await prisma.condition.findFirst({
                where: {
                    name: conditionName,
                    personal_type_id: academicPT.id,
                    deleted_at: null
                }
            });
            if (!existingCond) {
                await prisma.condition.create({
                    data: {
                        name: conditionName,
                        personal_type_id: academicPT.id,
                        is_active: 1
                    }
                });
                console.log(`[init-db] Created condition for academic staff: "${academicPT.name}"`);
            }
        } else {
            console.warn("[init-db] Warning: personal_type matching 'วิชาการ' not found.");
        }

        if (supportPT) {
            const existingCond = await prisma.condition.findFirst({
                where: {
                    name: conditionName,
                    personal_type_id: supportPT.id,
                    deleted_at: null
                }
            });
            if (!existingCond) {
                await prisma.condition.create({
                    data: {
                        name: conditionName,
                        personal_type_id: supportPT.id,
                        is_active: 1
                    }
                });
                console.log(`[init-db] Created condition for support staff: "${supportPT.name}"`);
            }
        } else {
            console.warn("[init-db] Warning: personal_type matching 'สนับสนุน' not found.");
        }

        console.log("[init-db] Database initialization completed.");
    } catch (err) {
        console.warn("[init-db] Failed to initialize database options (might be offline or database unreachable):", err.message);
    }
};

module.exports = { initDatabase };
