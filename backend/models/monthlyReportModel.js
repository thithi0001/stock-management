import { prisma } from "../config/db";

export async function findAllReport() {
    return prisma.monthly_reports.findMany();
}

export async function createReport(data) {
    const { report_type, from_date, to_date, file_url } = data;
    return prisma.monthly_reports.create({
        data: {
            report_type,
            from_date,
            to_date,
            file_url
        }
    });
}