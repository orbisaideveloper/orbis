import { getProjectArchitecture } from '../services/explorer.service.js';

export const fetchArchitecture = (req, res) => {
    try {
        const report = getProjectArchitecture();
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
};
