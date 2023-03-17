const QuanLy = require('../model/QuanLy');
const ChuyenKhoa = require('../model/ChuyenKhoa');
const BacSi = require('../model/BacSi');
const DanhSachLichKham = require('../model/DanhSachLichKham');
const BenhNhan = require('../model/BenhNhan');

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

  // [GET] /login
  login(req, res) {
    QuanLy.findOne(
      // { tendangnhap: req.body.tendangnhap, matkhau: req.body.matkhau },
      { tendangnhap: req.body.tendangnhap },

      function (err, user) {
        if (!err) {
          if (user == null) {
            req.flash('error', 'Tên đăng nhập không đúng!');
            res.redirect('/login/');
          } else {
            if (bcrypt.compareSync(req.body.matkhau, user.matkhau)) {
              var sess = req.session; //initialize session variable
              sess.isAuth = true;
              sess.hoten = user.hoten;
              sess.tendangnhap = user.tendangnhap;
              sess.sodienthoai = user.sodienthoai;
              if (sess.back) {
                res.redirect(sess.back);
              } else {
                res.render('home', { hoten: req.session.hoten });
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

  // [POST] /themquanly
  themquanly(req, res, next) {
    const body = { ...req.body };
    const quanly = new QuanLy(req.body);
    quanly
      .save()
      .then(() => res.json(quanly))
      .catch(error => {});
  }

  // [GET] /quanlybacsi
  quanlybacsi(req, res) {
    if (req.session.isAuth) {
      BacSi.find((err, data) => {
        if (!err) {
          res.render('quanlybacsi', { data: data, hoten: req.session.hoten });
          console.log(data);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/quanlybacsi';
      res.redirect('/login/');
    }
  }

  // [GET] /quanlybacsi
  thembacsi(req, res) {
    const bacsi = new BacSi(req.body);
    console.log('bacsi====them', bacsi);
    if (req.session.isAuth) {
      bacsi
        .save()
        .then(() => res.redirect('/quanlybacsi'))
        .catch(error => {});
    } else {
      req.session.back = '/quanlybacsi';
      res.redirect('/login/');
    }
  }

  // [DELETE] /cources/:id
  xoabacsi(req, res, next) {
    if (req.session.isAuth) {
      BacSi.delete({ mabacsi: Number(req.params.mabacsi) })
        .then(() => {
          res.redirect('/quanlybacsi');
        })
        .catch(err => next(err));
    } else {
      req.session.back = '/quanlybacsi';
      res.redirect('/login/');
    }
  }

  // [GET] /cources/:id/edit
  loadchinhsuabacsi(req, res, next) {
    if (req.session.isAuth) {
      BacSi.findOne({ mabacsi: Number(req.params.mabacsi) }, (err, data) => {
        if (!err) {
          res.render('chinhsuacbacsi', {
            bacsi: data,
            hoten: req.session.hoten,
          });
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/quanlybacsi';
      res.redirect('/login/');
    }
  }

  // [PUT] /cources/:id
  chinhsuabacsi(req, res, next) {
    console.log('req.body', req.body);
    BacSi.updateOne({ mabacsi: Number(req.params.mabacsi) }, req.body)
      .then(() => {
        res.redirect('/quanlybacsi');
      })
      .catch(err => next(err));
  }

  // [PUT] /cources/:id
  xemchitietbacsi(req, res, next) {
    if (req.session.isAuth) {
      BacSi.findOne({ mabacsi: Number(req.params.mabacsi) }, (err, data) => {
        if (!err) {
          res.render('chitietbacsi', {
            data: data,
            hoten: req.session.hoten,
          });
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/quanlybacsi';
      res.redirect('/login/');
    }
  }

  // hien thi thong tin khoa
  loadchuyenkhoa(req, res) {
    ChuyenKhoa.find((err, data) => {
      if (!err) {
        res.send(data);
      } else {
        res.status(400).json({ error: 'ERROR!!!' });
      }
    });
  }

  // [GET] /quanlychuyenkhoa
  quanlychuyenkhoa(req, res) {
    if (req.session.isAuth) {
      ChuyenKhoa.find((err, data) => {
        if (!err) {
          res.render('quanlychuyenkhoa', {
            data: data,
            hoten: req.session.hoten,
          });
          console.log(data);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/quanlychuyenkhoa';
      res.redirect('/login/');
    }
  }
  themchuyenkhoa(req, res) {
    const chuyenKhoa = new ChuyenKhoa(req.body);
    if (req.session.isAuth) {
      chuyenKhoa
        .save()
        .then(() => res.redirect('/quanlychuyenkhoa'))
        .catch(error => {});
    } else {
      req.session.back = '/quanlychuyenkhoa';
      res.redirect('/login/');
    }
  }

  // [DELETE] /cources/:id
  xoachuyenkhoa(req, res, next) {
    if (req.session.isAuth) {
      ChuyenKhoa.delete({ machuyenkhoa: req.params.machuyenkhoa })
        .then(() => {
          res.redirect('/quanlychuyenkhoa');
        })
        .catch(err => next(err));
    } else {
      req.session.back = '/dangkylichranh';
      res.redirect('/login/');
    }
  }

  // [GET] /cources/:id/edit
  loadchinhsuachuyenkhoa(req, res, next) {
    if (req.session.isAuth) {
      ChuyenKhoa.findOne(
        { machuyenkhoa: req.params.machuyenkhoa },
        (err, data) => {
          if (!err) {
            res.render('chinhsuachuyenkhoa', {
              chuyenkhoa: data,
              hoten: req.session.hoten,
            });
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    } else {
      req.session.back = '/quanlychuyenkhoa';
      res.redirect('/login/');
    }
  }

  // [PUT] /cources/:id
  chinhsuachuyenkhoa(req, res, next) {
    console.log('req.body', req.body);
    ChuyenKhoa.updateOne({ machuyenkhoa: req.params.machuyenkhoa }, req.body)
      .then(() => {
        res.redirect('/quanlychuyenkhoa');
      })
      .catch(err => next(err));
  }

  // [GET] /thongke
  thongke(req, res) {
    if (req.session.isAuth) {
      BacSi.find((err, data) => {
        if (!err) {
          res.render('thongke', { data: data, hoten: req.session.hoten });
          console.log(data);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/thongke';
      res.redirect('/login/');
    }
  }

  // [GET] /dangkylichranh:mabasi
  dangkylichranh(req, res) {
    if (req.session.isAuth) {
      BacSi.findOne({ mabacsi: req.params.mabacsi }, (err, data) => {
        if (!err) {
          DanhSachLichKham.find(
            { mabacsi: req.params.mabacsi },
            (err, lichs) => {
              if (!err) {
                res.render('dangkylichranh', {
                  data: data,
                  hoten: req.session.hoten,
                  lichs: lichs,
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
      req.session.back = '/dangkylichranh';
      res.redirect('/login/');
    }
  }

  themlichkham(req, res, next) {
    const mabacsi = req.body.mabacsi;
    console.log(req.body);
    const lichkham = new DanhSachLichKham(req.body);
    lichkham
      .save()
      .then(() => res.redirect(`/dangkylichranh/${mabacsi}`))
      .catch(error => {});
  }

  uploadFile(req, res) {
    if (req.session.isAuth) {
      try {
        let filePath = __basedir + '/uploads/' + req.file.filename;

        console.log('filePath', filePath);

        readXlsxFile(filePath).then(rows => {
          // `rows` is an array of rows
          // each row being an array of cells.
          console.log(rows);

          // Remove Header ROW
          rows.shift();

          const bacsis = [];

          let length = rows.length;

          for (let i = 0; i < length; i++) {
            let bacsi = {
              hoten: rows[i][0],
              hochamhocvi: rows[i][1],
              gioitinh: rows[i][2],
              ngaysinh: rows[i][3],
              email: rows[i][4],
              sodienthoai: rows[i][5],
              chuyenkhoa: rows[i][6],
              chucvu: rows[i][7],
              kinhnghiem: rows[i][8],
              trangthaikham: rows[i][9],
              dongia: rows[i][10],
              diachiphongkham: rows[i][11],
              gioithieu: rows[i][12],
            };

            bacsis.push(bacsi);
          }

          BacSi.bulkCreate(bacsis).then(() => {
            const result = {
              status: 'ok',
              filename: req.file.originalname,
              message: 'Thêm thành công sinh viên từ file excel: ',
            };

            res.json(result);
          });
        });
      } catch (error) {
        const result = {
          status: 'fail',
          filename: req.file.originalname,
          message: 'Upload Error! message = ' + error.message,
        };
        res.json(result);
      }
    } else {
      req.session.back = '/quanlybacsi';
      res.redirect('/login/');
    }
  }

  // [GET] /quanlybacsi
  quanlybenhnhan(req, res) {
    if (req.session.isAuth) {
      BenhNhan.find((err, data) => {
        if (!err) {
          res.render('quanlybenhnhan', {
            data: data,
            hoten: req.session.hoten,
          });
          console.log(data);
        } else {
          res.status(400).json({ error: 'ERROR!!!' });
        }
      }).lean();
    } else {
      req.session.back = '/quanlybenhnhan';
      res.redirect('/login/');
    }
  }

  // [PUT] /cources/:id
  xemchitietbenhnhan(req, res, next) {
    if (req.session.isAuth) {
      BenhNhan.findOne(
        { mabenhnhan: Number(req.params.mabenhnhan) },
        (err, data) => {
          if (!err) {
            res.render('chitietbenhnhan', {
              data: data,
              hoten: req.session.hoten,
            });
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    } else {
      req.session.back = '/quanlybenhnhan';
      res.redirect('/login/');
    }
  }

  // [GET] /quanlybacsi
  thembenhnhan(req, res) {
    const benhnhan = new BenhNhan(req.body);
    if (req.session.isAuth) {
      benhnhan
        .save()
        .then(() => res.redirect('/quanlybenhnhan'))
        .catch(error => {});
    } else {
      req.session.back = '/quanlybenhnhan';
      res.redirect('/login/');
    }
  }

  // [DELETE] /cources/:id
  xoabenhnhan(req, res, next) {
    if (req.session.isAuth) {
      BenhNhan.delete({ mabenhnhan: Number(req.params.mabenhnhan) })
        .then(() => {
          res.redirect('/quanlybenhnhan');
        })
        .catch(err => next(err));
    } else {
      req.session.back = '/quanlybenhnhan';
      res.redirect('/login/');
    }
  }

  // [GET] /cources/:id/edit
  loadchinhsuabenhnhan(req, res, next) {
    if (req.session.isAuth) {
      BenhNhan.findOne(
        { mabenhnhan: Number(req.params.mabenhnhan) },
        (err, data) => {
          if (!err) {
            res.render('chinhsuacbenhnhan', {
              bacsi: data,
              hoten: req.session.hoten,
            });
          } else {
            res.status(400).json({ error: 'ERROR!!!' });
          }
        }
      ).lean();
    } else {
      req.session.back = '/quanlybenhnhan';
      res.redirect('/login/');
    }
  }

  // [PUT] /cources/:id
  chinhsuabenhnhan(req, res, next) {
    console.log('req.body', req.body);
    BenhNhan.updateOne({ mabenhnhan: Number(req.params.mabenhnhan) }, req.body)
      .then(() => {
        res.redirect('/quanlybenhnhan');
      })
      .catch(err => next(err));
  }
}
module.exports = new MainController();
