import { 
    findAllUsers, 
    findUserByUsername, 
    findUsersByRole,
    updateAccountStatus,
    updatePassword,
    updateUserInfor
} from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
    try {
        const users = await findAllUsers();
        if (!users.length) return res.status(404).json({ message: 'No users found' });
        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getUserByUsername = async (req, res) => {
    try {
        const user = await findUserByUsername(req.params.username);
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getUsersByRole = async (req, res) => {
    try {
        const users = await findUsersByRole(req.params.role_name);
        if (!users.length) return res.status(404).json({ message: 'No users found' });
        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}


export const addUser = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

export const editUserInfor = async (req, res) => {
    try {
        const newUser = await updateUserInfor(req.params.username, req.body);
        return res.json(newUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update user infor' });
    }
}

export async function changePassword(req, res) {
  try {
    const username = req.params.username;
    const { oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword)
      return res.status(400).json({ message: "Missing fields" });

    // Lấy user hiện tại
    const user = await findUserByUsername(username);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Kiểm tra mật khẩu cũ
    const valid = await bcrypt.compare(oldPassword, user.user_password);
    if (!valid) return res.status(401).json({ message: "Old password incorrect" });

    // Hash mật khẩu mới
    const hashed = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới
    await updatePassword(username, hashed);

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export const changeAccountStatus = async (req, res) => {
    try {
        const newUser = await updateAccountStatus(req.params.username, req.body);
        return res.json(newUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update user infor' });
    }
}

