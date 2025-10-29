import {
    createProduct,
    findAllProducts,
    findProductById,
    findProductsByName,
    updateProduct
} from "../models/productModel.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await findAllProducts();
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getProductById = async (req, res) => {
    try {
        const product = await findProductById(req.params.product_id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        return res.json(product);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getProductsByName = async (req, res) => {
    try {
        const products = await findProductsByName(req.params.name);
        if (!products || products.length === 0) return res.status(404).json({ message: 'Product not found' });
        return res.json(products);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const addProduct = async (req, res) => {
    try {
        const { newProduct, newStock } = await createProduct(req.body);
        return res.status(201).json({ newProduct, newStock });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to create product' });
    }
}

export const editProduct = async (req, res) => {
    try {
        const id = req.params.product_id;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        const existing = await findProductById(id);
        if (!existing) return res.status(404).json({ message: 'Product not found' });

        const payload = {
            product_name: data.product_name ?? existing.product_name,
            unit: data.unit ?? existing.unit,
            import_price: data.import_price ?? existing.import_price,
            export_price: data.export_price ?? existing.export_price,
            minimum: data.minimum ?? existing.minimum,
            product_status: data.product_status ?? existing.product_status
        };

        const updated = await updateProduct(id, payload);
        return res.json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update product' });
    }
}

