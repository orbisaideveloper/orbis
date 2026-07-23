import { getProjectInventory } from '../services/inventory.service.js';

export const fetchInventory = (req, res) => {
    try {
        const inventoryData = getProjectInventory();
        res.status(200).json(inventoryData);
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
};
