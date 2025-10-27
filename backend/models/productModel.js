import { prisma } from "../config/db.js";
import { createStock } from "./stocksModel.js";

export async function findAllProducts() {
    return prisma.products.findMany();
}

export async function findProductById(id) {
    return prisma.products.findUnique({
        where: {
            product_id: Number(id)
        }
    });
}

export async function findProductsByName(name) {
    return prisma.products.findMany({
        where: {
            product_name: {
                search: name
            }
        }
    });
}

export async function createProduct(data) {
    const { product_name, unit, import_price, export_price, minimum } = data;
    const product = await prisma.products.create({
        data: {
            product_name,
            unit,
            import_price,
            export_price,
            minimum
        }
    });

    const stock = await createStock(product.product_id);

    return { product, stock };
}
export async function updateProduct(id, data) {
    const { product_name, unit, import_price, export_price, minimum } = data;
    return prisma.products.update({
        where: {
            product_id: Number(id)
        },
        data: {
            product_name,
            unit,
            import_price,
            export_price,
            minimum
        }
    });
}