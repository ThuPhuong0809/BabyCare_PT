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

const CommentTemp = require('../model/CommentTemp');
const UserTempCV = require('../model/UserTempCV');
const NewTemp = require('../model/NewTemp');
const EmailOTP = require('../model/EmailOTPModel');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { param } = require('../../routers/quanly');
dotenv.config();

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
                    accountId: req.session.accountId,
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
                              accountId: req.session.accountId,
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
            Like.find({ newId: idNew }, (err, listLike) => {
              console.log('listComment', listLike.length);
              if (!err) {
                New.findOne({ idNew: idNew }, (err, data) => {
                  console.log('data', data);
                  if (!err) {
                    if (data) {
                      data.countLike = listLike.length - 1;
                      console.log('data update', data);
                      New.updateOne({ idNew: idNew }, data)
                        .then(() => {
                          console.log('TRUEEE');
                          Like.delete({
                            userId: req.session.userId,
                            newId: idNew,
                          })
                            .then(() => {
                              res.redirect(`/chitiettintuc/${idNew}`);
                            })
                            .catch(err => next(err));
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
        } else {
          if (req.session.isAuth) {
            Like.find({ newId: idNew }, (err, listLike) => {
              console.log('listComment', listLike.length);
              if (!err) {
                New.findOne({ idNew: idNew }, (err, data) => {
                  console.log('data', data);
                  if (!err) {
                    if (data) {
                      data.countLike = listLike.length + 1;
                      console.log('data update', data);
                      New.updateOne({ idNew: idNew }, data)
                        .then(() => {
                          console.log('TRUEEE');
                          like
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
            accountId: req.session.accountId,
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

  // // [GET] /register
  loadRegister(req, res) {
    res.render('register');
  }

  register = (req, res, next) => {
    const { username, email, password, repassword, role } = req.body;
    console.log('========log', req.body);
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (username.length < 6) {
      req.flash('error', 'Tên đăng nhập quá ngắn!');
      res.redirect('/register');
    } else {
      Account.findOne({ username: username }, (err, data) => {
        if (!err) {
          if (data) {
            req.flash('error', 'Tên đăng nhập đã tồn tại!');
            res.redirect('/register');
          } else {
            if (email.match(mailformat)) {
              User.findOne({ email: email }, (err, data) => {
                if (!err) {
                  if (data) {
                    req.flash('error', 'Email đã tồn tại!');
                    res.redirect('/register');
                  } else {
                    if (password.length < 8) {
                      req.flash('error', 'Mật khẩu phải từ 8 ký tự!');
                      res.redirect('/register');
                    } else {
                      if (password == repassword) {
                        const account = new Account();
                        account.username = username;
                        account.password = password;
                        account.role = role;
                        account
                          .save()
                          .then(() => {
                            Account.findOne(
                              { username: username },
                              (err, data) => {
                                if (!err) {
                                  if (data) {
                                    const user = new User();
                                    user.email = email;
                                    user.idAccount = data.id;
                                    user.status = 0;
                                    user
                                      .save()
                                      .then(() => {
                                        // sendOTPEmail({ username, email });
                                        // 12345678

                                        let transporter =
                                          nodemailer.createTransport({
                                            host: 'smtp.gmail.com',
                                            port: 465,
                                            secure: true,
                                            auth: {
                                              type: 'login',
                                              user: 'haphuong09031993@gmail.com',
                                              pass: 'aoayfjhrxdjzceux',
                                            },
                                          });

                                        const otp = `${Math.floor(
                                          1000 + Math.random() * 9000
                                        )}`;

                                        const mailOptions = {
                                          from: 'haphuong09031993@gmail.com',
                                          to: email,
                                          subject: 'Verify your Email',
                                          html: `<p> Enter <b>${otp}</b> in the app to verify your email address and complete</p>`,
                                        };

                                        const otpEmail = new EmailOTP({
                                          userName: username,
                                          otp: otp,
                                          createAt: Date.now(),
                                          expireAt: Date.now() + 3600000,
                                        });

                                        otpEmail
                                          .save()
                                          .then(() => {
                                            transporter.sendMail(mailOptions);
                                            res.redirect(`/verify/${username}`);
                                          })
                                          .catch(error => {});
                                      })
                                      .catch(error => {});
                                  } else {
                                    res.status(400).json({ error: 'ERROR!!!' });
                                  }
                                } else {
                                  res.status(400).json({ error: 'ERROR!!!' });
                                }
                              }
                            ).lean();
                          })
                          .catch(error => {});
                      } else {
                        req.flash('error', 'Mật khẩu nhập lại không trùng!');
                        res.redirect('/register');
                      }
                    }
                  }
                } else {
                  res.status(400).json({ error: 'ERROR!!!' });
                }
              }).lean();
            } else {
              req.flash('error', 'Email sai định dạng!');
              res.redirect('/register');
            }
          }
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    }
  };

  loadVerification(req, res) {
    console.log('======== verification =========', req.params.username);
    Account.findOne({ username: req.params.username }, (err, data) => {
      if (!err) {
        if (data) {
          User.findOne({ idAccount: data.id }, (err, dataUser) => {
            if (!err) {
              if (dataUser) {
                console.log('======== dataUser =========', dataUser);
                console.log(
                  '======== req.params.username =========',
                  req.params.username
                );
                res.render('otpverification', {
                  dataUser: dataUser,
                  username: req.params.username,
                }); //có dữ liệu sẽ đưa data vào trang home với data là d/s new tìm đc
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
  }

  verification(req, res) {
    console.log('======== dataUser22 =========', req.body);
    EmailOTP.findOne({ userName: req.body.userName }, (err, data) => {
      if (!err) {
        if (data) {
          if (bcrypt.compareSync(req.body.optEmail, data.otp)) {
            User.updateOne(
              { idUser: Number(req.body.idUser) },
              { status: 1, avatar: req.body.avatar }
            )
              .then(() => {
                req.flash('success', 'Đăng ký tài khoản thành công!');
                res.redirect('/login');
              })
              .catch(err => {
                console.log('=========err', err);
              });
          } else {
            req.flash('error', 'Mã OTP chưa chính xác!');
            res.redirect(`/verify/${req.body.userName}`);
          }
        }
      } else {
        res.status(400).json({ error: 'ERROR!!!' });
      }
    }).lean();
  }

  getOTP = async (req, res, next) => {
    const { username, otp } = req.body;
    try {
      const user = await EmailOTP.findOne({ userName: username });
      if (!user) return res.json({ msg: 'Incorrect Username', status: false });
      const isPasswordValid = await bcrypt.compare(otp, user.otp);
      if (!isPasswordValid) return res.json({ msg: 'OTP Fail', status: false });
      return res.json({ status: true });
    } catch (ex) {
      next(ex);
    }
  };

  // [GET] /register
  thongtincanhanTV(req, res) {
    if (req.session.isAuth) {
      User.findOne({ idUser: req.session.userId }, (err, data) => {
        if (!err) {
          res.render('thongtincanhantv', {
            data: data,
            accountId: req.session.accountId,
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
    function CustomAlert() {
      this.alert = function (message, title) {
        document.body.innerHTML =
          document.body.innerHTML +
          '<div id="dialogoverlay"></div><div id="dialogbox" class="slit-in-vertical"><div><div id="dialogboxhead"></div><div id="dialogboxbody"></div><div id="dialogboxfoot"></div></div></div>';

        let dialogoverlay = document.getElementById('dialogoverlay');
        let dialogbox = document.getElementById('dialogbox');

        let winH = window.innerHeight;
        dialogoverlay.style.height = winH + 'px';

        dialogbox.style.top = '100px';

        dialogoverlay.style.display = 'block';
        dialogbox.style.display = 'block';

        document.getElementById('dialogboxhead').style.display = 'block';

        if (typeof title === 'undefined') {
          document.getElementById('dialogboxhead').style.display = 'none';
        } else {
          document.getElementById('dialogboxhead').innerHTML =
            '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> ' +
            title;
        }
        document.getElementById('dialogboxbody').innerHTML = message;
        document.getElementById('dialogboxfoot').innerHTML =
          '<button class="pure-material-button-contained active" onclick="customAlert.ok()">OK</button>';
      };

      this.ok = function () {
        document.getElementById('dialogbox').style.display = 'none';
        document.getElementById('dialogoverlay').style.display = 'none';
      };
    }

    let customAlert = new CustomAlert();

    if (req.session.isAuth) {
      req.body.idUser = Number(req.params.idUser);
      console.log('req.body', req.body);
      User.updateOne({ idUser: Number(req.params.idUser) }, req.body)
        .then(() => {
          req.flash('success', 'Chỉnh sửa thông tin cá nhân thành công!');
          res.redirect('/thongtincanhan');
        })
        .catch(err => {
          req.flash('error', 'Lỗi! Vui lòng kiểm tra thông tin nhập!');
        });
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  danhsachtincho(req, res) {
    const array = [];
    const listNewType = [];
    if (req.session.isAuth) {
      New.find({ authorId: req.session.userId, status: 0 }, (err, data) => {
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
                  console.log('=========danhsachtincho', array);
                  res.render('danhsachtincho', {
                    array: array,
                    accountId: req.session.accountId,
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
      req.session.back = '/danhsachtincho';
      res.redirect('/login/');
    }
  }

  danhsachtypenew(req, res) {
    NewType.find((err, data) => {
      if (!err) {
        console.log('=========data', data);
        res.send(data);
      } else {
        res.status(400).json({ error: 'ERROR!!!' });
      }
    });
  }

  taotinthanhvien(req, res) {
    if (req.session.isAuth) {
      NewType.find((err, data) => {
        if (!err) {
          console.log('=========data', data);
          res.render('dangtinthanhvien', {
            data: data,
            accountId: req.session.accountId,
            username: req.session.username,
            userId: req.session.userId,
            avatar: req.session.avatar,
            role: req.session.role,
          });
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      });
    } else {
      req.session.back = '/dangtin';
      res.redirect('/login/');
    }
  }

  dangtinthanhvien(req, res) {
    const news = new New(req.body);
    news.authorId = Number(req.body.authorId);
    console.log('---------', news);
    console.log('---------', news.authorId);

    const idNewType = Number(req.body.typeId);

    if (req.session.isAuth) {
      NewType.findOne({ idNewType: idNewType }, (err, newType) => {
        if (!err) {
          if (newType) {
            news.nameType = newType.name;
            console.log('-----ddd----', news);

            news
              .save()
              .then(() => res.redirect('/home'))
              .catch(error => {});
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
              User.findOne(
                { idAccount: user.id, status: 1 },
                (err, userInfo) => {
                  if (!err) {
                    if (userInfo) {
                      sess.isAuth = true;
                      sess.role = user.role;
                      sess.username = user.username;
                      sess.accountId = user.id;
                      sess.userId = userInfo.idUser;
                      sess.avatar = userInfo.avatar;
                    } else {
                      req.flash('error', 'Tài khoản chưa được kích hoạt!'); //nếu bắt user ko đúng sẽ trả dòng này
                      res.redirect('/login/');
                    }
                  } else {
                    res.status(400).json({ error: 'ERROR!!!' });
                  }
                }
              ).lean();
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
                                accountId: req.session.accountId,
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
            accountId: req.session.accountId,
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
                accountId: req.session.accountId,
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

  loaddoimatkhau(req, res) {
    if (req.session.isAuth) {
      res.render('doimatkhau', {
        accountId: req.session.accountId,
        username: req.session.username,
        userId: req.session.userId,
        avatar: req.session.avatar,
        role: req.session.role,
      }); //có dữ liệu sẽ đưa data vào trang home với data là d/s new tìm đc
    } else {
      req.session.back = '/doimatkhau';
      res.redirect('/login/');
    }
  }

  doimatkhau(req, res) {
    Account.findOne({ id: Number(req.params.accountId) }, function (err, acc) {
      if (!err) {
        if (acc) {
          if (bcrypt.compareSync(req.body.oldpassword, acc.password)) {
            if (req.body.newpassword.length < 8) {
              req.flash('error', 'Mật khẩu phải từ 8 ký tự!');
              res.redirect('/doimatkhau');
            } else {
              if (req.body.newpassword == req.body.renewpassword) {
                bcrypt.hash(req.body.newpassword, 10, function (error, hash) {
                  if (error) {
                    return next(error);
                  } else {
                    if (hash) {
                      console.log('=========hash', hash);
                      req.body.newpassword = hash;
                      console.log('=========hash', req.body.newpassword);

                      if (req.session.isAuth) {
                        Account.updateOne(
                          { id: Number(req.params.accountId) },
                          { password: hash }
                        )
                          .then(() => {
                            req.flash('success', 'Thành công!');
                            res.redirect('/home');
                          })
                          .catch(err => {
                            console.log('=========err', err);
                          });
                      } else {
                        req.session.back = '/home';
                        res.redirect('/login/');
                      }
                    }
                  }
                });
              } else {
                req.flash('error', 'Mật khẩu nhập lại không trùng!');
                res.redirect('/doimatkhau');
              }
            }
          } else {
            req.flash('error', 'Mật khẩu cũ không đúng!');
            res.redirect('/doimatkhau');
          }
        }
      } else {
        res.status(400).json({ error: 'ERROR!!!' });
      }
    });
  }

  // ADMIN
  loginadminget(req, res) {
    res.render('loginadmin');
  }

  // [GET] /login
  loginadmin(req, res) {
    Account.findOne(
      // { tendangnhap: req.body.tendangnhap, matkhau: req.body.matkhau },
      { username: req.body.username }, // bắt user name trước

      function (err, user) {
        if (!err) {
          if (user == null) {
            req.flash('error', 'Tên đăng nhập không đúng!'); //nếu bắt user ko đúng sẽ trả dòng này
            res.redirect('/admin/login/');
          } else {
            if (bcrypt.compareSync(req.body.password, user.password)) {
              var sess = req.session;
              User.findOne(
                { idAccount: user.id, status: 1 },
                (err, userInfo) => {
                  if (!err) {
                    if (userInfo) {
                      sess.isAuth = true;
                      sess.role = user.role;
                      sess.username = user.username;
                      sess.accountId = user.id;
                      sess.userId = userInfo.idUser;
                      sess.avatar = userInfo.avatar;
                    } else {
                      req.flash('error', 'Tài khoản chưa được kích hoạt!'); //nếu bắt user ko đúng sẽ trả dòng này
                      res.redirect('/admin/login/');
                    }
                  } else {
                    res.status(400).json({ error: 'ERROR!!!' });
                  }
                }
              ).lean();
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
                              res.render('homeadmin', {
                                array: array,
                                accountId: req.session.accountId,
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
              res.redirect('/admin/login/');
            }
          }
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }
    );
  }
  homeadmin(req, res) {
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
                  res.render('homeadmin', {
                    array: array,
                    accountId: req.session.accountId,
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
      req.session.back = '/admin/home';
      res.redirect('/admin/login/');
    }
  }

  duyettinadmin(req, res) {
    const array = [];
    const listNewType = [];
    if (req.session.isAuth) {
      New.updateOne({ idNew: Number(req.params.idNew) }, { status: 1 })
        .then(() => {
          req.flash('success', 'Duyệt thành công!');
          res.redirect('/admin/home');
        })
        .catch(err => {
          console.log('=========err', err);
        });
    } else {
      req.session.back = '/admin/home';
      res.redirect('/admin/login/');
    }
  }

  quanlybinhluan(req, res) {
    const array = [];
    const listNewType = [];
    if (req.session.isAuth) {
      Comment.find((err, data) => {
        if (!err) {
          for (var i = 0; i < data.length; i++) {
            const commentTemp = new CommentTemp();
            commentTemp.idCommentTemp = data[i].idComment;
            commentTemp.userName = data[i].userName;
            commentTemp.userImage = data[i].userImage;
            commentTemp.newId = data[i].newId;
            commentTemp.content = data[i].content;
            commentTemp.status = data[i].status;
            commentTemp.createdDate = data[i].createdDate;
            commentTemp.updatedDate = data[i].updatedDate;

            New.findOne({ idNew: data[i].newId }, (err, news) => {
              if (!err) {
                listNewType.push(news);
                commentTemp.titleNew = news.title;
                array.push(commentTemp);
                if (listNewType.length == data.length) {
                  res.render('quanlybinhluan', {
                    array: array,
                    accountId: req.session.accountId,
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
      req.session.back = '/admin/quanlybinhluan';
      res.redirect('/admin/login/');
    }
  }

  duyetbinhluan(req, res) {
    const array = [];
    const listNewType = [];
    if (req.session.isAuth) {
      Comment.updateOne(
        { idComment: Number(req.params.idComment) },
        { status: 1 }
      )
        .then(() => {
          req.flash('success', 'Duyệt thành công!');
          res.redirect('/admin/quanlybinhluan');
        })
        .catch(err => {
          console.log('=========err', err);
        });
    } else {
      req.session.back = '/admin/quanlybinhluan';
      res.redirect('/admin/login/');
    }
  }

  xemchitiettinadmin(req, res, next) {
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
                            res.render('chitiettinadmin', {
                              data: data,
                              accountId: req.session.accountId,
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

  quanlychuyenvien(req, res) {
    const array = [];
    const listNewType = [];
    if (req.session.isAuth) {
      Account.find({ role: 2 }, (err, data) => {
        if (!err) {
          for (var i = 0; i < data.length; i++) {
            const userTempCV = new UserTempCV();
            userTempCV.idAccount = data[i].id;
            userTempCV.username = data[i].username;
            userTempCV.password = data[i].password;
            userTempCV.role = data[i].role;

            User.findOne({ idAccount: data[i].id }, (err, users) => {
              if (!err) {
                listNewType.push(users);
                userTempCV.idUserTempCV = users.idUser;
                userTempCV.name = users.name;
                userTempCV.dateOfBirth = users.dateOfBirth;
                userTempCV.gender = users.gender;
                userTempCV.cccd = users.cccd;
                userTempCV.issuedBy = users.issuedBy;
                userTempCV.dateOfIssue = users.dateOfIssue;
                userTempCV.status = users.status;
                userTempCV.email = users.email;
                userTempCV.createdAt = users.createdAt;
                userTempCV.updatedAt = users.updatedAt;
                array.push(userTempCV);
                if (listNewType.length == data.length) {
                  res.render('quanlychuyenvien', {
                    array: array,
                    accountId: req.session.accountId,
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
      req.session.back = '/admin/quanlybinhluan';
      res.redirect('/admin/login/');
    }
  }

  xoachuyenvien(req, res) {
    const array = [];
    const listNewType = [];
    if (req.session.isAuth) {
      User.findOne({ idUser: Number(req.params.idUser) }, (err, data) => {
        console.log('=========data', data);
        if (!err) {
          if (data) {
            Account.delete({
              id: data.idAccount,
            })
              .then(() => {
                User.delete({
                  idUser: Number(req.params.idUser),
                })
                  .then(() => {
                    req.flash('success', 'Xoá thành công!');
                    res.redirect('/admin/quanlychuyenvien');
                  })
                  .catch(err => next(err));
              })
              .catch(err => next(err));
          }
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/admin/quanlychuyenvien';
      res.redirect('/admin/login/');
    }
  }

  loadthemchuyenvien(req, res) {
    if (req.session.isAuth) {
      res.render('themchuyenvien', {
        accountId: req.session.accountId,
        username: req.session.username,
        userId: req.session.userId,
        avatar: req.session.avatar,
        role: req.session.role,
      }); //có dữ liệu sẽ đưa data vào trang home với data là d/s new tìm đc
    } else {
      req.session.back = '/admin/themchuyenvien';
      res.redirect('/login/');
    }
  }

  themchuyenvien(req, res) {
    const acc = new Account({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
    });
    if (req.session.isAuth) {
      console.log('=========params', req.body);
      console.log('=========acc', acc);
      Account.findOne({ username: req.body.username }, (err, isAcc) => {
        if (!err) {
          if (isAcc) {
            req.flash('error', 'Tên đăng nhập đã tồn tại!'); //nếu bắt user ko đúng sẽ trả dòng này
            res.redirect('/admin/themchuyenvien');
          } else {
            acc
              .save()
              .then(() => {
                Account.findOne(
                  { username: req.body.username },
                  (err, account) => {
                    if (!err) {
                      if (account) {
                        console.log('=========account', account);
                        const userTV = new User({
                          name: req.body.name,
                          dateOfBirth: req.body.dateOfBirth,
                          gender: req.body.gender,
                          cccd: req.body.cccd,
                          issuedBy: req.body.issuedBy,
                          dateOfIssue: req.body.dateOfIssue,
                          status: req.body.status,
                          avatar: req.body.avatar,
                          idAccount: account.id,
                        });
                        console.log('=========userTV', userTV);
                        userTV
                          .save()
                          .then(() => {
                            req.flash('success', 'Thêm thành công!');
                            res.redirect('/admin/quanlychuyenvien');
                          })
                          .catch(error => {});
                      }
                    } else {
                      res.status(400).json({ error: 'ERROR!!!' });
                    }
                  }
                ).lean();
              })
              .catch(error => {});
          }
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/admin/quanlychuyenvien';
      res.redirect('/admin/login/');
    }
  }
}
module.exports = new MainController();
