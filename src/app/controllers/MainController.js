const readXlsxFile = require('read-excel-file/node');
const bcrypt = require('bcryptjs');
const Account = require('../model/Account');
const New = require('../model/New');
const User = require('../model/User');
const Comment = require('../model/Comment');
const Chat = require('../model/Chat');
const ListChat = require('../model/ListChat');
const NewType = require('../model/NewType');
const Like = require('../model/Like');

const NewTemp = require('../model/NewTemp');

class MainController {
  // [GET] /home
  home(req, res) {
    const array = [];
    const listNewType = [];
    if (req.session.isAuth) {
      New.find((err, data) => {
        if (!err) {
          for (var i = 0; i < data.length; i++) {
            const newTemp = new NewTemp();
            newTemp.idNewTemp = data[i].idNew;
            newTemp.title = data[i].title;
            newTemp.content = data[i].content;
            newTemp.authorId = data[i].authorId;
            newTemp.authorName = data[i].authorName;
            newTemp.authorImage = data[i].authorImage;
            newTemp.image = data[i].image;
            newTemp.status = data[i].status;
            newTemp.countLike = data[i].countLike;
            newTemp.countComment = data[i].countComment;
            newTemp.createdDate = data[i].createdDate;
            newTemp.updatedDate = data[i].updatedDate;

            NewType.findOne({ idNewType: data[i].typeId }, (err, newType) => {
              if (!err) {
                listNewType.push(newType);
                newTemp.idNewType = newType.idNewType;
                newTemp.nameNewType = newType.name;
                newTemp.imageNewType = newType.image;
                array.push(newTemp);
                if (listNewType.length == data.length) {
                  res.render('home', {
                    array: array,
                    username: req.session.username,
                    userId: req.session.userId,
                    avatar: req.session.avatar,
                    role: req.session.role,
                  });
                }
              } else {
                res.status(400).json({ error: 'ERROR!!!' });
              }
            }).lean();
          }
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
                Like.find(
                  { newId: Number(req.params.idNew) },
                  (err, listLike) => {
                    if (!err) {
                      Like.find(
                        {
                          userId: req.session.userId,
                          newId: Number(req.params.idNew),
                        },
                        (err, isLike) => {
                          if (!err) {
                            res.render('chitiettintuc', {
                              data: data,
                              username: req.session.username,
                              userId: req.session.userId,
                              avatar: req.session.avatar,
                              listComment: listComment,
                              role: req.session.role,
                              countLike: listLike.length,
                              countComment: listComment.length,
                              liked: isLike.length,
                            });
                          } else {
                            res.status(400).json({ error: 'ERROR!!!' });
                          }
                        }
                      ).lean();
                    } else {
                      res.status(400).json({ error: 'ERROR!!!' });
                    }
                  }
                ).lean();
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
      Comment.find({ newId: idNew }, (err, listComment) => {
        console.log('listComment', listComment.length);
        if (!err) {
          New.findOne({ idNew: idNew }, (err, data) => {
            console.log('data', data);
            if (!err) {
              if (data) {
                data.countComment = listComment.length + 1;
                console.log('data update', data);
                New.updateOne({ idNew: idNew }, data)
                  .then(() => {
                    console.log('TRUEEE');
                    comemnt
                      .save()
                      .then(() => res.redirect(`/chitiettintuc/${idNew}`))
                      .catch(error => {});
                  })
                  .catch(err => next(err));
              }
            } else {
              res.status(400).json({ error: 'ERROR!!!' });
            }
          }).lean();
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = `/chitiettintuc/${idNew}`;
      res.redirect('/login/');
    }
  }

  thichtintuc(req, res) {
    const like = new Like();
    like.userId = req.session.userId;
    like.newId = req.params.idNew;
    const idNew = parseInt(req.params.idNew);

    Like.find({ userId: req.session.userId, newId: idNew }, (err, isLike) => {
      if (!err) {
        if (isLike.length > 0) {
          if (req.session.isAuth) {
            Like.delete({ userId: req.session.userId, newId: idNew })
              .then(() => {
                res.redirect(`/chitiettintuc/${idNew}`);
              })
              .catch(err => next(err));
          } else {
            req.session.back = `/chitiettintuc/${idNew}`;
            res.redirect('/login/');
          }
        } else {
          if (req.session.isAuth) {
            like
              .save()
              .then(() => res.redirect(`/chitiettintuc/${idNew}`))
              .catch(error => {});
          } else {
            req.session.back = `/chitiettintuc/${idNew}`;
            res.redirect('/login/');
          }
        }
      } else {
        res.status(400).json({ error: 'ERROR!!!' });
      }
    }).lean();
  }

  viettinnhan(req, res) {
    if (req.session.isAuth) {
      Chat.find({ userName: req.session.username }, (err, listData) => {
        //lấy tất cả dữ liệu bảng new
        if (!err) {
          res.render('guitinnhan', {
            listData: listData,
            username: req.session.username,
            userId: req.session.userId,
            avatar: req.session.avatar,
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
    if (req.session.isAuth) {
      User.findOne({ idUser: req.session.userId }, (err, data) => {
        if (!err) {
          console.log('==================', req.session.userId, data);
          res.render('thongtincanhantv', {
            data: data,
            username: req.session.username,
            userId: req.session.userId,
            avatar: req.session.avatar,
            role: req.session.role,
          });
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  // [GET] /register
  chinhsuathongtincanhan(req, res) {
    if (req.session.isAuth) {
      req.body.idUser = Number(req.params.idUser);
      console.log('req.body', req.body);
      User.updateOne({ idUser: Number(req.params.idUser) }, req.body)
        .then(() => {
          res.redirect('/thongtincanhan');
        })
        .catch(err => next(err));
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
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
        userId: req.session.idUser,
        avatar: req.session.avatar,
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
              var sess = req.session;
              User.findOne({ idAccount: user.id }, (err, userInfo) => {
                if (!err) {
                  sess.isAuth = true;
                  sess.role = user.role;
                  sess.username = user.username;
                  sess.userId = userInfo.idUser;
                  sess.avatar = userInfo.avatar;
                } else {
                  res.status(400).json({ error: 'ERROR!!!' });
                }
              }).lean();
              if (sess.back) {
                res.redirect(sess.back);
              } else {
                const array = [];
                const listNewType = [];
                New.find((err, data) => {
                  if (!err) {
                    for (var i = 0; i < data.length; i++) {
                      const newTemp = new NewTemp();
                      newTemp.idNewTemp = data[i].idNew;
                      newTemp.title = data[i].title;
                      newTemp.content = data[i].content;
                      newTemp.authorId = data[i].authorId;
                      newTemp.authorName = data[i].authorName;
                      newTemp.authorImage = data[i].authorImage;
                      newTemp.image = data[i].image;
                      newTemp.status = data[i].status;
                      newTemp.countLike = data[i].countLike;
                      newTemp.countComment = data[i].countComment;
                      newTemp.createdDate = data[i].createdDate;
                      newTemp.updatedDate = data[i].updatedDate;

                      NewType.findOne(
                        { idNewType: data[i].typeId },
                        (err, newType) => {
                          if (!err) {
                            listNewType.push(newType);
                            newTemp.idNewType = newType.idNewType;
                            newTemp.nameNewType = newType.name;
                            newTemp.imageNewType = newType.image;
                            array.push(newTemp);
                            if (listNewType.length == data.length) {
                              res.render('home', {
                                array: array,
                                username: req.session.username,
                                role: req.session.role,
                                userId: req.session.userId,
                                avatar: req.session.avatar,
                              });
                            }
                          } else {
                            res.status(400).json({ error: 'ERROR!!!' });
                          }
                        }
                      ).lean();
                    }
                  } else {
                    res.status(400).json({ error: 'ERROR!!!' });
                  }
                }).lean();
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
            userId: req.session.userId,
            avatar: req.session.avatar,
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
                userId: req.session.userId,
                avatar: req.session.avatar,
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
