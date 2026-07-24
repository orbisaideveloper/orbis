import express from 'express';
import { fetchArchitecture } from '../controllers/explorer.controller.js';

const router = express.Router();
router.get('/', fetchArchitecture);

export default router;
