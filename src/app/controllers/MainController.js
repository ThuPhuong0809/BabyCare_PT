const readXlsxFile = require('read-excel-file/node');
const bcrypt = require('bcryptjs'); // mã hoá mật khẩu, giúp bảo mật
const Account = require('../model/Account');
const New = require('../model/New');
const User = require('../model/User');
const Comment = require('../model/Comment');
const Chat = require('../model/Chat');
const ListChat = require('../model/ListChat');
const NewType = require('../model/NewType');
const Like = require('../model/Like');
const Report = require('../model/Report');

const CommentTemp = require('../model/CommentTemp');
const UserTempCV = require('../model/UserTempCV');
const NewTemp = require('../model/NewTemp');
const EmailOTP = require('../model/EmailOTPModel');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { param } = require('../../routers/quanly');
const socket = require('socket.io');
dotenv.config();

class MainController {
  // [GET] /home
  home(req, res) {
    const array = [];
    const arraySort = [];
    const arraySortNew = [];
    const listNewType = [];

    const listLikeReads = [];
    const listCommentReads = [];
    const liked = false;
    const commented = false;
    if (req.session.isAuth) {
      New.find({ status: 1 }, (err, data) => {
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
            newTemp.video = data[i].video;
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
                arraySort.push(newTemp);

                if (listNewType.length == data.length) {
                  arraySort.sort(function (a, b) {
                    return b.countLike - a.countLike; // sắp xếp theo lượng like
                  });
                  if (arraySort.length > 5) {
                    for (var i = 0; i < arraySort.length; i++) {
                      var date1 = new Date(); // current date
                      var date2 = new Date(arraySort[i].createdDate);
                      if (
                        date2.getTime() - date1.getTime() >= -5184000000 &&
                        arraySortNew.length < 5
                      ) {
                        arraySortNew.push(arraySort[i]);
                      }
                    }
                  } else {
                    for (var i = 0; i < arraySort.length; i++) {
                      arraySortNew.push(arraySort[i]);
                    }
                  }
                  array.sort(function (a, b) {
                    return b.createdDate - a.createdDate;
                  });
                  // thông báo
                  New.find(
                    { authorId: Number(req.session.userId) }, //xác định có tk đó có bao nhiêu tin
                    (err, listNew) => {
                      if (!err) {
                        if (listNew.length > 0) {
                          for (var i = 0; i < listNew.length; i++) {
                            Like.find(
                              {
                                newId: Number(listNew[i].idNew),
                                isRead: 1,
                              },
                              (err, listLikeRead) => {
                                if (!err) {
                                  if (listLikeRead.length > 0) {
                                    for (
                                      var i = 0;
                                      i < listLikeRead.length;
                                      i++
                                    ) {
                                      if (
                                        listLikeRead[i].userName !=
                                        req.session.username
                                      ) {
                                        listLikeReads.push(listLikeRead[i]);
                                      }
                                    }
                                  }
                                } else {
                                  res.status(400).json({ error: 'ERROR!!!' });
                                }
                              }
                            ).lean();

                            Comment.find(
                              {
                                newId: Number(listNew[i].idNew),
                                isRead: 1,
                              },
                              (err, listCommentRead) => {
                                if (!err) {
                                  if (listCommentRead.length > 0) {
                                    for (
                                      var i = 0;
                                      i < listCommentRead.length;
                                      i++
                                    ) {
                                      if (
                                        listCommentRead[i].userName !=
                                        req.session.username
                                      ) {
                                        listCommentReads.push(
                                          listCommentRead[i]
                                        );
                                      }
                                    }
                                  }
                                } else {
                                  res.status(400).json({
                                    error: 'ERROR!!!',
                                  });
                                }
                              }
                            ).lean();
                          }

                          setTimeout(function () {
                            listCommentReads.sort(function (a, b) {
                              return b.createdDate - a.createdDate;
                            });
                            listLikeReads.sort(function (a, b) {
                              return b.time - a.time;
                            });
                            res.render('home', {
                              listCommentReads: listCommentReads,
                              countCommentRead:
                                listCommentReads.length + listLikeReads.length,
                              listLikeReads: listLikeReads,
                              array: array,
                              arraySortNew: arraySortNew,
                              accountId: req.session.accountId,
                              username: req.session.username,
                              userId: req.session.userId,
                              avatar: req.session.avatar,
                              role: req.session.role,
                            });
                          }, 500);
                        } else {
                          res.render('home', {
                            listCommentReads: listCommentReads,
                            countCommentRead:
                              listCommentReads.length + listLikeReads.length,
                            listLikeReads: listLikeReads,
                            array: array,
                            arraySortNew: arraySortNew,
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
                    }
                  ).lean();
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
      New.find({ status: 1 }, (err, data) => {
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
            newTemp.video = data[i].video;
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
                arraySort.push(newTemp);
                if (listNewType.length == data.length) {
                  arraySort.sort(function (a, b) {
                    return b.countLike - a.countLike;
                  });
                  if (arraySort.length > 5) {
                    for (var i = 0; i < arraySort.length; i++) {
                      var date1 = new Date(); // current date
                      var date2 = new Date(arraySort[i].createdDate);
                      if (
                        date2.getTime() - date1.getTime() >= -5184000000 &&
                        arraySortNew.length < 5
                      ) {
                        arraySortNew.push(arraySort[i]);
                      }
                    }
                  } else {
                    for (var i = 0; i < arraySort.length; i++) {
                      arraySortNew.push(arraySort[i]);
                    }
                  }
                  array.sort(function (a, b) {
                    return b.createdDate - a.createdDate;
                  });

                  res.render('home', {
                    array: array,
                    arraySortNew: arraySortNew,
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
    }
  }

  // [PUT] /chitiettintuc/:id
  chitiettintuc(req, res, next) {
    const listLikeReads = [];
    const listCommentReads = [];
    if (req.session.isAuth) {
      New.findOne({ idNew: Number(req.params.idNew) }, (err, data) => {
        if (!err) {
          Comment.find(
            { newId: Number(req.params.idNew), status: 1 },
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
                            listComment.sort(function (a, b) {
                              return b.createdDate - a.createdDate;
                            });
                            New.find(
                              { authorId: Number(req.session.userId) },
                              (err, listNew) => {
                                if (!err) {
                                  if (listNew.length > 0) {
                                    for (var i = 0; i < listNew.length; i++) {
                                      Like.find(
                                        {
                                          newId: Number(listNew[i].idNew),
                                          isRead: 1,
                                        },
                                        (err, listLikeRead) => {
                                          if (!err) {
                                            if (listLikeRead.length > 0) {
                                              for (
                                                var i = 0;
                                                i < listLikeRead.length;
                                                i++
                                              ) {
                                                if (
                                                  listLikeRead[i].userName !=
                                                  req.session.username
                                                ) {
                                                  listLikeReads.push(
                                                    listLikeRead[i]
                                                  );
                                                }
                                              }
                                            }
                                          } else {
                                            res
                                              .status(400)
                                              .json({ error: 'ERROR!!!' });
                                          }
                                        }
                                      ).lean();

                                      Comment.find(
                                        {
                                          newId: Number(listNew[i].idNew),
                                          isRead: 1,
                                        },
                                        (err, listCommentRead) => {
                                          if (!err) {
                                            if (listCommentRead.length > 0) {
                                              for (
                                                var i = 0;
                                                i < listCommentRead.length;
                                                i++
                                              ) {
                                                if (
                                                  listCommentRead[i].userName !=
                                                  req.session.username
                                                ) {
                                                  listCommentReads.push(
                                                    listCommentRead[i]
                                                  );
                                                }
                                              }
                                            }
                                          } else {
                                            res.status(400).json({
                                              error: 'ERROR!!!',
                                            });
                                          }
                                        }
                                      ).lean();
                                    }

                                    setTimeout(function () {
                                      listCommentReads.sort(function (a, b) {
                                        return b.createdDate - a.createdDate;
                                      });
                                      listLikeReads.sort(function (a, b) {
                                        return b.time - a.time;
                                      });
                                      res.render('chitiettintuc', {
                                        listCommentReads: listCommentReads,
                                        countCommentRead:
                                          listCommentReads.length +
                                          listLikeReads.length,
                                        listLikeReads: listLikeReads,
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
                                    }, 500);
                                  } else {
                                    res.render('chitiettintuc', {
                                      listCommentReads: listCommentReads,
                                      countCommentRead:
                                        listCommentReads.length +
                                        listLikeReads.length,
                                      listLikeReads: listLikeReads,
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
                                  }
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
            }
          ).lean();
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      New.findOne({ idNew: Number(req.params.idNew) }, (err, data) => {
        if (!err) {
          Comment.find(
            { newId: Number(req.params.idNew), status: 1 },
            (err, listComment) => {
              if (!err) {
                Like.find(
                  { newId: Number(req.params.idNew) },
                  (err, listLike) => {
                    if (!err) {
                      Like.find(
                        {
                          newId: Number(req.params.idNew),
                        },
                        (err, isLike) => {
                          if (!err) {
                            listComment.sort(function (a, b) {
                              return b.createdDate - a.createdDate;
                            });
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
          New.findOne({ idNew: idNew, status: 1 }, (err, data) => {
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
    like.isRead = 1;
    like.userName = req.session.username;
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
    const listLikeReads = [];
    const listCommentReads = [];
    if (req.session.isAuth) {
      Chat.find({ userName: req.session.username }, (err, listData) => {
        //lấy tất cả dữ liệu bảng new
        if (!err) {
          New.find({ authorId: Number(req.session.userId) }, (err, listNew) => {
            if (!err) {
              if (listNew.length > 0) {
                for (var i = 0; i < listNew.length; i++) {
                  Like.find(
                    {
                      newId: Number(listNew[i].idNew),
                      isRead: 1,
                    },
                    (err, listLikeRead) => {
                      if (!err) {
                        if (listLikeRead.length > 0) {
                          for (var i = 0; i < listLikeRead.length; i++) {
                            if (
                              listLikeRead[i].userName != req.session.username
                            ) {
                              listLikeReads.push(listLikeRead[i]);
                            }
                          }
                        }
                      } else {
                        res.status(400).json({ error: 'ERROR!!!' });
                      }
                    }
                  ).lean();

                  Comment.find(
                    {
                      newId: Number(listNew[i].idNew),
                      isRead: 1,
                    },
                    (err, listCommentRead) => {
                      if (!err) {
                        if (listCommentRead.length > 0) {
                          for (var i = 0; i < listCommentRead.length; i++) {
                            if (
                              listCommentRead[i].userName !=
                              req.session.username
                            ) {
                              listCommentReads.push(listCommentRead[i]);
                            }
                          }
                        }
                      } else {
                        res.status(400).json({
                          error: 'ERROR!!!',
                        });
                      }
                    }
                  ).lean();
                }

                setTimeout(function () {
                  listCommentReads.sort(function (a, b) {
                    return b.createdDate - a.createdDate;
                  });
                  listLikeReads.sort(function (a, b) {
                    return b.time - a.time;
                  });
                  res.render('guitinnhan', {
                    listCommentReads: listCommentReads,
                    countCommentRead:
                      listCommentReads.length + listLikeReads.length,
                    listLikeReads: listLikeReads,
                    listData: listData,
                    accountId: req.session.accountId,
                    username: req.session.username,
                    userId: req.session.userId,
                    avatar: req.session.avatar,
                    role: req.session.role,
                  });
                }, 500);
              } else {
                res.render('guitinnhan', {
                  listCommentReads: listCommentReads,
                  countCommentRead:
                    listCommentReads.length + listLikeReads.length,
                  listLikeReads: listLikeReads,
                  listData: listData,
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
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  guitinnhan(req, res) {
    const chat = new Chat(req.body);
    const listChat = new ListChat(req.body);
    listChat.chatLatest = req.body.message;
    const idNew = parseInt(req.body.newId);
    if (req.session.isAuth) {
      ListChat.find({ userName: req.body.userName }, (err, data) => {
        if (!err) {
          if (data.length == 0) {
            listChat.save().catch(error => {});
          } else {
            ListChat.updateOne(
              { userName: req.body.userName },
              { timeChatLatest: new Date(), chatLatest: req.body.message }
            )
              .then(() => {})
              .catch(err => {
                console.log('=========err', err);
              });
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
      req.session.back = '/home';
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
      req.flash('error', 'Tên đăng nhập phải trên 6 ký tự!');
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
    const listLikeReads = [];
    const listCommentReads = [];
    if (req.session.isAuth) {
      User.findOne({ idUser: req.session.userId }, (err, data) => {
        if (!err) {
          New.find({ authorId: Number(req.session.userId) }, (err, listNew) => {
            if (!err) {
              if (listNew.length > 0) {
                for (var i = 0; i < listNew.length; i++) {
                  Like.find(
                    {
                      newId: Number(listNew[i].idNew),
                      isRead: 1,
                    },
                    (err, listLikeRead) => {
                      if (!err) {
                        if (listLikeRead.length > 0) {
                          for (var i = 0; i < listLikeRead.length; i++) {
                            if (
                              listLikeRead[i].userName != req.session.username
                            ) {
                              listLikeReads.push(listLikeRead[i]);
                            }
                          }
                        }
                      } else {
                        res.status(400).json({ error: 'ERROR!!!' });
                      }
                    }
                  ).lean();

                  Comment.find(
                    {
                      newId: Number(listNew[i].idNew),
                      isRead: 1,
                    },
                    (err, listCommentRead) => {
                      if (!err) {
                        if (listCommentRead.length > 0) {
                          for (var i = 0; i < listCommentRead.length; i++) {
                            if (
                              listCommentRead[i].userName !=
                              req.session.username
                            ) {
                              listCommentReads.push(listCommentRead[i]);
                            }
                          }
                        }
                      } else {
                        res.status(400).json({
                          error: 'ERROR!!!',
                        });
                      }
                    }
                  ).lean();
                }

                setTimeout(function () {
                  listCommentReads.sort(function (a, b) {
                    return b.createdDate - a.createdDate; // sắp xếp theo lượng like
                  });
                  listLikeReads.sort(function (a, b) {
                    return b.time - a.time; // sắp xếp theo lượng like
                  });
                  res.render('thongtincanhantv', {
                    listCommentReads: listCommentReads,
                    countCommentRead:
                      listCommentReads.length + listLikeReads.length,
                    listLikeReads: listLikeReads,
                    data: data,
                    accountId: req.session.accountId,
                    username: req.session.username,
                    userId: req.session.userId,
                    avatar: req.session.avatar,
                    role: req.session.role,
                  });
                }, 500);
              } else {
                res.render('thongtincanhantv', {
                  listCommentReads: listCommentReads,
                  countCommentRead:
                    listCommentReads.length + listLikeReads.length,
                  listLikeReads: listLikeReads,
                  data: data,
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
      console.log('req.body', req.body.dateOfBirth);
      var date1 = new Date(); // current date
      var date2 = new Date(req.body.dateOfBirth); // mm/dd/yyyy format
      var date3 = new Date(req.body.dateOfIssue); // mm/dd/yyyy format

      if (req.body.name.length < 6) {
        req.flash('error', 'Họ và tên quá ngắn!');
        res.redirect('/thongtincanhan');
      } else if (date2.getTime() - date1.getTime() >= 0) {
        req.flash('error', 'Ngày sinh phải lớn hơn ngày hiện tại!');
        res.redirect('/thongtincanhan');
      } else if (date3.getTime() - date1.getTime() >= 0) {
        req.flash('error', 'Ngày cấp phải lớn hơn ngày hiện tại!');
        res.redirect('/thongtincanhan');
      } else if (req.body.cccd.length < 9) {
        req.flash('error', 'CCMND/CCCD phải từ 9 số trở lên!');
        res.redirect('/thongtincanhan');
      } else {
        User.updateOne({ idUser: Number(req.params.idUser) }, req.body)
          .then(() => {
            req.flash('success', 'Chỉnh sửa thông tin cá nhân thành công!');
            res.redirect('/thongtincanhan');
          })
          .catch(err => {
            req.flash('error', 'Lỗi! Vui lòng kiểm tra thông tin nhập!');
          });
      }
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  danhsachtincho(req, res) {
    const array = [];
    const listNewType = [];
    const listLikeReads = [];
    const listCommentReads = [];
    if (req.session.isAuth) {
      New.find({ authorId: req.session.userId, status: 0 }, (err, data) => {
        if (!err) {
          if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
              const newTemp = new NewTemp();
              newTemp.idNewTemp = data[i].idNew;
              newTemp.title = data[i].title;
              newTemp.content = data[i].content;
              newTemp.authorId = data[i].authorId;
              newTemp.authorName = data[i].authorName;
              newTemp.authorImage = data[i].authorImage;
              newTemp.image = data[i].image;
              newTemp.video = data[i].video;
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
                    New.find(
                      { authorId: Number(req.session.userId) },
                      (err, listNew) => {
                        if (!err) {
                          if (listNew.length > 0) {
                            for (var i = 0; i < listNew.length; i++) {
                              Like.find(
                                {
                                  newId: Number(listNew[i].idNew),
                                  isRead: 1,
                                },
                                (err, listLikeRead) => {
                                  if (!err) {
                                    if (listLikeRead.length > 0) {
                                      for (
                                        var i = 0;
                                        i < listLikeRead.length;
                                        i++
                                      ) {
                                        if (
                                          listLikeRead[i].userName !=
                                          req.session.username
                                        ) {
                                          listLikeReads.push(listLikeRead[i]);
                                        }
                                      }
                                    }
                                  } else {
                                    res.status(400).json({ error: 'ERROR!!!' });
                                  }
                                }
                              ).lean();

                              Comment.find(
                                {
                                  newId: Number(listNew[i].idNew),
                                  isRead: 1,
                                },
                                (err, listCommentRead) => {
                                  if (!err) {
                                    if (listCommentRead.length > 0) {
                                      for (
                                        var i = 0;
                                        i < listCommentRead.length;
                                        i++
                                      ) {
                                        if (
                                          listCommentRead[i].userName !=
                                          req.session.username
                                        ) {
                                          listCommentReads.push(
                                            listCommentRead[i]
                                          );
                                        }
                                      }
                                    }
                                  } else {
                                    res.status(400).json({
                                      error: 'ERROR!!!',
                                    });
                                  }
                                }
                              ).lean();
                            }

                            setTimeout(function () {
                              listCommentReads.sort(function (a, b) {
                                return b.createdDate - a.createdDate; // sắp xếp theo lượng like
                              });
                              listLikeReads.sort(function (a, b) {
                                return b.time - a.time; // sắp xếp theo lượng like
                              });
                              res.render('danhsachtincho', {
                                listCommentReads: listCommentReads,
                                countCommentRead:
                                  listCommentReads.length +
                                  listLikeReads.length,
                                listLikeReads: listLikeReads,
                                array: array,
                                accountId: req.session.accountId,
                                username: req.session.username,
                                userId: req.session.userId,
                                avatar: req.session.avatar,
                                role: req.session.role,
                              });
                            }, 500);
                          } else {
                            res.render('danhsachtincho', {
                              listCommentReads: listCommentReads,
                              countCommentRead:
                                listCommentReads.length + listLikeReads.length,
                              listLikeReads: listLikeReads,
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
                      }
                    ).lean();
                  }
                } else {
                  res.status(400).json({ error: 'ERROR!!!' });
                }
              }).lean();
            }
          } else {
            New.find(
              { authorId: Number(req.session.userId) },
              (err, listNew) => {
                if (!err) {
                  if (listNew.length > 0) {
                    for (var i = 0; i < listNew.length; i++) {
                      Like.find(
                        {
                          newId: Number(listNew[i].idNew),
                          isRead: 1,
                        },
                        (err, listLikeRead) => {
                          if (!err) {
                            if (listLikeRead.length > 0) {
                              for (var i = 0; i < listLikeRead.length; i++) {
                                if (
                                  listLikeRead[i].userName !=
                                  req.session.username
                                ) {
                                  listLikeReads.push(listLikeRead[i]);
                                }
                              }
                            }
                          } else {
                            res.status(400).json({ error: 'ERROR!!!' });
                          }
                        }
                      ).lean();

                      Comment.find(
                        {
                          newId: Number(listNew[i].idNew),
                          isRead: 1,
                        },
                        (err, listCommentRead) => {
                          if (!err) {
                            if (listCommentRead.length > 0) {
                              for (var i = 0; i < listCommentRead.length; i++) {
                                if (
                                  listCommentRead[i].userName !=
                                  req.session.username
                                ) {
                                  listCommentReads.push(listCommentRead[i]);
                                }
                              }
                            }
                          } else {
                            res.status(400).json({
                              error: 'ERROR!!!',
                            });
                          }
                        }
                      ).lean();
                    }

                    setTimeout(function () {
                      listCommentReads.sort(function (a, b) {
                        return b.createdDate - a.createdDate; // sắp xếp theo lượng like
                      });
                      listLikeReads.sort(function (a, b) {
                        return b.time - a.time; // sắp xếp theo lượng like
                      });
                      res.render('danhsachtincho', {
                        listCommentReads: listCommentReads,
                        countCommentRead:
                          listCommentReads.length + listLikeReads.length,
                        listLikeReads: listLikeReads,
                        arrayNone: 1,
                        array: array,
                        accountId: req.session.accountId,
                        username: req.session.username,
                        userId: req.session.userId,
                        avatar: req.session.avatar,
                        role: req.session.role,
                      });
                    }, 500);
                  } else {
                    res.render('danhsachtincho', {
                      listCommentReads: listCommentReads,
                      countCommentRead:
                        listCommentReads.length + listLikeReads.length,
                      listLikeReads: listLikeReads,
                      arrayNone: 1,
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
              }
            ).lean();
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
    const listLikeReads = [];
    const listCommentReads = [];
    if (req.session.isAuth) {
      NewType.find((err, data) => {
        if (!err) {
          console.log('=========data', data);
          New.find({ authorId: Number(req.session.userId) }, (err, listNew) => {
            if (!err) {
              if (listNew.length > 0) {
                for (var i = 0; i < listNew.length; i++) {
                  Like.find(
                    {
                      newId: Number(listNew[i].idNew),
                      isRead: 1,
                    },
                    (err, listLikeRead) => {
                      if (!err) {
                        if (listLikeRead.length > 0) {
                          for (var i = 0; i < listLikeRead.length; i++) {
                            if (
                              listLikeRead[i].userName != req.session.username
                            ) {
                              listLikeReads.push(listLikeRead[i]);
                            }
                          }
                        }
                      } else {
                        res.status(400).json({ error: 'ERROR!!!' });
                      }
                    }
                  ).lean();

                  Comment.find(
                    {
                      newId: Number(listNew[i].idNew),
                      isRead: 1,
                    },
                    (err, listCommentRead) => {
                      if (!err) {
                        if (listCommentRead.length > 0) {
                          for (var i = 0; i < listCommentRead.length; i++) {
                            if (
                              listCommentRead[i].userName !=
                              req.session.username
                            ) {
                              listCommentReads.push(listCommentRead[i]);
                            }
                          }
                        }
                      } else {
                        res.status(400).json({
                          error: 'ERROR!!!',
                        });
                      }
                    }
                  ).lean();
                }

                setTimeout(function () {
                  listCommentReads.sort(function (a, b) {
                    return b.createdDate - a.createdDate; // sắp xếp theo lượng like
                  });
                  listLikeReads.sort(function (a, b) {
                    return b.time - a.time; // sắp xếp theo lượng like
                  });
                  res.render('dangtinthanhvien', {
                    listCommentReads: listCommentReads,
                    countCommentRead:
                      listCommentReads.length + listLikeReads.length,
                    listLikeReads: listLikeReads,
                    data: data,
                    accountId: req.session.accountId,
                    username: req.session.username,
                    userId: req.session.userId,
                    avatar: req.session.avatar,
                    role: req.session.role,
                  });
                }, 500);
              } else {
                res.render('dangtinthanhvien', {
                  listCommentReads: listCommentReads,
                  countCommentRead:
                    listCommentReads.length + listLikeReads.length,
                  listLikeReads: listLikeReads,
                  data: data,
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
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      });
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  dangtinthanhvien(req, res) {
    //Tiêu đề không được để trống
    const news = new New(req.body);
    news.authorId = Number(req.body.authorId);

    const idNewType = Number(req.body.typeId);

    if (req.session.isAuth) {
      NewType.findOne({ idNewType: idNewType }, (err, newType) => {
        if (!err) {
          if (newType) {
            news.nameType = newType.name;

            news
              .save()
              .then(() => res.redirect('/danhsachtincho'))
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
    const listLikeReads = [];
    const listCommentReads = [];
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
                const arraySort = [];
                const arraySortNew = [];
                const listNewType = [];
                New.find({ status: 1 }, (err, data) => {
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
                      newTemp.video = data[i].video;
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
                            arraySort.push(newTemp);
                            if (listNewType.length == data.length) {
                              arraySort.sort(function (a, b) {
                                return b.countLike - a.countLike;
                              });

                              if (arraySort.length > 5) {
                                for (var i = 0; i < arraySort.length; i++) {
                                  var date1 = new Date(); // current date
                                  var date2 = new Date(
                                    arraySort[i].createdDate
                                  );
                                  if (
                                    date2.getTime() - date1.getTime() >=
                                      -5184000000 &&
                                    arraySortNew.length < 5
                                  ) {
                                    arraySortNew.push(arraySort[i]);
                                  }
                                }
                              } else {
                                for (var i = 0; i < arraySort.length; i++) {
                                  arraySortNew.push(arraySort[i]);
                                }
                              }

                              array.sort(function (a, b) {
                                return b.createdDate - a.createdDate;
                              });
                              New.find(
                                { authorId: Number(req.session.userId) },
                                (err, listNew) => {
                                  if (!err) {
                                    if (listNew.length > 0) {
                                      for (var i = 0; i < listNew.length; i++) {
                                        Like.find(
                                          {
                                            newId: Number(listNew[i].idNew),
                                            isRead: 1,
                                          },
                                          (err, listLikeRead) => {
                                            if (!err) {
                                              if (listLikeRead.length > 0) {
                                                for (
                                                  var i = 0;
                                                  i < listLikeRead.length;
                                                  i++
                                                ) {
                                                  if (
                                                    listLikeRead[i].userName !=
                                                    req.session.username
                                                  ) {
                                                    listLikeReads.push(
                                                      listLikeRead[i]
                                                    );
                                                  }
                                                }
                                              }
                                            } else {
                                              res
                                                .status(400)
                                                .json({ error: 'ERROR!!!' });
                                            }
                                          }
                                        ).lean();

                                        Comment.find(
                                          {
                                            newId: Number(listNew[i].idNew),
                                            isRead: 1,
                                          },
                                          (err, listCommentRead) => {
                                            if (!err) {
                                              if (listCommentRead.length > 0) {
                                                for (
                                                  var i = 0;
                                                  i < listCommentRead.length;
                                                  i++
                                                ) {
                                                  if (
                                                    listCommentRead[i]
                                                      .userName !=
                                                    req.session.username
                                                  ) {
                                                    listCommentReads.push(
                                                      listCommentRead[i]
                                                    );
                                                  }
                                                }
                                              }
                                            } else {
                                              res.status(400).json({
                                                error: 'ERROR!!!',
                                              });
                                            }
                                          }
                                        ).lean();
                                      }

                                      setTimeout(function () {
                                        listCommentReads.sort(function (a, b) {
                                          return b.createdDate - a.createdDate; // sắp xếp theo lượng like
                                        });
                                        listLikeReads.sort(function (a, b) {
                                          return b.time - a.time; // sắp xếp theo lượng like
                                        });
                                        res.render('home', {
                                          listCommentReads: listCommentReads,
                                          countCommentRead:
                                            listCommentReads.length +
                                            listLikeReads.length,
                                          listLikeReads: listLikeReads,
                                          array: array,
                                          arraySortNew: arraySortNew,
                                          accountId: req.session.accountId,
                                          username: req.session.username,
                                          role: req.session.role,
                                          userId: req.session.userId,
                                          avatar: req.session.avatar,
                                        });
                                      }, 500);
                                    } else {
                                      res.render('home', {
                                        listCommentReads: listCommentReads,
                                        countCommentRead:
                                          listCommentReads.length +
                                          listLikeReads.length,
                                        listLikeReads: listLikeReads,
                                        array: array,
                                        arraySortNew: arraySortNew,
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
    const listLikeReads = [];
    const listCommentReads = [];
    const liked = false;
    const commented = false;
    if (req.session.isAuth) {
      ListChat.find((err, data) => {
        if (data.length > 0) {
          data.sort(function (a, b) {
            return b.timeChatLatest - a.timeChatLatest;
          });
        }
        if (!err) {
          New.find({ authorId: Number(req.session.userId) }, (err, listNew) => {
            if (!err) {
              if (listNew.length > 0) {
                for (var i = 0; i < listNew.length; i++) {
                  Like.find(
                    {
                      newId: Number(listNew[i].idNew),
                      isRead: 1,
                    },
                    (err, listLikeRead) => {
                      if (!err) {
                        if (listLikeRead.length > 0) {
                          for (var i = 0; i < listLikeRead.length; i++) {
                            if (
                              listLikeRead[i].userName != req.session.username
                            ) {
                              listLikeReads.push(listLikeRead[i]);
                            }
                          }
                        }
                      } else {
                        res.status(400).json({ error: 'ERROR!!!' });
                      }
                    }
                  ).lean();

                  Comment.find(
                    {
                      newId: Number(listNew[i].idNew),
                      isRead: 1,
                    },
                    (err, listCommentRead) => {
                      if (!err) {
                        if (listCommentRead.length > 0) {
                          for (var i = 0; i < listCommentRead.length; i++) {
                            if (
                              listCommentRead[i].userName !=
                              req.session.username
                            ) {
                              listCommentReads.push(listCommentRead[i]);
                            }
                          }
                        }
                      } else {
                        res.status(400).json({
                          error: 'ERROR!!!',
                        });
                      }
                    }
                  ).lean();
                }

                setTimeout(function () {
                  listCommentReads.sort(function (a, b) {
                    return b.createdDate - a.createdDate; // sắp xếp theo lượng like
                  });
                  listLikeReads.sort(function (a, b) {
                    return b.time - a.time; // sắp xếp theo lượng like
                  });
                  res.render('listchatcvtv', {
                    data: data,
                    listCommentReads: listCommentReads,
                    countCommentRead:
                      listCommentReads.length + listLikeReads.length,
                    listLikeReads: listLikeReads,
                    accountId: req.session.accountId,
                    username: req.session.username,
                    userId: req.session.userId,
                    avatar: req.session.avatar,
                    role: req.session.role,
                  });
                }, 500);
              } else {
                res.render('listchatcvtv', {
                  listCommentReads: listCommentReads,
                  countCommentRead:
                    listCommentReads.length + listLikeReads.length,
                  listLikeReads: listLikeReads,
                  data: data,
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

          // console.log(data);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  chitietchat(req, res, next) {
    const listLikeReads = [];
    const listCommentReads = [];
    const liked = false;
    const commented = false;
    if (req.session.isAuth) {
      ListChat.find((err, data) => {
        if (!err) {
          if (data.length > 0) {
            data.sort(function (a, b) {
              return b.timeChatLatest - a.timeChatLatest;
            });
          }

          Chat.find({ userName: req.params.userName }, (err, listChat) => {
            if (!err) {
              ListChat.findOne(
                { userName: req.params.userName },
                (err, chatNow) => {
                  if (!err) {
                    New.find(
                      { authorId: Number(req.session.userId) },
                      (err, listNew) => {
                        if (!err) {
                          if (listNew.length > 0) {
                            for (var i = 0; i < listNew.length; i++) {
                              Like.find(
                                {
                                  newId: Number(listNew[i].idNew),
                                  isRead: 1,
                                },
                                (err, listLikeRead) => {
                                  if (!err) {
                                    if (listLikeRead.length > 0) {
                                      for (
                                        var i = 0;
                                        i < listLikeRead.length;
                                        i++
                                      ) {
                                        if (
                                          listLikeRead[i].userName !=
                                          req.session.username
                                        ) {
                                          listLikeReads.push(listLikeRead[i]);
                                        }
                                      }
                                    }
                                  } else {
                                    res.status(400).json({ error: 'ERROR!!!' });
                                  }
                                }
                              ).lean();

                              Comment.find(
                                {
                                  newId: Number(listNew[i].idNew),
                                  isRead: 1,
                                },
                                (err, listCommentRead) => {
                                  if (!err) {
                                    if (listCommentRead.length > 0) {
                                      for (
                                        var i = 0;
                                        i < listCommentRead.length;
                                        i++
                                      ) {
                                        if (
                                          listCommentRead[i].userName !=
                                          req.session.username
                                        ) {
                                          listCommentReads.push(
                                            listCommentRead[i]
                                          );
                                        }
                                      }
                                    }
                                  } else {
                                    res.status(400).json({
                                      error: 'ERROR!!!',
                                    });
                                  }
                                }
                              ).lean();
                            }

                            setTimeout(function () {
                              listCommentReads.sort(function (a, b) {
                                return b.createdDate - a.createdDate; // sắp xếp theo lượng like
                              });
                              listLikeReads.sort(function (a, b) {
                                return b.time - a.time; // sắp xếp theo lượng like
                              });
                              res.render('chitietchat', {
                                data: data,
                                accountId: req.session.accountId,
                                username: req.session.username,
                                userId: req.session.userId,
                                avatar: req.session.avatar,
                                role: req.session.role,
                                chatNow: chatNow,
                                listChat: listChat,
                              });
                            }, 500);
                          } else {
                            res.render('chitietchat', {
                              data: data,
                              accountId: req.session.accountId,
                              username: req.session.username,
                              userId: req.session.userId,
                              avatar: req.session.avatar,
                              role: req.session.role,
                              chatNow: chatNow,
                              listChat: listChat,
                            });
                          }
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
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/home';
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

  loadbaocaobinhluan(req, res) {
    if (req.session.isAuth) {
      console.log('-----------req.idComment', req.params.idComment);
      console.log('-----------req.newId', req.params.newId);
      res.render('baocaobinhluan', {
        accountId: req.session.accountId,
        username: req.session.username,
        userId: req.session.userId,
        avatar: req.session.avatar,
        role: req.session.role,
        newId: Number(req.params.newId),
        idComment: Number(req.params.idComment),
      });
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  baocaobinhluan(req, res) {
    if (req.session.isAuth) {
      console.log('-----------req.body', req.body);
      var newId = Number(req.body.newId);
      const report = new Report();
      report.userId = Number(req.body.userId);
      report.commentId = Number(req.body.commentId);
      report.reason = req.body.reason;
      report.status = 1;
      console.log('------report-----req.report', report);
      Comment.updateOne(
        { idComment: Number(req.body.commentId) },
        { status: 0 }
      )
        .then(() => {
          report
            .save()
            .then(() => {
              req.flash('success', 'Báo cáo thành công thành công!');
              res.redirect(`/chitiettintuc/${newId}`);
            })
            .catch(error => {
              console.log('error', error);
            });
        })
        .catch(err => {
          console.log('err 2050', err);
          req.flash('error', 'Lỗi! Vui lòng kiểm tra thông tin nhập!');
        });
    } else {
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  timkiemtin(req, res) {
    const array = [];
    const arraySortNew = [];
    const listNewType = [];

    const listLikeReads = [];
    const listCommentReads = [];
    const liked = false;
    const commented = false;
    console.log('-------', req.body.content);

    if (req.session.isAuth) {
      New.find({ status: 1 }, (err, arraySort) => {
        if (!err) {
          arraySort.sort(function (a, b) {
            return b.countLike - a.countLike;
          });
          if (arraySort.length > 5) {
            for (var i = 0; i < arraySort.length; i++) {
              var date1 = new Date(); // current date
              var date2 = new Date(arraySort[i].createdDate);
              if (
                date2.getTime() - date1.getTime() >= -5184000000 &&
                arraySortNew.length < 5
              ) {
                arraySortNew.push(arraySort[i]);
              }
            }
          } else {
            for (var i = 0; i < arraySort.length; i++) {
              arraySortNew.push(arraySort[i]);
            }
          }
          New.find({ title: req.body.content, status: 1 }, (err, data) => {
            if (!err) {
              if (data.length > 0) {
                console.log('listNew---', data);
                for (var i = 0; i < data.length; i++) {
                  const newTemp = new NewTemp();
                  newTemp.idNewTemp = data[i].idNew;
                  newTemp.title = data[i].title;
                  newTemp.content = data[i].content;
                  newTemp.authorId = data[i].authorId;
                  newTemp.authorName = data[i].authorName;
                  newTemp.authorImage = data[i].authorImage;
                  newTemp.image = data[i].image;
                  newTemp.video = data[i].video;
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
                        arraySort.push(newTemp);

                        if (listNewType.length == data.length) {
                          array.sort(function (a, b) {
                            return b.createdDate - a.createdDate;
                          });

                          New.find(
                            { authorId: Number(req.session.userId) },
                            (err, listNew) => {
                              if (!err) {
                                if (listNew.length > 0) {
                                  for (var i = 0; i < listNew.length; i++) {
                                    Like.find(
                                      {
                                        newId: Number(listNew[i].idNew),
                                        isRead: 1,
                                      },
                                      (err, listLikeRead) => {
                                        if (!err) {
                                          if (listLikeRead.length > 0) {
                                            for (
                                              var i = 0;
                                              i < listLikeRead.length;
                                              i++
                                            ) {
                                              if (
                                                listLikeRead[i].userName !=
                                                req.session.username
                                              ) {
                                                listLikeReads.push(
                                                  listLikeRead[i]
                                                );
                                              }
                                            }
                                          }
                                        } else {
                                          res
                                            .status(400)
                                            .json({ error: 'ERROR!!!' });
                                        }
                                      }
                                    ).lean();

                                    Comment.find(
                                      {
                                        newId: Number(listNew[i].idNew),
                                        isRead: 1,
                                      },
                                      (err, listCommentRead) => {
                                        if (!err) {
                                          if (listCommentRead.length > 0) {
                                            for (
                                              var i = 0;
                                              i < listCommentRead.length;
                                              i++
                                            ) {
                                              if (
                                                listCommentRead[i].userName !=
                                                req.session.username
                                              ) {
                                                listCommentReads.push(
                                                  listCommentRead[i]
                                                );
                                              }
                                            }
                                          }
                                        } else {
                                          res.status(400).json({
                                            error: 'ERROR!!!',
                                          });
                                        }
                                      }
                                    ).lean();
                                  }

                                  setTimeout(function () {
                                    listCommentReads.sort(function (a, b) {
                                      return b.createdDate - a.createdDate; // sắp xếp theo lượng like
                                    });
                                    listLikeReads.sort(function (a, b) {
                                      return b.time - a.time; // sắp xếp theo lượng like
                                    });
                                    res.render('home', {
                                      listCommentReads: listCommentReads,
                                      countCommentRead:
                                        listCommentReads.length +
                                        listLikeReads.length,
                                      listLikeReads: listLikeReads,
                                      array: array,
                                      arraySortNew: arraySortNew,
                                      accountId: req.session.accountId,
                                      username: req.session.username,
                                      userId: req.session.userId,
                                      avatar: req.session.avatar,
                                      role: req.session.role,
                                    });
                                  }, 500);
                                } else {
                                  res.render('home', {
                                    listCommentReads: listCommentReads,
                                    countCommentRead:
                                      listCommentReads.length +
                                      listLikeReads.length,
                                    listLikeReads: listLikeReads,
                                    array: array,
                                    arraySortNew: arraySortNew,
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
                            }
                          ).lean();
                        }
                      } else {
                        res.status(400).json({ error: 'ERROR!!!' });
                      }
                    }
                  ).lean();
                }
              } else {
                res.render('home', {
                  listCommentReads: listCommentReads,
                  countCommentRead:
                    listCommentReads.length + listLikeReads.length,
                  listLikeReads: listLikeReads,
                  array: array,
                  arraySortNew: arraySortNew,
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
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      New.find({ status: 1 }, (err, arraySort) => {
        if (!err) {
          arraySort.sort(function (a, b) {
            return b.countLike - a.countLike;
          });
          if (arraySort.length > 5) {
            for (var i = 0; i < arraySort.length; i++) {
              var date1 = new Date(); // current date
              var date2 = new Date(arraySort[i].createdDate);
              if (
                date2.getTime() - date1.getTime() >= -5184000000 &&
                arraySortNew.length < 5
              ) {
                arraySortNew.push(arraySort[i]);
              }
            }
          } else {
            for (var i = 0; i < arraySort.length; i++) {
              arraySortNew.push(arraySort[i]);
            }
          }
          New.find({ title: req.body.content, status: 1 }, (err, data) => {
            if (!err) {
              if (data.length > 0) {
                console.log('listNew---', data);
                for (var i = 0; i < data.length; i++) {
                  const newTemp = new NewTemp();
                  newTemp.idNewTemp = data[i].idNew;
                  newTemp.title = data[i].title;
                  newTemp.content = data[i].content;
                  newTemp.authorId = data[i].authorId;
                  newTemp.authorName = data[i].authorName;
                  newTemp.authorImage = data[i].authorImage;
                  newTemp.image = data[i].image;
                  newTemp.video = data[i].video;
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
                        arraySort.push(newTemp);

                        if (listNewType.length == data.length) {
                          array.sort(function (a, b) {
                            return b.createdDate - a.createdDate;
                          });

                          res.render('home', {
                            listCommentReads: listCommentReads,
                            countCommentRead: 3,
                            // listCommentReads.length + listLikeReads.length,
                            array: array,
                            arraySortNew: arraySortNew,
                          });
                        }
                      } else {
                        res.status(400).json({ error: 'ERROR!!!' });
                      }
                    }
                  ).lean();
                }
              } else {
                res.render('home', {
                  countCommentRead: 3,
                  array: array,
                  isNull: true,
                  arraySortNew: arraySortNew,
                });
              }
            } else {
              res.status(400).json({ error: 'ERROR!!!' });
            }
          }).lean();
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
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
      req.session.back = '/home';
      res.redirect('/login/');
    }
  }

  doimatkhau(req, res) {
    //find ,findOne, update, updateOne, delete, save
    Account.findOne({ id: Number(req.params.accountId) }, function (err, acc) {
      if (!err) {
        // lỗi
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
    var countNewChuaDuyet = 0;
    var countCommentChuaDuyet = 0;
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
                New.find({ status: 0 }, (err, listChuaDuyet) => {
                  if (!err) {
                    countNewChuaDuyet = listChuaDuyet.length;
                    console.log('-------', countNewChuaDuyet);
                  } else {
                    res.status(400).json({ error: 'ERROR!!!' });
                  }
                }).lean();
                Comment.find({ status: 0 }, (err, listCmtChuaDuyet) => {
                  if (!err) {
                    countCommentChuaDuyet = listCmtChuaDuyet.length;
                    console.log(
                      '-------countCommentChuaDuyet',
                      countCommentChuaDuyet
                    );
                  } else {
                    res.status(400).json({ error: 'ERROR!!!' });
                  }
                }).lean();
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
                      newTemp.video = data[i].video;
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
                            if (array.length > 0) {
                              array.sort(function (a, b) {
                                return b.createdDate - a.createdDate;
                              });
                              array.sort(function (a, b) {
                                return a.status - b.status;
                              });
                            }
                            if (listNewType.length == data.length) {
                              res.render('homeadmin', {
                                array: array,
                                accountId: req.session.accountId,
                                username: req.session.username,
                                role: req.session.role,
                                userId: req.session.userId,
                                avatar: req.session.avatar,
                                countNewChuaDuyet: countNewChuaDuyet,
                                countCommentChuaDuyet: countCommentChuaDuyet,
                                countNoti:
                                  countNewChuaDuyet + countCommentChuaDuyet,
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
    var countNewChuaDuyet = 0;
    var countCommentChuaDuyet = 0;
    if (req.session.isAuth) {
      New.find({ status: 0 }, (err, listChuaDuyet) => {
        if (!err) {
          countNewChuaDuyet = listChuaDuyet.length;
          console.log('-------', countNewChuaDuyet);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
      Comment.find({ status: 0 }, (err, listCmtChuaDuyet) => {
        if (!err) {
          countCommentChuaDuyet = listCmtChuaDuyet.length;
          console.log('-------countCommentChuaDuyet', countCommentChuaDuyet);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();

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
            newTemp.video = data[i].video;
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
                if (array.length > 0) {
                  array.sort(function (a, b) {
                    return b.createdDate - a.createdDate;
                  });
                  array.sort(function (a, b) {
                    return a.status - b.status;
                  });
                }
                if (listNewType.length == data.length) {
                  res.render('homeadmin', {
                    array: array,
                    accountId: req.session.accountId,
                    username: req.session.username,
                    userId: req.session.userId,
                    avatar: req.session.avatar,
                    role: req.session.role,
                    countNewChuaDuyet: countNewChuaDuyet,
                    countCommentChuaDuyet: countCommentChuaDuyet,
                    countNoti: countNewChuaDuyet + countCommentChuaDuyet,
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
          console.log('=======err', err);
        });
    } else {
      req.session.back = '/admin/home';
      res.redirect('/admin/login/');
    }
  }

  quanlybinhluan(req, res) {
    const array = [];
    const listNewType = [];
    var countNewChuaDuyet = 0;
    var countCommentChuaDuyet = 0;
    if (req.session.isAuth) {
      New.find({ status: 0 }, (err, listChuaDuyet) => {
        if (!err) {
          countNewChuaDuyet = listChuaDuyet.length;
          console.log('-------', countNewChuaDuyet);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
      Comment.find({ status: 0 }, (err, listCmtChuaDuyet) => {
        if (!err) {
          countCommentChuaDuyet = listCmtChuaDuyet.length;
          console.log('-------countCommentChuaDuyet', countCommentChuaDuyet);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
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
                if (commentTemp.status == 0) {
                  Report.findOne(
                    { commentId: commentTemp.idCommentTemp, status: 1 },
                    (err, report) => {
                      if (!err) {
                        commentTemp.reason = report.reason;
                        array.push(commentTemp);
                      } else {
                        res.status(400).json({ error: 'ERROR!!!' });
                      }
                    }
                  ).lean();
                } else {
                  array.push(commentTemp);
                }
              } else {
                res.status(400).json({ error: 'ERROR!!!' });
              }
            }).lean();
          }
          setTimeout(function () {
            if (array.length > 0) {
              array.sort(function (a, b) {
                return b.createdDate - a.createdDate;
              });
              array.sort(function (a, b) {
                return a.status - b.status;
              });
            }
            res.render('quanlybinhluan', {
              array: array,
              accountId: req.session.accountId,
              username: req.session.username,
              userId: req.session.userId,
              avatar: req.session.avatar,
              role: req.session.role,
              countNewChuaDuyet: countNewChuaDuyet,
              countCommentChuaDuyet: countCommentChuaDuyet,
              countNoti: countNewChuaDuyet + countCommentChuaDuyet,
            });
          }, 500);
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
    var countNewChuaDuyet = 0;
    var countCommentChuaDuyet = 0;
    if (req.session.isAuth) {
      New.find({ status: 0 }, (err, listChuaDuyet) => {
        if (!err) {
          countNewChuaDuyet = listChuaDuyet.length;
          console.log('-------', countNewChuaDuyet);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
      Comment.find({ status: 0 }, (err, listCmtChuaDuyet) => {
        if (!err) {
          countCommentChuaDuyet = listCmtChuaDuyet.length;
          console.log('-------countCommentChuaDuyet', countCommentChuaDuyet);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
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
                              countNewChuaDuyet: countNewChuaDuyet,
                              countCommentChuaDuyet: countCommentChuaDuyet,
                              countNoti:
                                countNewChuaDuyet + countCommentChuaDuyet,
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
    var countNewChuaDuyet = 0;
    var countCommentChuaDuyet = 0;
    if (req.session.isAuth) {
      New.find({ status: 0 }, (err, listChuaDuyet) => {
        if (!err) {
          countNewChuaDuyet = listChuaDuyet.length;
          console.log('-------', countNewChuaDuyet);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
      Comment.find({ status: 0 }, (err, listCmtChuaDuyet) => {
        if (!err) {
          countCommentChuaDuyet = listCmtChuaDuyet.length;
          console.log('-------countCommentChuaDuyet', countCommentChuaDuyet);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
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
                    countNewChuaDuyet: countNewChuaDuyet,
                    countCommentChuaDuyet: countCommentChuaDuyet,
                    countNoti: countNewChuaDuyet + countCommentChuaDuyet,
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

  // [GET] /register
  loadchinhsuachuyenvien(req, res) {
    const data = [];
    var countNewChuaDuyet = 0;
    var countCommentChuaDuyet = 0;
    if (req.session.isAuth) {
      New.find({ status: 0 }, (err, listChuaDuyet) => {
        if (!err) {
          countNewChuaDuyet = listChuaDuyet.length;
          console.log('-------', countNewChuaDuyet);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
      Comment.find({ status: 0 }, (err, listCmtChuaDuyet) => {
        if (!err) {
          countCommentChuaDuyet = listCmtChuaDuyet.length;
          console.log('-------countCommentChuaDuyet', countCommentChuaDuyet);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
      User.findOne({ idUser: Number(req.params.idUser) }, (err, users) => {
        if (!err) {
          const userTempCV = new UserTempCV();
          userTempCV.idUserTempCV = users.idUser;
          userTempCV.name = users.name;
          userTempCV.dateOfBirth = users.dateOfBirth;
          userTempCV.gender = users.gender;
          userTempCV.cccd = users.cccd;
          userTempCV.issuedBy = users.issuedBy;
          userTempCV.dateOfIssue = users.dateOfIssue;
          userTempCV.status = users.status;
          userTempCV.avatar = users.avatar;
          userTempCV.email = users.email;
          userTempCV.createdAt = users.createdAt;
          userTempCV.updatedAt = users.updatedAt;
          Account.findOne({ id: Number(users.idAccount) }, (err, acc) => {
            if (!err) {
              userTempCV.idAccount = acc.id;
              userTempCV.username = acc.username;
              userTempCV.password = acc.password;
              userTempCV.role = acc.role;
              data.push(userTempCV);
              res.render('chinhsuachuyenvien', {
                data: data[0],
                accountId: req.session.accountId,
                username: req.session.username,
                userId: req.session.userId,
                avatar: req.session.avatar,
                role: req.session.role,
                countNewChuaDuyet: countNewChuaDuyet,
                countCommentChuaDuyet: countCommentChuaDuyet,
                countNoti: countNewChuaDuyet + countCommentChuaDuyet,
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
      req.session.back = 'admin/home';
      res.redirect('admin/login/');
    }
  }

  chinhsuachuyenvien(req, res) {
    const array = [];
    const listNewType = [];
    if (req.session.isAuth) {
      req.body.idUser = Number(req.params.idUser);
      console.log('req.body', req.body.dateOfBirth);
      var date1 = new Date(); // current date
      var date2 = new Date(req.body.dateOfBirth); // mm/dd/yyyy format
      var date3 = new Date(req.body.dateOfIssue); // mm/dd/yyyy format

      if (req.body.name.length < 6) {
        req.flash('error', 'Họ và tên quá ngắn!');
        res.redirect(`/admin/chinhsuachuyenvien/${req.body.idUser}`);
      } else if (date2.getTime() - date1.getTime() >= 0) {
        req.flash('error', 'Ngày sinh phải lớn hơn ngày hiện tại!');
        res.redirect(`/admin/chinhsuachuyenvien/${req.body.idUser}`);
      } else if (date3.getTime() - date1.getTime() >= 0) {
        req.flash('error', 'Ngày cấp phải lớn hơn ngày hiện tại!');
        res.redirect(`/admin/chinhsuachuyenvien/${req.body.idUser}`);
      } else if (req.body.cccd.length < 9) {
        req.flash('error', 'CCMND/CCCD phải từ 9 số trở lên!');
        res.redirect(`/admin/chinhsuachuyenvien/${req.body.idUser}`);
      } else {
        User.updateOne({ idUser: Number(req.params.idUser) }, req.body)
          .then(() => {
            req.flash('success', 'Chỉnh sửa thông tin cá nhân thành công!');
            res.redirect(`/admin/chinhsuachuyenvien/${req.body.idUser}`);
          })
          .catch(err => {
            req.flash('error', 'Lỗi! Vui lòng kiểm tra thông tin nhập!');
          });
      }
    } else {
      req.session.back = '/admin/quanlychuyenvien';
      res.redirect('/admin/login/');
    }
  }

  loadthemchuyenvien(req, res) {
    var countNewChuaDuyet = 0;
    var countCommentChuaDuyet = 0;
    if (req.session.isAuth) {
      New.find({ status: 0 }, (err, listChuaDuyet) => {
        if (!err) {
          countNewChuaDuyet = listChuaDuyet.length;
          console.log('-------', countNewChuaDuyet);
          Comment.find({ status: 0 }, (err, listCmtChuaDuyet) => {
            if (!err) {
              countCommentChuaDuyet = listCmtChuaDuyet.length;

              res.render('themchuyenvien', {
                accountId: req.session.accountId,
                username: req.session.username,
                userId: req.session.userId,
                avatar: req.session.avatar,
                role: req.session.role,
                countNewChuaDuyet: countNewChuaDuyet,
                countCommentChuaDuyet: countCommentChuaDuyet,
                countNoti: countNewChuaDuyet + countCommentChuaDuyet,
              }); //có dữ liệu sẽ đưa data vào trang home với data là d/s new tìm đc
            } else {
              res.status(400).json({ error: 'ERROR!!!' });
            }
          }).lean();
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/admin/home';
      res.redirect('/admin/login/');
    }
  }

  themchuyenvien(req, res) {
    const acc = new Account({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
    });
    if (req.session.isAuth) {
      Account.findOne({ username: req.body.username }, (err, isAcc) => {
        if (!err) {
          if (isAcc) {
            req.flash('error', 'Tên đăng nhập đã tồn tại!'); //nếu bắt user ko đúng sẽ trả dòng này
            res.redirect('/admin/themchuyenvien');
          } else {
            var date1 = new Date(); // current date
            var date2 = new Date(req.body.dateOfBirth); // mm/dd/yyyy format
            var date3 = new Date(req.body.dateOfIssue); // mm/dd/yyyy format

            if (req.body.username.length < 6) {
              req.flash('error', 'Tên đăng nhập phải trên 6 ký tự!');
              res.redirect('/admin/themchuyenvien');
            } else if (req.body.cccd.length < 9) {
              req.flash('error', 'CCMND/CCCD phải từ 9 số trở lên!');
              res.redirect('/admin/themchuyenvien');
            } else if (req.body.name.length < 6) {
              req.flash('error', 'Họ và tên quá ngắn!');
              res.redirect('/admin/themchuyenvien');
            } else if (date2.getTime() - date1.getTime() >= 0) {
              req.flash('error', 'Ngày sinh phải lớn hơn ngày hiện tại!');
              res.redirect('/admin/themchuyenvien');
            } else if (date3.getTime() - date1.getTime() >= 0) {
              req.flash('error', 'Ngày cấp phải lớn hơn ngày hiện tại!');
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

  xoatinadmin(req, res) {
    if (req.session.isAuth) {
      New.delete({
        idNew: Number(req.params.idNew),
      })
        .then(() => {
          req.flash('successdeletenew', 'Xoá thành công!');
          res.redirect('/admin/home');
        })
        .catch(err => next(err));
    } else {
      req.session.back = '/admin/home';
      res.redirect('/admin/login/');
    }
  }

  xoacmtadmin(req, res) {
    if (req.session.isAuth) {
      Comment.delete({
        idComment: Number(req.params.idComment),
      })
        .then(() => {
          req.flash('successdeletecomment', 'Xoá thành công!');
          res.redirect('/admin/quanlybinhluan');
        })
        .catch(err => next(err));
    } else {
      req.session.back = '/admin/quanlybinhluan';
      res.redirect('/admin/login/');
    }
  }
}
module.exports = new MainController();
