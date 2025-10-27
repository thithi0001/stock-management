import { findUserByUsername, createUser } from "../models/userModel.js";

export async function register(req, res) {
    try {
        const { username, password, full_name, phone, email, role_name } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

        if (!full_name) return res.status(400).json({ message: 'Full name required' });

        if (!phone || !email) return res.status(400).json({ message: 'phone number and email address required' });

        if (!role_name) return res.status(400).json({ message: 'Role required' });

        const existing = await findUserByUsername(username);
        if (existing) return res.status(409).json({ message: 'Username already taken' });

        const user = await createUser(req.body);
        return res.status(201).json({ message: 'User created', userId: user.id });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
}