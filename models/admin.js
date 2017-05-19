var connection = require('./Connection')
var bcrypt = require('bcrypt');

function Login(user, pwd, callback) {
  let cmd = "SELECT * FROM admin WHERE user = ? LIMIT 1;"
  return new Promise((resolve, reject) => {
    connection.query(cmd, [user], (err, rows, fields) => {
      if (err || rows.length === 0) {
        reject(err || new Error('not found admin'))
      } else {
        bcrypt.compare(pwd, rows[0].password).then((res) => {
            if (res) {
              resolve(rows)
            } else {
              reject(rows)
            }
        });
      }
    })
  })
}

module.exports.Login = Login;
