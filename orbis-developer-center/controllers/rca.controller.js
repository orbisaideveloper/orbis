import { analyzeRootCause } from '../services/rca.service.js';

export const fetchRCA = (req, res) => {
    try {
        const { query } = req.body;
        const report = analyzeRootCause(query);
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
};
