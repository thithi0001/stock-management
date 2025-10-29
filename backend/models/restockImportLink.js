import { prisma } from "../config/db.js";

export async function findAllLinks() {
    return prisma.restock_import_links.findMany();
}

export async function findLinksByStatus(status) {
    return prisma.restock_import_links.findMany({
        where: {
            link_status: status
        }
    });
}

export async function findLinkById(id) {
    return prisma.restock_import_links.findUnique({
        where: {
            link_id: Number(id)
        }
    });
}

export async function createLinks(data) {
    const { restock_request_id, import_receipt_id, note } = data;
    return prisma.restock_import_links.create({
        data: {
            restock_request_id,
            import_receipt_id,
            note
        }
    });
}

export async function updateLinkStatus(id, newStatus) {
    return prisma.restock_import_links.update({
        where: {
            link_id: Number(id)
        },
        data: {
            link_status: newStatus
        }
    });
}