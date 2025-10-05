const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const auth = require('../middleware/auth');

// 原有路由
router.get('/folders', auth, downloadController.getFolderList);
// 新增路由
router.post('/generate-link', auth, downloadController.generateDownloadLink);
router.get('/download', downloadController.downloadViaLink);

module.exports = router;