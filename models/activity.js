var connection = require('./Connection')

class Activity {
  constructor(activities) {
    this.title = activities.title
    this.organizer = activities.organizer
    this.coorganizer = activities.coorganizer
    this.date = activities.date
    this.place = activities.place
    this.content = activities.content
  }

  save(callback) {
    let cmd = "INSERT INTO activities(title, organizer, coorganizer, date, place, content) VALUES(?,?,?,?,?,?);"
    connection.query(cmd, [this.title, this.organizer, this.coorganizer, this.date, this.place, this.content], (err, result) => {
      if (err) {
        callback(err)
      }else {
        callback(null, result)
      }
    })
  }
}

function All(callback) {
  let cmd = "SELECT id, title, DATE_FORMAT(date,'%Y-%m-%d') 'date', organizer, coorganizer, place FROM activities;"

  connection.query(cmd, (err, rows, fields) => {
    if (err) {
      callback(err)
    } else {
      callback(null, rows)
    }
  })
}

function QueryID(id, callback) {
  let cmd = "SELECT id, title, DATE_FORMAT(date,'%Y-%m-%d') 'date', organizer, coorganizer, place, content FROM activities WHERE id = ? LIMIT 1;"

  connection.query(cmd, [id], (err, rows, fields) => {
    if (err) {
      callback(err)
    } else {
      callback(null, rows[0])
    }
  })
}

function UpdateID(editContent ,id, callback) {
  let cmd = "UPDATE activities SET title=?, organizer=?, coorganizer=?, date=?, place=?, content=? WHERE id=?;"
  let {title, organizer, coorganizer, date, place, content} = editContent
  connection.query(cmd, [title, organizer, coorganizer, date, place, content, id], (err, rows) => {
    if (err) {
      callback(err)
    } else {
      callback(null, rows[0])
    }
  })
}

function DeleteID(id, callback) {
  let cmd = "DELETE FROM activities WHERE id = ?;"

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

class Signup {
  constructor(user) {
    // this.act_id = 1
    this.id = user.id
    this.name = user.name
    this.ic = user.ic
    this.phone = user.phone
    this.email = user.email
    this.food = user.food
  }

  save(callback) {
    let cmd = "INSERT INTO signup(act_id, user_id, user_name, user_ic, user_phone, user_mail, food) VALUES((SELECT info FROM pageinfo WHERE name LIKE 'current_act'),?,?,?,?,?,?);"
    connection.query(cmd, [this.id, this.name, this.ic, this.phone, this.email, this.food], (err, result) => {
      if (err) {
        callback(err)
      }else {
        callback(null, result)
      }
    })
  }
}

function AllSignup(id, callback) {
  let cmd = "SELECT id, user_name 'name', user_ic 'ic', user_phone 'phone', user_mail 'email', food FROM signup WHERE act_id = ?;"

  connection.query(cmd, [id], (err, rows, fields) => {
    if (err) {
      callback(err)
    } else {
      callback(null, rows)
    }
  })
}

function SearchUserActivities(id) {
  let cmd = "SELECT signup.id, user_name 'name', user_ic 'ic', user_phone 'phone', user_mail 'email', food, activities.title FROM signup, activities WHERE user_id = ? AND activities.id = signup.act_id ORDER BY 1 DESC;"

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

function CheckDuplicate(id) {
  let cmd = "SELECT id FROM signup WHERE act_id = (SELECT info FROM pageinfo WHERE name = 'current_act') AND user_id = ?"

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

module.exports.Activity = Activity;
module.exports.All = All;
module.exports.QueryID = QueryID;
module.exports.UpdateID = UpdateID;
module.exports.DeleteID = DeleteID;
module.exports.SearchUserActivities = SearchUserActivities;


module.exports.Signup = Signup;
module.exports.AllSignup = AllSignup;
module.exports.CheckDuplicate = CheckDuplicate;
