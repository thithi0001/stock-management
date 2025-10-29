import { prisma } from "../config/db.js";
import bcrypt from 'bcryptjs';

export async function findAllUsers() {
    return prisma.user_accounts.findMany({
        include: {
            roles: {
                select: {
                    role_name: true
                }
            }
        },
        omit: { user_password: true }
    });
}

export async function findUserByUsername(username) {
    return prisma.user_accounts.findUnique({
        where: {
            username: String(username)
        },
        include: {
            roles: {
                select: {
                    role_name: true
                }
            }
        }
    });
}

export async function findUsersByRole(role) {
    return prisma.user_accounts.findMany({
        where: {
            roles: {
                role_name: role
            }
        },
        include: {
            roles: {
                select: {
                    role_name: true
                }
            }
        },
        omit: { user_password: true }
    });
}

export async function createUser(data) {
    const { username, password, full_name, phone, email, role_name } = data;

    const role = await prisma.roles.findUnique({
        where: { role_name }
    });
    if (!role) return res.status(400).json({ message: 'Role not existed' });

    return prisma.user_accounts.create({
        data: {
            username,
            user_password: await bcrypt.hash(password, 10),
            full_name,
            phone,
            email,
            role_id: role.role_id
        }
    });
}

export async function updateUserInfor(user_id, data) {

}

export async function updateAccountStatus(user_id, newStatus) {

}

export async function updatePassword(user_id, newPassword) {

}


