import { getAuditReport } from '../services/audit.service.js';

export const fetchAudit = (req, res) => {
    try {
        const report = getAuditReport();
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
};
