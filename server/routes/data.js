import { Router } from 'express';
import { legalAidData, rightsKnowledge, legalMyths } from '../data/legal-data.js';

export const dataRouter = Router();

dataRouter.get('/legal-aid', (_req, res) => res.json(legalAidData));
dataRouter.get('/rights', (_req, res) => res.json(rightsKnowledge));
dataRouter.get('/myths', (_req, res) => res.json(legalMyths));
