const express = require('express');
const router = express.Router();
const mainController = require('../app/controllers/MainController');
let upload = require('../database/multer.config');

router.get('/home', mainController.home);
router.get('/login', mainController.loginql);
router.post('/login', mainController.login);
router.get('/register', mainController.register);
router.post('/themquanly', mainController.themquanly);
router.get('/chitiettintuc', mainController.chitiettintuc);
router.get('/thongtincanhan', mainController.thongtincanhanTV);
router.get('/cvtvsk/listchat', mainController.listchatcvtv);

//OLD
router.get('/quanlybacsi', mainController.quanlybacsi);
router.post('/quanlybacsi/thembacsi', mainController.thembacsi);
router.get('/quanlybacsi/xoabacsi/:mabacsi', mainController.xoabacsi);
router.get('/quanlybacsi/loadchuyenkhoa', mainController.loadchuyenkhoa);
router.get('/quanlybacsi/:mabacsi/chinhsua', mainController.loadchinhsuabacsi);
router.post('/quanlybacsi/chinhsua/:mabacsi', mainController.chinhsuabacsi);
router.get('/quanlybacsi/:mabacsi/xemchitiet', mainController.xemchitietbacsi);

router.get('/quanlychuyenkhoa', mainController.quanlychuyenkhoa);
router.post('/quanlychuyenkhoa/themchuyenkhoa', mainController.themchuyenkhoa);
router.get('/quanlychuyenkhoa/:machuyenkhoa', mainController.xoachuyenkhoa);
router.get(
  '/quanlychuyenkhoa/:machuyenkhoa/chinhsua',
  mainController.loadchinhsuachuyenkhoa
);
router.post(
  '/quanlychuyenkhoa/:machuyenkhoa',
  mainController.chinhsuachuyenkhoa
);

router.get('/thongke', mainController.thongke);

router.get('/dangkylichranh/:mabacsi', mainController.dangkylichranh);
router.post(
  '/dangkylichranh/:mabacsi/themlichkham',
  mainController.themlichkham
);

router.post(
  'quanlybacsi/thembacsi/excel',
  upload.single('file'),
  mainController.uploadFile
);

router.get('/quanlybenhnhan', mainController.quanlybenhnhan);
router.get(
  '/quanlybenhnhan/:mabenhnhan/xemchitietbenhnhan',
  mainController.xemchitietbenhnhan
);
router.post('/quanlybenhnhan/thembenhnhan', mainController.thembenhnhan);
router.get(
  '/quanlybenhnhan/xoabenhnhan/:mabenhnhan',
  mainController.xoabenhnhan
);
router.get(
  '/quanlybenhnhan/:mabenhnhan/chinhsuabenhnhan',
  mainController.loadchinhsuabenhnhan
);
router.post(
  '/quanlybenhnhan/chinhsuabenhnhan/:mabenhnhan',
  mainController.chinhsuabenhnhan
);

module.exports = router;
