const newQuanLy = require('./quanly');

function route(app) {
  app.use('/', newQuanLy);
}
module.exports = route;
