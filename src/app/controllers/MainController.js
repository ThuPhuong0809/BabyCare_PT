const readXlsxFile = require('read-excel-file/node');
const bcrypt = require('bcryptjs');

class MainController {
  // [GET] /home
  home(req, res) {
    // if (req.session.isAuth) {
    //   res.render('home', { hoten: req.session.hoten });
    // } else {
    //   req.session.back = '/home';
    //   res.redirect('/login/');
    // }

    res.render('home');
  }

  // [GET] /register
  register(req, res) {
    res.render('register');
  }

  // [GET] /register
  chitiettintuc(req, res) {
    res.render('chitiettintuc');
  }

  // [GET] /register
  thongtincanhanTV(req, res) {
    res.render('thongtincanhantv');
  }

  // [GET] /register
  listchatcvtv(req, res) {
    res.render('listchatcvtv');
  }

  // [GET] /home
  loginql(req, res) {
    res.render('login');
  }
}
module.exports = new MainController();
