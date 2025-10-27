import { 
    findAllUsers, 
    findUserByUsername 
} from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await findAllUsers();
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

export const addUser = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

export const changePassword = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

export const changeAccountStatus = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

