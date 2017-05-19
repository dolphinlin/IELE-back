var connection = require('./Connection')

class Comment {
  constructor(comment) {
    this.v1 = comment.v1
    this.v2 = comment.v2
    this.v3 = comment.v3
    this.v4 = comment.v4
    this.result = comment.result
    this.comment = comment.comment
    this.con_id = comment.id
    this.type = comment.type
  }

  save() {
    let cmd = "INSERT INTO comment(v1, v2, v3, v4, result, comment, con_id, type) VALUES(?,?,?,?,?,?,?,?);"

    return new Promise((resolve, reject) => {
      connection.query(cmd, [this.v1, this.v2, this.v3, this.v4, this.result, this.comment, this.con_id, this.type], (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
}

function CheckComment(id, type) {
  let cmd = "SELECT * FROM comment WHERE con_id = ? AND type = ?"

  return new Promise((resolve, reject) => {
    connection.query(cmd, [id, type], (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

function SumComments(id) {
  let cmd = "SELECT * FROM comment WHERE con_id = ?"

  return new Promise((resolve, reject) => {
    connection.query(cmd, [id], (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}


function UpdateComment(id, type, com) {
  let cmd = "UPDATE comment SET v1 =?, v2 =?, v3 =?, v4 =?, result =?, comment =? WHERE con_id = ? AND type = ?"
  let {c1, c2, c3, c4, result, comment} = com
  return new Promise((resolve, reject) => {
    connection.query(cmd, [c1, c2, c3, c4, result, comment, id, type], (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}


module.exports.Comment = Comment
module.exports.CheckComment = CheckComment
module.exports.UpdateComment = UpdateComment
module.exports.SumComments = SumComments
