var connection = require('./Connection')

class Journal {
  constructor(journal) {
    this.title = journal.title
    this.path = journal.path
    this.email = journal.email
  }

  save() {
    let cmd = "INSERT INTO journal(title, path, email) VALUES(?,?,?);"

    return new Promise((resolve, reject) => {
      connection.query(cmd, [this.title, this.path, this.email], (err, result) => {
        if (err) {
          reject(err)
        }else {
          resolve(result)
        }
      })
    })
  }
}

function QueryAllJournal() {
  let cmd = "SELECT * FROM journal;"

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

function QueryJournalById(id) {
  let cmd = "SELECT * FROM journal WHERE id = ? LIMIT 1;"

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

function UpdateJournal(id, title) {
  let cmd = "UPDATE journal SET title = ? WHERE id = ?;"

  return new Promise((resolve, reject) => {
    connection.query(cmd, [title, id], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function UpdateJournalWithFile(id, journal) {
  let cmd = "UPDATE journal SET title = ?, path = ? WHERE id = ?;"

  const {title, path} = journal
  return new Promise((resolve, reject) => {
    connection.query(cmd, [title, path, id], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}


function QueryPageJournal(page) {
  const offset = 10 * (page - 1)
  let cmd = "SELECT * FROM journal ORDER BY id DESC LIMIT 10 OFFSET ?;"

  return new Promise((resolve, reject) => {
    connection.query(cmd, [offset], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}


module.exports.Journal = Journal;
module.exports.QueryAllJournal = QueryAllJournal;
module.exports.QueryPageJournal = QueryPageJournal;
module.exports.QueryJournalById = QueryJournalById;
module.exports.UpdateJournal = UpdateJournal;
module.exports.UpdateJournalWithFile = UpdateJournalWithFile;
