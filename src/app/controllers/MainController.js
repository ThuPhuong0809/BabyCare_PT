const readXlsxFile = require('read-excel-file/node');
const bcrypt = require('bcryptjs');
const Account = require('../model/Account');
const New = require('../model/New');
const User = require('../model/User');
const Comment = require('../model/Comment');
const Chat = require('../model/Chat');
const ListChat = require('../model/ListChat');
const NewType = require('../model/NewType');

class MainController {
  // [GET] /home
  home(req, res) {
    if (req.session.isAuth) {
      New.find((err, data) => {
        //lấy tất cả dữ liệu bảng new
        if (!err) {
          res.render('home', {
            data: data,
            username: req.session.username,
            role: req.session.role,
          }); //có dữ liệu sẽ đưa data vào trang home với data là d/s new tìm đc
          console.log(data);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  // [PUT] /chitiettintuc/:id
  chitiettintuc(req, res, next) {
    if (req.session.isAuth) {
      New.findOne({ idNew: Number(req.params.idNew) }, (err, data) => {
        if (!err) {
          Comment.find(
            { newId: Number(req.params.idNew) },
            (err, listComment) => {
              if (!err) {
                res.render('chitiettintuc', {
                  data: data,
                  username: req.session.username,
                  listComment: listComment,
                  role: req.session.role,
                });
              } else {
                res.status(400).json({ error: 'ERROR!!!' });
              }
            }
          ).lean();
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  themcmt(req, res) {
    const comemnt = new Comment(req.body);
    const idNew = parseInt(req.body.newId);
    console.log(comemnt);
    if (req.session.isAuth) {
      comemnt
        .save()
        .then(() => res.redirect(`/chitiettintuc/${idNew}`))
        .catch(error => {});
    } else {
      req.session.back = `/chitiettintuc/${idNew}`;
      res.redirect('/login/');
    }
  }

  viettinnhan(req, res) {
    if (req.session.isAuth) {
      Chat.find({ userName: req.session.username }, (err, listData) => {
        //lấy tất cả dữ liệu bảng new
        if (!err) {
          res.render('guitinnhan', {
            listData: listData,
            username: req.session.username,
            role: req.session.role,
          }); //có dữ liệu sẽ đưa data vào trang home với data là d/s new tìm đc
          console.log(listData);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/guitinnhan';
      res.redirect('/login/');
    }
  }

  guitinnhan(req, res) {
    const chat = new Chat(req.body);
    const listChat = new ListChat(req.body);
    const idNew = parseInt(req.body.newId);
    if (req.session.isAuth) {
      ListChat.find({ userName: req.body.userName }, (err, data) => {
        if (!err) {
          if (data.length == 0) {
            listChat.save().catch(error => {});
          }
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
      chat
        .save()
        .then(() => res.redirect('/guitinnhan'))
        .catch(error => {});
    } else {
      req.session.back = '/guitinnhan';
      res.redirect('/login/');
    }
  }

  // [GET] /register
  register(req, res) {
    res.render('register');
  }

  // [GET] /register
  thongtincanhanTV(req, res) {
    res.render('thongtincanhantv');
  }

  danhsachtypenew(req, res) {
    NewType.find((err, data) => {
      if (!err) {
        res.send(data);
      } else {
        res.status(400).json({ error: 'ERROR!!!' });
      }
    });
  }

  taotinthanhvien(req, res) {
    if (req.session.isAuth) {
      res.render('dangtinthanhvien', {
        username: req.session.username,
        role: req.session.role,
      }); //có dữ liệu sẽ đưa data vào trang home với data là d/s new tìm đc
    } else {
      req.session.back = '/dangtinthanhvien';
      res.redirect('/login/');
    }
  }

  dangtinthanhvien(req, res) {
    const news = new New(req.body);
    console.log(news);
    const userName = req.body.userName;
    if (req.session.isAuth) {
      news
        .save()
        .then(() => res.redirect('/home'))
        .catch(error => {});
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  // [GET] /home
  loginql(req, res) {
    res.render('login');
  }

  // [GET] /login
  login(req, res) {
    Account.findOne(
      // { tendangnhap: req.body.tendangnhap, matkhau: req.body.matkhau },
      { username: req.body.username }, // bắt user name trước

      function (err, user) {
        if (!err) {
          if (user == null) {
            req.flash('error', 'Tên đăng nhập không đúng!'); //nếu bắt user ko đúng sẽ trả dòng này
            res.redirect('/login/');
          } else {
            if (bcrypt.compareSync(req.body.password, user.password)) {
              //nếu bắt được user sẽ bắt password
              var sess = req.session; //initialize session variable
              sess.isAuth = true;
              sess.role = user.role;
              sess.username = user.username;
              sess.userId = user.username;
              if (sess.back) {
                res.redirect(sess.back);
              } else {
                New.find((err, data) => {
                  //lấy tất cả dữ liệu bảng new
                  if (!err) {
                    res.render('home', {
                      data: data,
                      username: req.session.username,
                      role: req.session.role,
                    }); //có dữ liệu sẽ đưa data vào trang home với data là d/s new tìm đc
                    console.log(data);
                  } else {
                    res.status(400).json({ error: 'ERROR!!!' });
                  }
                }).lean();
                // res.render('home', { username: req.session.username });
              }
            } else {
              req.flash('error', 'Mật khẩu không đúng!');
              res.redirect('/login/');
            }
          }
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }
    );
  }

  // [GET] /register
  listchatcvtv(req, res) {
    if (req.session.isAuth) {
      ListChat.find((err, data) => {
        if (!err) {
          res.render('listchatcvtv', {
            data: data,
            username: req.session.username,
            role: req.session.role,
          });
          // console.log(data);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/listchatcvtv';
      res.redirect('/login/');
    }
  }

  chitietchat(req, res, next) {
    if (req.session.isAuth) {
      ListChat.find((err, data) => {
        if (!err) {
          Chat.find({ userName: req.params.userName }, (err, listChat) => {
            if (!err) {
              res.render('chitietchat', {
                data: data,
                username: req.session.username,
                role: req.session.role,
                userNameNow: req.params.userName,
                listChat: listChat,
              });
            } else {
              res.status(400).json({ error: 'ERROR!!!' });
            }
          }).lean();
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/chitietchat';
      res.redirect('/login/');
    }
  }

  guitinnhanCVTV(req, res) {
    const chat = new Chat(req.body);
    const userName = req.body.userName;
    if (req.session.isAuth) {
      chat
        .save()
        .then(() => res.redirect(`/cvtvsk/listchat/${userName}`))
        .catch(error => {});
    } else {
      req.session.back = `/cvtvsk/listchat/${userName}`;
      res.redirect('/login/');
    }
  }
}
module.exports = new MainController();
