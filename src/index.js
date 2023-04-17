const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const route = require('./routers');
var session = require('express-session');
var flash = require('express-flash');
const db = require('./config/db');
const {
  allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');

const path = require('path');

db.connect();
const app = express();
const port = 3000;

// HTTP logger
app.use(morgan('combined'));

// cấu hình file tỉnh ( từ các file trong public)
app.use(express.static(path.join(__dirname, 'public')));

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Template engine
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    helpers: {
      sum: (a, b) => a + b,
      changeNgay: datee => new Intl.DateTimeFormat('en-AU').format(datee),
      // noidung: thongtinMH =>
      //   mahoa.AES.encrypt(String(thongtinMH), 'diep123').toString(),
      ifCond: (v1, operator, v2, options) => {
        switch (operator) {
          case '==':
            return v1 == v2 ? options.fn(this) : options.inverse(this);
          case '===':
            return v1 === v2 ? options.fn(this) : options.inverse(this);
          case '!=':
            return v1 != v2 ? options.fn(this) : options.inverse(this);
          case '!==':
            return v1 !== v2 ? options.fn(this) : options.inverse(this);
          case '<':
            return v1 < v2 ? options.fn(this) : options.inverse(this);
          case '<=':
            return v1 <= v2 ? options.fn(this) : options.inverse(this);
          case '>':
            return v1 > v2 ? options.fn(this) : options.inverse(this);
          case '>=':
            return v1 >= v2 ? options.fn(this) : options.inverse(this);
          case '&&':
            return v1 && v2 ? options.fn(this) : options.inverse(this);
          case '||':
            return v1 || v2 ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      },
      handlebars: allowInsecurePrototypeAccess(Handlebars),
    },
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

app.use(
  session({
    secret: '123456cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1800000 },
  })
);

// config upload image
const multer = require('multer');
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const { v4: uuid } = require('uuid');
const { error } = require('console');
const User = require('../src/app/model/User');

const awsConfig = {
  accessKeyId: 'AKIA5HNAI5CXIHX5736U',
  secretAccessKey: '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',
  region: 'ap-southeast-1',
};

const s3 = new AWS.S3(awsConfig);

const storage = multer.memoryStorage({
  destination(req, file, callback) {
    callback(null, '');
  },
});

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif/;

  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const minetype = fileTypes.test(file.mimetype);
  if (extname && minetype) {
    return cb(null, true);
  }

  return cb('Error: Image Only!');
}

const upload = multer({
  storage,
  limits: { fieldSize: 2000000 },
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

const CLOUND_FONT_URL = 'https://babycaredoan.s3.ap-southeast-1.amazonaws.com/';

app.post('/images', upload.single('image'), async (req, res) => {
  const { idUser } = req.body;
  const file = req.file;
  console.log('=========file', file);
  console.log('=========idUser', idUser);

  const image = file.originalname.split('.');
  const fileType = image[image.length - 1];
  const filePath = `${uuid() + Date.now().toString()}.${fileType}`;

  const params = {
    Bucket: 'babycaredoan',
    Key: filePath,
    Body: file.buffer,
  };

  s3.upload(params, (error, data) => {
    if (error) {
      return res.send('Internal Server Error');
    } else {
      User.updateOne(
        { idUser: Number(idUser) },
        { avatar: `${CLOUND_FONT_URL}${filePath}` }
      )
        .then(() => {
          req.session.avatar = `${CLOUND_FONT_URL}${filePath}`;
          res.redirect('/thongtincanhan');
        })
        .catch(err => {
          console.log('=========err', err);
        });
    }
  });
});

// const data = require('./database/db.config');

global.__basedir = __dirname;
// force: true will drop the table if it already exists
// data.sequelize.sync({ force: false }).then(() => {
// console.log("Drop and Resync with { force: false }");
// });
// =====

app.use(flash());

route(app);

app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}/login`);
});
