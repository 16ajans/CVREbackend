import express from 'express'
import { Player } from '../../drivers/db.js'
import { searchGuildMember } from '../../drivers/bot.js'
import { captainAuth, adminAuth } from '../auth.js'
import multer from 'multer'
import { mkdir } from 'node:fs/promises'

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await mkdir(`verifications/${req.session.user._id}/`, { recursive: true })
    cb(null, `verifications/${req.session.user._id}/`)
  },
  filename: function (req, file, cb) {
    cb(null, `${req.body._id}.${file.mimetype.split('/')[1]}`)
  }
})
function fileFilter (req, file, cb) {
  if (
    (file.mimetype.startsWith('image') ||
      file.mimetype === 'application/pdf') &&
    req.get('content-length') <= 9000000
  ) {
    cb(null, true)
  } else cb(null, false)
}
const limits = { fileSize: '9000000' } // 9mb ish

export const router = express.Router()
const upload = multer({ storage, fileFilter, limits })

router
  .route('/')
  .get((req, res) => {
    const query = {}
    if (!req.session.user.roles.includes(process.env.ADMIN_ROLE_ID)) {
      query.captain = req.session.user._id
    }
    if (Object.keys(req.query).length) {
      if (req.query.verify === '0') {
        query.verified = { $lte: 0 }
      } else {
        query.verified = req.query.verify
      }
    }
    Player.find(query, (err, docs) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.json(docs)
    })
      .lean()
      .populate('captain', 'username discriminator')
  })
  .post(captainAuth, upload.single('verification'), (req, res) => {
    const doc = new Player({ ...req.body })
    doc.captain = req.session.user._id
    if (req.file) {
      doc.verification = req.file
      doc.verified = 1
    } else doc.verified = 0
    doc.save((err) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.sendStatus(200)
    })
  })
router.route('/search').get(captainAuth, async (req, res) => {
  res.json(await searchGuildMember(req.query.query))
})

router
  .route('/:playerID')
  .put(captainAuth, upload.single('verification'), (req, res) => {
    Player.findById(req.params.playerID, (err, doc) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      if (doc.captain === req.session.user._id) {
        delete req.body.captain
        Object.assign(doc, req.body)
        if (req.file) {
          doc.verification = req.file
          doc.verified = 1
        }
        doc.save((err) => {
          if (err) {
            res.status(500).send(err)
            return
          }
          res.sendStatus(200)
        })
      } else {
        if (err) res.sendStatus(403)
      }
    })
  })
  .delete(captainAuth, (req, res) => {
    Player.deleteOne({ _id: req.params.playerID }, (err) => {
      if (err) res.status(500).send(err)
      res.sendStatus(200)
    })
  })

router.use(
  '/verifications',
  adminAuth,
  express.static('verifications', { setHeaders, maxAge: '7 days' })
)

function setHeaders (res, path) {
  res.set({
    'Content-Disposition': 'inline'
  })
}
