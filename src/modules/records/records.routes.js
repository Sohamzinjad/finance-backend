const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const requireRole = require('../../middlewares/requireRole');
const validate = require('../../middlewares/validate');
const recordsController = require('./records.controller');
const { createRecordSchema, updateRecordSchema } = require('./records.schema');

const router = express.Router();

router.use(authenticate);

router.post('/', requireRole('ADMIN', 'ANALYST'), validate(createRecordSchema), recordsController.createRecord);
router.get('/', requireRole('VIEWER', 'ANALYST', 'ADMIN'), recordsController.getAllRecords);
router.get('/:id', requireRole('VIEWER', 'ANALYST', 'ADMIN'), recordsController.getRecordById);
router.patch('/:id', requireRole('ADMIN', 'ANALYST'), validate(updateRecordSchema), recordsController.updateRecord);
router.delete('/:id', requireRole('ADMIN', 'ANALYST'), recordsController.softDeleteRecord);

module.exports = router;
