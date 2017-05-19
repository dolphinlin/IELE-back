var connection = require('./Connection')

class Contribute {
  constructor(contribute) {
    this.act_id = contribute.act_id
    this.user_id = contribute.user_id
    this.path = contribute.path
    this.comment = contribute.comment
  }

  save() {
    let cmd = "INSERT INTO contribute(act_id, user_id, path, comment) VALUES(?,?,?,?);"

    return new Promise((resolve, reject) => {
      connection.query(cmd, [this.act_id, this.user_id, this.path, this.comment], (err, result) => {
        if (err) {
          reject(err)
        }else {
          resolve(result)
        }
      })
    })
  }
}

function QueryContribute(id) {
  let cmd = "SELECT a.*, b.name 'name', b.email 'email' FROM contribute a, users b WHERE a.act_id = ? AND a.comment = 2 AND b.id = a.user_id;"

  return new Promise((resolve, reject) => {
    connection.query(cmd, [id], (err, rows, fields) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function QueryComment(id, comment) {
  // let cmd = "SELECT * FROM contribute WHERE act_id = ? AND comment = ?;"
  let cmd = "SELECT a.*, b.name 'name', b.email 'email' FROM contribute a, users b WHERE a.act_id = ? AND a.comment = ? AND b.id = a.user_id;"

  return new Promise((resolve, reject) => {
    connection.query(cmd, [id, comment], (err, rows, fields) => {
      if (err) {
        reject(err)
      } else {
        console.log(rows)
        resolve(rows)
      }
    })
  })
}

function CheckDuplicateContribute(id, comment) {
  let cmd = "SELECT * FROM contribute WHERE act_id = (SELECT info FROM pageinfo WHERE name = 'current_act') AND user_id = ? AND comment = ?;"

  return new Promise((resolve, reject) => {
    connection.query(cmd, [id, comment], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function UploadDuplicateContribute(id, path) {
  // let cmd = "SELECT * FROM contribute WHERE act_id = (SELECT info FROM pageinfo WHERE name = 'current_act') AND user_id = ? AND comment = ?;"
  let cmd = "UPDATE contribute SET path = ? WHERE id = ? "
  return new Promise((resolve, reject) => {
    connection.query(cmd, [path, id], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function QueryUserContribute(id) {
  // let cmd = "SELECT title, comment.comment FROM contribute, activities, comment WHERE user_id = ? AND activities.id = act_id"
  let cmd = "SELECT con_id, title, GROUP_CONCAT(comment.comment SEPARATOR ', ') 'comment' FROM contribute, activities, comment WHERE user_id = ? AND activities.id = act_id AND con_id = contribute.id GROUP BY con_id;"
  return new Promise((resolve, reject) => {
    connection.query(cmd, [id], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

module.exports.Contribute = Contribute;
module.exports.QueryContribute = QueryContribute;
module.exports.CheckDuplicateContribute = CheckDuplicateContribute;
module.exports.QueryUserContribute = QueryUserContribute;
module.exports.QueryComment = QueryComment;
module.exports.UploadDuplicateContribute = UploadDuplicateContribute;
