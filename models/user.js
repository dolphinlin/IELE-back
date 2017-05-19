var connection = require('./Connection')
var bcrypt = require('bcrypt');

const saltRounds = 10;

class User {
  constructor(user) {
    this.user = user.user
    this.password = user.password
    this.name = user.name
    this.email = user.email
  }

  save(callback) {
    let cmd = "INSERT INTO users(user, password, name, email) VALUES(?,?,?,?);"
    bcrypt.hash(this.password, saltRounds, (err, hashPassword) => {
      // Store hash in your password DB.
      console.log(hashPassword)
      connection.query(cmd, [this.user, hashPassword, this.name, this.email], (err, result) => {
        console.log(result);
        if (err) {
          callback(err)
        }else {
          callback(null, result)
        }
      })
    });
  }
}

function Login(user, pwd, callback) {
  let cmd = "SELECT * FROM users WHERE user = ? LIMIT 1;"

  connection.query(cmd, [user], (err, rows, fields) => {
    if (err) {
      callback(err)
    } else {
      callback(null, rows)
    }
  })
}

function CheckDuplicate(user, callback) {
  let cmd = "SELECT id FROM users WHERE user = ? LIMIT 1;"

  connection.query(cmd, [user], (err, rows, fields) => {
    if (err) {
      callback(err)
    } else {
      callback(null, rows.length)
    }
  })
}

function SearchUser(id) {
  let cmd = "SELECT * FROM users WHERE id = ? LIMIT 1;"

  return new Promise((resolve, reject) => {
    connection.query(cmd, [id], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows[0])
      }
    })
  })
}

module.exports.User = User;
module.exports.Login = Login;
module.exports.CheckDuplicate = CheckDuplicate;
module.exports.SearchUser = SearchUser;
