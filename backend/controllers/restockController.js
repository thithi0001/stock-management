import { 
    createLinks,
    findAllLinks, 
    findLinkById,
    findLinksByStatus,
    updateLinkStatus
} from "../models/restockImportLink.js";
import { 
    createRequest, 
    findAllRequests, 
    findRequestById, 
    findRequestsByStatus, 
    updateRequestStatus
} from "../models/restockRequestModel.js"


export const getAllRestockRequests = async (req, res) => {
    try {
        const requests = await findAllRequests();
        return res.json(requests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getRestockRequestById = async (req, res) => {
    try {
        const requests = await findRequestById(req.params.request_id);
        return res.json(requests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getRestockRequestsByStatus = async (req, res) => {
    try {
        const requests = await findRequestsByStatus(req.params.request_status);
        return res.json(requests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const addRestockRequest = async (req, res) => {
    try {
        const newRequest = await createRequest(req.body);
        return res.json(newRequest);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create restock request' });
    }
}

export const editRestockRequest = async (req, res) => {
    try {
        const id = req.params.request_id;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        const existing = await findRequestById(id);
        if (!existing) return res.status(404).json({ message: 'Restock request not found' });

        const newStatus = data.request_status ?? existing.request_status;

        const newRequest = await updateRequestStatus(id, newStatus);
        return res.json(newRequest);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update restock request' });
    }
}

export const getAllLinks = async (req, res) => {
    try {
        const links = await findAllLinks();
        return res.json(links);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getLinkById = async (req, res) => {
    try {
        const link = await findLinkById(req.params.link_id);
        return res.json(link);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getLinksByStatus = async (req, res) => {
    try {
        const links = await findLinksByStatus(req.params.link_status);
        return res.json(links);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const addLink = async (req, res) => {
    try {
        const newLink = await createLinks(req.body);
        return res.json(newLink);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create link' });
    }
}

export const editLink = async (req, res) => {
    try {
        const id = req.params.request_id;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        const existing = await findLinkById(id);
        if (!existing) return res.status(404).json({ message: 'Link not found' });

        const newStatus = data.link_status ?? existing.link_status;

        const newLink = await updateLinkStatus(id, newStatus);
        return res.json(newLink);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update restock link' });
    }
}


