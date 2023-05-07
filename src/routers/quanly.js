const express = require('express');
const router = express.Router();
const mainController = require('../app/controllers/MainController');
let upload = require('../database/multer.config');

router.get('/home', mainController.home);
router.get('/login', mainController.loginql);
router.post('/login', mainController.login);
router.get('/register', mainController.loadRegister);
router.get('/verify/:username', mainController.loadVerification);
router.post('/verify', mainController.verification);
router.post('/register', mainController.register);
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
// router.post('/dangtin', mainController.dangtinthanhvien);
router.get('/danhsachtypenew', mainController.danhsachtypenew);
router.get('/thichtintuc/:idNew', mainController.thichtintuc);
router.get('/danhsachtincho', mainController.danhsachtincho);

router.get('/doimatkhau', mainController.loaddoimatkhau);
router.post('/doimatkhau/:accountId', mainController.doimatkhau);

router.get('/cvtvsk/listchat', mainController.listchatcvtv);
router.get('/cvtvsk/listchat/:userName', mainController.chitietchat);
router.post('/cvtvsk/guitinnhan', mainController.guitinnhanCVTV);

router.get('/admin/login', mainController.loginadminget);
router.post('/admin/login', mainController.loginadmin);
router.get('/admin/home', mainController.homeadmin);
router.get('/admin/chitiettintuc/:idNew', mainController.xemchitiettinadmin);
router.post('/admin/duyettin/:idNew', mainController.duyettinadmin);

router.get('/admin/quanlybinhluan', mainController.quanlybinhluan);
router.post('/admin/duyetbinhluan/:idComment', mainController.duyetbinhluan);

router.get('/admin/quanlychuyenvien', mainController.quanlychuyenvien);
router.get('/admin/xoachuyenvien/:idUser', mainController.xoachuyenvien);
router.get('/admin/themchuyenvien', mainController.loadthemchuyenvien);
router.post('/admin/themchuyenvien', mainController.themchuyenvien);

module.exports = router;
