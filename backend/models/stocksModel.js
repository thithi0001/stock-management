import { prisma } from "../config/db.js";

export async function findAllStocks() {
    return prisma.stocks.findMany({
        where: {
            products: {
                is: { product_status: "available" }
            }
        },
        include: {
            products: {
                select: {
                    product_name: true,
                    unit: true,
                    minimum: true,
                    product_status: true
                }
            }
        }
    });
}

export async function findStockById(stock_id) {
    return prisma.stocks.findUnique({
        where: {
            stock_id
        },
        include: {
            products: {
                select: {
                    product_name: true,
                    unit: true,
                    minimum: true,
                    product_status: true
                }
            }
        }
    });
}

export async function findStockByProductId(product_id) {
    return prisma.stocks.findUnique({
        where: {
            product_id
        },
        include: {
            products: {
                select: {
                    product_name: true,
                    unit: true,
                    import_price: true,
                    export_price: true,
                    minimum: true,
                    product_status: true
                }
            }
        }
    });
}

export async function createStock(product_id) {
    return prisma.stocks.create({
        data: {
            product_id,
            quantity: 0
        }
    });
}

export async function updateStock(stock_id, data) {
    return prisma.stocks.update({
        where: { stock_id },
        data: {
            quantity: data.quantity,
            stock_status: data.stock_status
        }
    });
}