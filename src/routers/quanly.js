const express = require('express');
const router = express.Router();
const mainController = require('../app/controllers/MainController');
let upload = require('../database/multer.config');

router.get('/home', mainController.home);
router.get('/login', mainController.loginql);
router.get('/register', mainController.register);
router.get('/chitiettintuc', mainController.chitiettintuc);
router.get('/thongtincanhan', mainController.thongtincanhanTV);
router.get('/cvtvsk/listchat', mainController.listchatcvtv);

module.exports = router;
