var express = require('express')
var router = express.Router()

var Activities = require('../models/activity')
var Activity = Activities.Activity
var AllActivities = Activities.All
var ActQueryID = Activities.QueryID
var ActUpdateID = Activities.UpdateID
var ActDeleteID = Activities.DeleteID

var AllSignup = Activities.AllSignup

var PageInfo = require('../models/page')
var QueryPageInfo = PageInfo.QueryPageInfo
var QueryAllInfo = PageInfo.QueryAllInfo
var ChangePageInfo = PageInfo.ChangePageInfo

var Admins = require('../models/admin')
var AdminLogin = Admins.Login

var Contributes = require('../models/contribute')
var QueryContribute = Contributes.QueryContribute
var Contribute = Contributes.Contribute
var QueryComment = Contributes.QueryComment

var Comments = require('../models/comment')
var Comment = Comments.Comment
var CheckComment = Comments.CheckComment
var UpdateComment = Comments.UpdateComment
var SumComments = Comments.SumComments

var Journals = require('../models/journal')
var Journal = Journals.Journal
var QueryJournalById = Journals.QueryJournalById
var QueryAllJournal = Journals.QueryAllJournal
var UpdateJournalWithFile = Journals.UpdateJournalWithFile
var UpdateJournal = Journals.UpdateJournal

var Users = require('../models/user')
var SearchUser = Users.SearchUser

const fs = require('fs-extra')

function checkAdminType(req, res, next) {
  if (req.session.type === 1) {
    next()
  } else {
    res.redirect('/admin')
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  QueryPageInfo('current_act')
    .then((infos) => {
      AllSignup(Number(infos[0].info), (err, signs) => {
        if (err) return next(err)

        QueryContribute(Number(infos[0].info))
          .then((result2) => {
            res.render('admin/index', {
              header: '後台管理',
              signups: signs.length,
              cons: result2.length
            })
          })
      })
    })
});

router.get('/logout', (req, res, next) => {
  req.session.logined = false

  res.redirect('/')
})

router.get('/activities', checkAdminType, (req, res, next) => {
  AllActivities((err, acts) => {
    if (err) return next(err)
    QueryPageInfo('current_act')
      .then((infos) => {
        let current_act = acts.filter((item) => {return item.id === Number(infos[0].info)})
        res.render('admin/activities/index', {
          header: '活動列表',
          activities: acts,
          info: {
            act: current_act[0]
          }
        })
      })
  })
})

router.get('/activities/add', checkAdminType, (req, res, next) => {
  res.render('admin/activities/add', {
    header: '新增活動'
  })
})

router.post('/activities/add', checkAdminType, (req, res, next) => {
  let {title, organizer, coorganizer, date, place, content} = req.body
  content = content.replace(new RegExp('\r?\n','g'), '<br />')
  let act = new Activity({title, organizer, coorganizer, date, place, content})
  act.save((err, result) => {
    if (err) return next(err)
    res.redirect('/admin/activities')
  })
})

router.get('/activities/:id/show', checkAdminType, (req, res, next) => {
  let id = req.params.id

  ActQueryID(id, function (err, acts) {
    if (err) return next(err)

    AllSignup(id, (err, signs) => {
      if (err) return next(err)
      res.render('admin/activities/show', {
        header: '查看活動',
        activity: acts,
        signups: signs
      })
    })
  })

})

router.get('/activities/:id/edit', checkAdminType, (req, res, next) => {
  let id = req.params.id

  ActQueryID(id, (err, result) => {
    res.render('admin/activities/edit', {
      header: '編輯活動',
      activity: result
    })
  })
})

router.post('/activities/:id/update', checkAdminType, (req, res, next) => {
  let id = req.params.id
  req.body.content = req.body.content.replace(new RegExp('\r?\n','g'), '<br />')
  ActUpdateID(req.body, id, (err, result) => {
    if (err) return next(err)

    res.redirect('/admin/activities')
  })
})

router.get('/activities/:id/destroy', checkAdminType, (req, res, next) => {
  let id = req.params.id

  ActDeleteID(id)
    .then((result) => {
      res.redirect('/admin/activities')
    })
    .catch((err) => {
      console.log(err)
      res.redirect('/admin/activities')
    })
})

router.get('/activities/:id/default', checkAdminType, (req, res, next) => {
  let id = req.params.id

  ChangePageInfo('current_act', id + '')
    .then((result) => {
      res.redirect('/admin/activities')
    })
    .catch((err) => {
      console.log(err)
      res.redirect('/admin/activities')
    })
})

router.get('/contribute', (req, res, next) => {
  QueryPageInfo('current_act')
    .then((result) => {
      let id = result[0].info
      QueryContribute(id)
        .then((value1) => {
          QueryComment(id, 1)
            .then((value2) => {
              QueryComment(id, 3)
                .then((value3) => {
                  // console.log(value1);
                  res.render('admin/contribute/index', {
                    header: '投稿列表',
                    contributes: value1,
                    summary: value2,
                    briefing: value3,
                    admin: req.session.type === 1
                  })
                })
            })
        })
        .catch((err) => {
          res.send(err)
        })
    })
})

router.get('/contribute/:id/comment/:type', (req, res, next) => {
  if (+req.params.type === 0 || +req.params.type === 1) {
    CheckComment(req.params.id, req.params.type)
    .then((value) => {
      if (value.length === 0) {
        res.render('admin/contribute/comment', {
          header: '審查投稿',
          number: req.params.id,
          type: (req.params.type === 0)? 'A' : 'B'
        })
      } else {
        let result = ''
        switch (value[0].result) {
          case 1:
            result = '接受(口頭發表)'
            break;
          case 2:
            result = '接受(海報發表)'
            break;
          default:
            result = '不接受'
        }
        res.render('admin/contribute/show', {
          header: '審查投稿',
          comment: value[0],
          number: req.params.id,
          typenum: req.params.type,
          result: result,
          type: (req.params.type == 0)? 'A' : 'B'
        })
      }
    })
    .catch((err) => {
      res.send(err)
    })
  } else if (+req.params.type === 3) {
    SumComments(req.params.id)
    .then((value) => {
      if (value.length === 2) {
        function procResult(result) {
          switch (value[0].result) {
            case 1:
              return '接受(口頭發表)'
              break;
            case 2:
              return '接受(海報發表)'
              break;
            default:
              return '不接受'
          }
        }
        res.render('admin/contribute/comments', {
          header: '<a href="/admin/contribute"><i class="fa fa-arrow-left" aria-hidden="true"></i></a> 總評比',
          sumvalue: value[0].v1 + value[0].v2 + value[0].v3 + value[0].v4 + value[1].v1 + value[1].v2 + value[1].v3 + value[1].v4,
          avgvalue: (value[0].v1 + value[0].v2 + value[0].v3 + value[0].v4 + value[1].v1 + value[1].v2 + value[1].v3 + value[1].v4) / 2,
          result: [procResult(value[0].result), procResult(value[1].result)],
          comments: [value[0].comment, value[1].comment]
        })
      } else {
        res.redirect('/admin/contribute')
      }
    })
    .catch((err) => {
      res.send(err)
    })
  } else {
    res.redirect('/admin/contribute')
  }
})

router.post('/contribute/:id/comment/:type', (req, res, next) => {
  if (req.params.type !== 0 || req.params.type !== 1) {
    let {c1, c2, c3, c4, result, comment} = req.body
    let co = new Comment({
      v1: c1,
      v2: c2,
      v3: c3,
      v4: c4,
      result: result,
      comment: comment,
      id: req.params.id,
      type: req.params.type
    })
    co.save().then((value) => {
      res.redirect('/admin/contribute')
    }).catch((err) => {
      res.redirect('/admin/contribute')
    })
  } else {
    res.redirect('/admin/contribute')
  }
})

router.get('/contribute/:id/comment/:type/edit', (req, res, next) => {
  CheckComment(req.params.id, req.params.type)
    .then((value) => {
      let result = ''
      switch (value[0].result) {
        case 1:
          result = '接受(口頭發表)'
          break;
        case 2:
          result = '接受(海報發表)'
          break;
        default:
          result = '不接受'
      }
      res.render('admin/contribute/edit', {
        header: '編輯審查',
        comment: value[0],
        number: req.params.id,
        result: result,
        type: (req.params.type == 0)? 'A' : 'B'
      })
    })
})

router.post('/contribute/:id/comment/:type/edit', (req, res, next) => {
  UpdateComment(req.params.id, req.params.type, req.body)
    .then((value) => {
      res.redirect('/admin/contribute')
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

router.get('/journal'/** , checkAdminType **/, (req, res, next) => {
  QueryAllJournal()
    .then((result) => {
      res.render('admin/journal/index', {
        header: '期刊列表',
        journals: result
      })
    })
})

router.get('/journal/add', (req, res, next) => {
  res.render('admin/journal/add', {
    header: '新增期刊'
  })
})

router.post('/journal/add', (req, res, next) => {
  const {title} = req.body
  const file = req.files.uploadFile[0]
  const fileRNDName = Date.now()
  let fileName = file.name.split('.')
  if (title && file) {
    file.saveFile('public/journals/journal' + fileRNDName + '.' + fileName[fileName.length - 1], (err, info) => {
      if (err) return next(err)

      let journal = new Journal({
        title: title,
        path: info.path
      })
      journal.save()
        .then((result) => {
          res.redirect('/admin/journal')
        })

    })
  } else {
    res.redirect('/admin/journal/add')
  }
})

router.get('/journal/:id/edit', (req, res, next) => {
  const {id} = req.params
  QueryJournalById(id)
    .then((value) => {
      res.render('admin/journal/edit', {
        header: '編輯期刊',
        journal: value[0]
      })
    })
})

router.get('/journal/:id/delete', checkAdminType, (req, res, next) => {
  console.log('test')
  res.send('test')
})

router.post('/journal/:id/update', (req, res, next) => {
  const {title} = req.body
  const email = 'Admin'
  const {id} = req.params
  if (req.files.uploadFile.length === 0) {
    UpdateJournal(id, title)
      .then((value) => {
        console.log(`journal ${id} -> update success!`)
        res.redirect('/admin/journal')
      })
  } else {
    const file = req.files.uploadFile[0]

    const fileRNDName = Date.now()
    let fileName = file.name.split('.')
    if (title && file) {
      file.saveFile('public/journals/journal' + fileRNDName + '.' + fileName[fileName.length - 1], (err, info) => {
        if (err) return next(err)

        QueryJournalById(id)
          .then((journalBefore) => {
            fs.remove(journalBefore[0].path, err => {
              if (err) return next(err)
              console.log('success!')

              UpdateJournalWithFile(id, {
                title: title,
                path: info.path,
                email: email
              })
              .then((value) => {
                res.redirect('/admin/journal')
              })
            })
          })

      })
    } else {
      res.redirect('/admin/journal')
    }

  }

})

router.get('/controller', checkAdminType, (req, res, next) => {
  QueryAllInfo()
    .then((result) => {
      res.render('admin/info', {
        origin: result[0].info,
        topic: result[1].info,
        date: result[2].info,
        notic: result[3].info,
        banner: result[4].info
      })
    })
})

router.post('/controller', checkAdminType, (req, res, next) => {
  let {origin, topic, date, notic, banner} = req.body
  ChangePageInfo('origin', origin)
    .then((r1) => {
      ChangePageInfo('topic', topic)
        .then((r2) => {
          ChangePageInfo('date', date)
            .then((r3) => {
              ChangePageInfo('notic', notic)
                .then((r4) => {
                  ChangePageInfo('banner', banner)
                    .then((r5) => {
                      res.redirect('/admin/controller')
                    })
                })
            })
        })
    })
})

module.exports = router
