const express = require('express');
const router = express.Router();
const mainController = require('../app/controllers/MainController');
let upload = require('../database/multer.config');

router.get('/home', mainController.home);
router.get('/login', mainController.loginql);
router.post('/login', mainController.login);
router.get('/register', mainController.register);
// router.get('/chitiettintuc', mainController.chitiettintuc);
router.get('/thongtincanhan', mainController.thongtincanhanTV);
router.post(
  '/chinhsuathongtincanhan/:idUser',
  mainController.chinhsuathongtincanhan
);
router.get('/chitiettintuc/:idNew', mainController.chitiettintuc);
router.post('/thembinhluan', mainController.themcmt);
router.get('/guitinnhan', mainController.viettinnhan);
router.post('/guitinnhan', mainController.guitinnhan);
router.get('/dangtin', mainController.taotinthanhvien);
router.post('/dangtin', mainController.dangtinthanhvien);
router.get('/danhsachtypenew', mainController.danhsachtypenew);
router.get('/thichtintuc/:idNew', mainController.thichtintuc);

router.get('/cvtvsk/listchat', mainController.listchatcvtv);
router.get('/cvtvsk/listchat/:userName', mainController.chitietchat);
router.post('/cvtvsk/guitinnhan', mainController.guitinnhanCVTV);
module.exports = router;
