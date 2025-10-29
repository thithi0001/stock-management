import { prisma } from "../config/db.js";

export async function findAllRequests() {
    return prisma.restock_requests.findMany({
        include: {
            products: {
                select: {
                    product_name: true
                }
            },
            notifiedUser: {
                select: {
                    full_name: true
                }
            }
        }
    });
}

export async function findRequestById(id) {
    return prisma.restock_requests.findUnique({
        where: {
            request_id: Number(id)
        },
        include: {
            products: {
                select: {
                    product_name: true
                }
            },
            notifiedUser: {
                select: {
                    full_name: true
                }
            }
        }
    });
}

export async function findRequestsByStatus(status) {
    return prisma.restock_requests.findMany({
        where: {
            request_status: status
        },
        include: {
            products: {
                select: {
                    product_name: true
                }
            },
            notifiedUser: {
                select: {
                    full_name: true
                }
            }
        }
    });
}

export async function createRequest(data) {
    const { product_id, requested_by, notified_to, requested_quantity, note } = data;
    return prisma.restock_requests.create({
        data: {
            product_id: Number(product_id),
            requested_by: Number(requested_by),
            notified_to: Number(notified_to),
            requested_quantity,
            note
        }
    });
}

export async function updateRequestStatus(id, newStatus) {
    return prisma.restock_requests.update({
        where: {
            request_id: Number(id)
        },
        data: {
            request_status: newStatus
        }
    });
}