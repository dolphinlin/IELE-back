var connection = require('./Connection')

const saltRounds = 10;

function QueryPageInfo(name) {
  let cmd = "SELECT * FROM pageinfo WHERE name LIKE ?;"
  return new Promise((resolve, reject) => {
    connection.query(cmd, [name], (err, rows, fields) => {
      if (err) {
        reject(err)
      } else {
        // console.log(rows)
        resolve(rows)
      }
    })
  })
}

function QueryAllInfo() {
  let cmd = "SELECT * FROM pageinfo WHERE name = 'origin' OR name = 'date' OR name = 'topic' OR name = 'notic' OR name = 'banner';"

  return new Promise((resolve, reject) => {
    connection.query(cmd, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function ChangePageInfo(name, payload) {
  let cmd = "UPDATE pageinfo SET info=? WHERE name=?;"

  return new Promise((resolve, reject) => {
    connection.query(cmd, [payload, name], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}


module.exports.QueryPageInfo = QueryPageInfo;
module.exports.ChangePageInfo = ChangePageInfo;
module.exports.QueryAllInfo = QueryAllInfo;
