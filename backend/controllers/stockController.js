import { 
    createStock,
    findAllStocks,
    findStockById,
    findStockByProductId,
    updateStock
} from "../models/stocksModel.js";


export const getAllStocks = async (req, res) => {
    try {
        const stocks = await findAllStocks();
        return res.json(stocks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getStockById = async (req, res) => {
    try {
        const stock = await findStockById(req.params.stock_id);
        return res.json(stock);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getStockByProductId = async (req, res) => {
    try {
        const stock = await findStockByProductId(req.params.product_id);
        return res.json(stock);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getStockByProductName = async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const addStock = async (req, res) => {
    try {
        const newStock = await createStock(req.body);
        return res.status(201).json(newStock);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to create stock' });
    }
}

export const editStock = async (req, res) => {
    try {
        const id = req.params.stock_id;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        const existing = await findStockById(id);
        if (!existing) return res.status(404).json({ message: 'Stock not found' });

        const payload = {
            quantity: data.quantity ?? existing.quantity,
            stock_status: data.stock_status ?? existing.stock_status
        };

        const updated = await updateStock(id, payload);
        return res.json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update stock' });
    }
}
