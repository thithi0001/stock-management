import { 
    findAllUsers, 
    findUserByUsername, 
    findUsersByRole
} from "../models/userModel.js";

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

