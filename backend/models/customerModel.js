import { prisma } from "../config/db.js";

export async function getAllCustomer() {
    return await prisma.customers.findMany({
        select:{
            customer_id: true,
            customer_name: true,
            address: true,
            phone: true,
            email: true
        }
    });
}