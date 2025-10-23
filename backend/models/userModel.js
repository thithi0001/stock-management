import { prisma } from "../config/db.js";
import { pool } from "../config/db.js";
import bcrypt from 'bcryptjs';

// dùng như 1 function trả về giá trị 
export async function findUserByUsername(username) {
    try {
        const user = await prisma.user_accounts.findUnique({
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
        return user;
    } catch (error) {
        console.error('error when find user by username:', error);
        throw error;
    }
}

// sử dụng với api
export const getUserByUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await findUserByUsername(username);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "error when find user by username" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user_accounts.findMany({
            include: {
                roles: {
                    select: {
                        role_name: true
                    }
                }
            }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "error when get users list" });
    }
}

export const createUser = async (req, res) => {
    const { username, password, full_name, phone, email, role_name } = req.body;
    try {
        const role = await prisma.roles.findUnique({
            where: { role_name }
        })

        if (!role) return res.status(400).json({ message: 'role not existed' });

        const user = await prisma.user_accounts.create({
            data: {
                username,
                user_password: await bcrypt.hash(password, 10),
                full_name,
                phone,
                email,
                role_id: role.role_id
            }
        })
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "failed to create user" })
    }
}

export class User {
    constructor({
        user_id,
        username,
        user_password,
        full_name,
        phone,
        email,
        role_id
    }) {
        this.user_id = user_id;
        this.username = username;
        this.user_password = user_password;
        this.full_name = full_name;
        this.phone = phone;
        this.email = email;
        this.role_id = role_id;
    }

    static async findByUsername(username) {
        const [rows] = await pool.query(
            `SELECT * FROM user_accounts WHERE username = ?`,
            [username]);
        if (!rows[0]) return null;
        return new User(rows[0]);
    }

    static async findById(user_id) {
        const [rows] = await pool.query(
            `SELECT * FROM user_accounts WHERE user_id = ?`,
            [user_id]);
        if (!rows[0]) return null;
        return new User(rows[0]);
    }

    static async create({ username, password, full_name, phone, email, role_id }) {
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query(`
            INSERT INTO user_accounts (username, user_password, full_name, phone, email, role_id) 
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [username, hashed, full_name, phone, email, role_id]
        );
        return { user_id: result.insertId };
    }

    static async getUserRole(user_id) {
        const [rows] = await pool.query(
            `SELECT r.role_name FROM user_accounts u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_id = ?`,
            [user_id]
        );
        if (!rows[0]) return null;
        return rows[0].role_name;
    }

    static async updatePassword({ user_id, oldPassword, newPassword }) {

    }

    static async updateInfor({ user_id, new_full_name, newPhone, newEmail }) {

    }

    static async getAllUsers() {
        const [rows] = await pool.query(`
            SELECT * FROM user_accounts
        `);
        return rows.map(row => new User(row));
    }
} 