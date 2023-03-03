const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const route = require('./routers');
var session = require('express-session');
var flash = require('express-flash');
const db = require('./config/db');

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
      // ngay: datee => new Intl.DateTimeFormat('en-AU').format(datee),
      // noidung: thongtinMH =>
      //   mahoa.AES.encrypt(String(thongtinMH), 'diep123').toString(),
    },
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
