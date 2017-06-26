var express = require('express')
var router = express.Router()

var Users = require('../models/user')
var User = Users.User
var Login = Users.Login
var CheckDuplicate = Users.CheckDuplicate

var Activities = require('../models/activity')
var ActQueryID = Activities.QueryID
var Signup = Activities.Signup
var SearchUserActivities = Activities.SearchUserActivities
var ActCheckDuplicate = Activities.CheckDuplicate

var PageInfo = require('../models/page')
var QueryPageInfo = PageInfo.QueryPageInfo
var QueryAllInfo = PageInfo.QueryAllInfo

var Contributes = require('../models/contribute')
var Contribute = Contributes.Contribute
var ConCheckDuplicate = Contributes.CheckDuplicateContribute
var QueryUserContribute = Contributes.QueryUserContribute
var UploadDuplicateContribute = Contributes.UploadDuplicateContribute

var Journals = require('../models/journal')
var QueryPageJournal = Journals.QueryPageJournal
var QueryAllJournal = Journals.QueryAllJournal
var Journal = Journals.Journal
var UpdateJournalWithFile = Journals.UpdateJournalWithFile
var UpdateJournal = Journals.UpdateJournal

var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
var fs = require('fs-extra')
var path = require('path')

const tokenKey = 'keyeeeeyeyeyeyeywe'

let parseToken = (req, res, next) => {
  //process token there
  console.log(req.body.token)
  jwt.verify(req.body.token, tokenKey, (err, decoded) => {
    if (err || decoded.exp < Math.floor(Date.now() / 1000)){
      return next(err || new Error('The token is EXPIRED'))
    } else {
      req.body.userId = decoded.userId
      req.body.userName = decoded.userName
      next()
    }
  })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200)
      .json({
        token: 'qq123'
      })
})

router.post('/user', (req, res, next) => {
  let {user, password, email, name} = req.body
  CheckDuplicate(user, (err, count) => {
    if (err || count >0 ){
      return next(err || new Error('the account duplicate.'))
    } else {
      res.status(200)
      .json({
        data: {
          user,
          password,
          email,
          name
        },
        token: 'abcwecwoiegjeoirjgoitepokthportk'
      })
    }
  })
})

router.get('/newuser', (req, res, next) => {
  res.status(200)
    .json({
      data: 'qq123'
    })
})

router.post('/checkToken', (req, res, next) => {
  jwt.verify(req.body.token, tokenKey, function(err, decoded) {
    if(err) return next(err)

    res.status(200)
      .json({
        data: decoded
      })
  })
})

router.post('/login', (req, res, next) => {
  let {user, password} = req.body
  Login(user, password, (err, rows) => {
    if (err) return next(err)

    if (rows.length === 0){
      res.status(200)
      .json({
        success: false,
        msg: 'Not fount User'
      })
    }else {
      bcrypt.compare(password, rows[0].password, (err, result) => {
          // res == true
          if (result) {
            // the token time base on sec
            let userToken = jwt.sign({
              userId: rows[0].id,
              userName: rows[0].name,
              iss: 'tve-IELE',
              exp: Math.floor(Date.now() / 1000) + 43200, //keep the token 12 hr
              iat: Math.floor(Date.now() / 1000) + 10
            }, tokenKey)
            res.status(200)
            .json({
              success: true,
              token: userToken,
              userId: rows[0].id,
              userName: rows[0].name
            })
          }else{
            res.status(200)
            .json({
              success: false
            })
          }
      });

    }
  })
})

router.post('/newuser', function(req, res, next) {
  let {user, password, email, name} = req.body
  CheckDuplicate(user, (err, count) => {
    if (err){
      return next(err)
    } else if (count !== 0) {
      res.status(200)
        .json({
          success: false,
          code: 1
        })
    } else {
      let newUser = new User({
          user: user,
          password: password,
          name: name,
          email: email
      })
      newUser.save((err, user) => {
        if(err){
          console.log(err)
          return next(err)
        }

        res.status(200)
        .json({
          success: true,
          code: 0
        })
      })
    }
  })
})

router.post('/uploadFile', parseToken, (req, res, next) => {
  ActCheckDuplicate(req.body.id)
    .then((act) => {
      if (act.length !== 0) {
        const fileRNDName = Date.now()
        let id = 0
        let con1, con2, con3
        QueryPageInfo('current_act')
        .then((value) => {
          id = Number(value[0].info)
        })
        if (req.files.uploadFile1) {
          ConCheckDuplicate(req.body.id, 1)
          .then((value) => {
            let fileName1 = req.files.uploadFile1[0].name.split('.')
            if (value.length === 0) {
              console.log('QQWEQWEQWEQWEWQEWQEQWEW');
              req.files.uploadFile1[0].saveFile('public/uploads/' + fileRNDName + '_file1' + '.' + fileName1[fileName1.length - 1], (err, info1) => {
                if (err) return next(err)

                con1 = new Contribute({
                  act_id: id,
                  user_id: req.body.id,
                  path: info1.path,
                  comment: 1
                })
                con1.save()
              })
            } else {
              req.files.uploadFile1[0].saveFile('public/uploads/' + fileRNDName + '_file1' + '.' + fileName1[fileName1.length - 1], (err, info1) => {
                if (err) return next(err)
                fs.remove(path.resolve('./' + value[0].path), err => {
                  if (err) return console.error(err)

                  console.log(path.resolve('./' + value[0].path))
                })
                UploadDuplicateContribute(value[0].id, info1.path)
                console.log(`${value[0].path} -> update file1`)
              })
            }
          })
        }
        if (req.files.uploadFile2) {
          ConCheckDuplicate(req.body.id, 2)
          .then((value) => {
            let fileName2 = req.files.uploadFile2[0].name.split('.')
            if (value.length === 0) {
              req.files.uploadFile2[0].saveFile('public/uploads/' + fileRNDName + '_file2' + '.' + fileName2[fileName2.length - 1], (err, info2) => {
                if (err) return next(err)

                con2 = new Contribute({
                  act_id: id,
                  user_id: req.body.id,
                  path: info2.path,
                  comment: 2
                })
                con2.save()
              })
            } else {
              req.files.uploadFile2[0].saveFile('public/uploads/' + fileRNDName + '_file2' + '.' + fileName2[fileName2.length - 1], (err, info2) => {
                if (err) return next(err)
                fs.remove(path.resolve('./' + value[0].path), err => {
                  if (err) return console.error(err)

                  console.log('success!')
                })
                UploadDuplicateContribute(value[0].id, info2.path)
                console.log(`${value[0].path} -> update file2`)
              })
            }
          })
        }
        if (req.files.uploadFile3) {
          ConCheckDuplicate(req.body.id, 3)
          .then((value) => {
            let fileName3 = req.files.uploadFile3[0].name.split('.')
            if (value.length === 0) {
              req.files.uploadFile3[0].saveFile('public/uploads/' + fileRNDName + '_file3' + '.' + fileName3[fileName3.length - 1], (err, info3) => {
                if (err) return next(err)

                con3 = new Contribute({
                  act_id: id,
                  user_id: req.body.id,
                  path: info3.path,
                  comment: 3
                })
                con3.save()
              })
            } else {
              req.files.uploadFile3[0].saveFile('public/uploads/' + fileRNDName + '_file3' + '.' + fileName3[fileName3.length - 1], (err, info3) => {
                if (err) return next(err)
                fs.remove(path.resolve('./' + value[0].path), err => {
                  if (err) return console.error(err)

                  console.log('success!')
                })
                UploadDuplicateContribute(value[0].id, info3.path)
                console.log(`${value[0].path} -> update file3`)
              })
            }
          })
        }
        res.status(200)
        .json({
          success: true,
          msg: 'OK'
        })
        // .then((value) => {
        //   if (value.length === 0) {
        //     if (req.files.uploadFile1 && req.files.uploadFile2 && req.files.uploadFile3) {
        //       let fileName1 = req.files.uploadFile1[0].name.split('.')
        //       let fileName2 = req.files.uploadFile2[0].name.split('.')
        //       let fileName3 = req.files.uploadFile3[0].name.split('.')
        //       const fileRNDName = Date.now()
        //       req.files.uploadFile1[0].saveFile('public/uploads/' + fileRNDName + '_file1' + '.' + fileName1[fileName1.length - 1], (err, info1) => {
        //         if (err) return next(err)
        //         req.files.uploadFile2[0].saveFile('public/uploads/' + fileRNDName + '_file2' + '.' + fileName2[fileName2.length - 1], (err, info2) => {
        //           if (err) return next(err)
        //           req.files.uploadFile3[0].saveFile('public/uploads/' + fileRNDName + '_file3' + '.' + fileName3[fileName3.length - 1], (err, info3) => {
        //             if (err) return next(err)
        //             QueryPageInfo('current_act')
        //             .then((value) => {
        //               let id = Number(value[0].info)
        //               let con1 = new Contribute({
        //                 act_id: id,
        //                 user_id: req.body.id,
        //                 path: info1.path,
        //                 comment: 1
        //               })
        //               let con2 = new Contribute({
        //                 act_id: id,
        //                 user_id: req.body.id,
        //                 path: info2.path,
        //                 comment: 2
        //               })
        //               let con3 = new Contribute({
        //                 act_id: id,
        //                 user_id: req.body.id,
        //                 path: info3.path,
        //                 comment: 3
        //               })
        //               con1.save().then((result) => {
        //                 con2.save().then((result) => {
        //                   con3.save().then((result) => {
        //                     res.status(200)
        //                     .json({
        //                       success: true,
        //                       msg: 'OK'
        //                     })
        //                   })
        //                 })
        //               })
        //             })
        //           })
        //         })
        //       })
        //     } else {
        //       res.status(400)
        //       .json({
        //         data: 'no select file'
        //       })
        //     }
        //   } else {
        //     res.status(200)
        //     .json({
        //       success: false,
        //       msg: '重複投稿！'
        //     })
        //   }
        // })
      } else {
        res.status(200)
        .json({
          success: false,
          msg: '請先報名！！'
        })
      }
    })
    .catch((err) => {
      console.log(err)
      res.status(200)
        .json({
          success: false,
          msg: '上傳發生錯誤!'
        })
    })
})

router.get('/activities', (req, res, next) => {
  QueryPageInfo('current_act')
    .then((result) => {
      ActQueryID(Number(result[0].info), (err, act) => {
        if (err) {
          res.status(200)
            .json({
              success: false,
              msg: 'query error'
            })
        } else {
          res.status(200)
          .json({
            success: true,
            data: act
          })
        }

      })
    })
})

router.post('/activities/signup', parseToken, (req, res, next) => {
  // let {id, name, ic, phone, email, food} = req.body
  let sign = new Signup(req.body)
  ActCheckDuplicate(req.body.id)
    .then((result) => {
      if (result.length === 0) {
        sign.save((err, result) => {
          console.log(err)
          if (err) {
            console.log(err)
            res.status(200)
            .json({
              success: false,
              msg: err
            })
          } else {
            res.status(200)
            .json({
              success: true,
              msg: 'Signup success!'
            })
          }
        })
      } else {
        res.status(200)
        .json({
          success: false,
          msg: err
        })
      }
    })
    .catch((err) => {
      console.log(err)
      res.status(200)
      .json({
        success: false,
        msg: 'Signup error!'
      })
    })
})

router.post('/me', parseToken, (req, res, next) => {
  if (req.body.userId === req.body.id) {
    SearchUserActivities(req.body.id)
      .then((result) => {
        QueryUserContribute(req.body.id)
          .then((result2) => {
            res.status(200)
            .json({
              success: true,
              data: {
                acts: result,
                cons: result2
              }
            })
          })
      })
  } else {
    res.status(200)
      .json({
        success: false,
        msg: 'ID and Name not correponding'
      })
  }
})

router.get('/info', (req, res, next) => {
  QueryAllInfo()
    .then((result) => {

      res.status(200)
        .json({
          success: true,
          data: {
            origin: result[0].info.replace('\n', '<br />'),
            topic: result[1].info.split('\r\n'),
            date: result[2].info.replace('\n', '<br />'),
            notic: result[3].info.split('\r\n'),
            banner: result[4].info.split('\r\n')
          }
        })
    })
})

router.get('/journal/:page', (req, res, next) => {
  const page = Number(req.params.page)
  if (page < 1) {
    res.status(400)
    .json({
      success: false,
      msg: 'page make some problem.'
    })
  } else {
    QueryPageJournal(page)
    .then((value) => {
      QueryAllJournal()
      .then((value2) => {
        const totalPage = Math.ceil(value2.length / 10)
        res.status(200)
        .json({
          page: {
            total: totalPage,
            current: page,
            next: (totalPage > page + 1) ? page + 1 : totalPage,
            prev: (page - 1 < totalPage) ? page - 1 : totalPage
          },
          journals: value
        })
      })
    })
  }
})

router.post('/journal/upload', parseToken, (req, res, next) => {
  const {title, email} = req.body
  const file = req.files.uploadFile[0]
  const fileRNDName = Date.now()
  let fileName = file.name.split('.')
  if (title && file) {
    file.saveFile('public/journals/journal' + fileRNDName + '.' + fileName[fileName.length - 1], (err, info) => {
      if (err) return next(err)

      let journal = new Journal({
        title: title,
        path: info.path,
        email: email
      })
      journal.save()
        .then((result) => {
          res.status(200)
            .json({
              success: true,
              msg: 'Upload success.'
            })
        })

    })
  } else {
    res.status(200)
      .json({
        success: false,
        msg: 'Upload fails.'
      })
  }
})

router.post('/testToken', parseToken, (req, res, next) => {
  res.status(200)
    .json({
      userId: req.body.userId,
      userName: req.body.userName,
      code: 'ok'
    })
})

module.exports = router;
