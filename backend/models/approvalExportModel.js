import { prisma } from "../config/db.js";

export async function findAllApprovalExport() {
    return prisma.approval_exports.findMany({
        orderBy: {
            approved_at: 'desc'
        }
    });
}

export async function findByStatus(status) {
    return prisma.approval_exports.findMany({
        orderBy: {
            approved_at: 'desc'
        },
        where: {
            new_status: status
        }
    });
}

export async function create(data) {
    const { export_receipt_id, approved_by, new_status, reason } = data;

    return prisma.approval_exports.create({
        data: {
            export_receipt_id,
            approved_by,
            new_status,
            reason
        }
    });
}