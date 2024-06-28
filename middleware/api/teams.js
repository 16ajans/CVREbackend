import express from 'express'
import { Team } from '../../drivers/db.js'
import { userAuth } from '../auth.js'
import multer from 'multer'
import { mkdir } from 'node:fs/promises'
import { nanoid } from 'nanoid/non-secure'

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await mkdir(`logos/${req.session.user._id}/`, { recursive: true })
    cb(null, `logos/${req.session.user._id}/`)
  },
  filename: function (req, file, cb) {
    cb(null, `${req.body.name}-${nanoid(10)}.${file.mimetype.split('/')[1]}`)
  }
})
function fileFilter (req, file, cb) {
  if (
    file.mimetype.startsWith('image') &&
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
    if (req.query.owner) {
      query.owner = req.query.owner
    }
    if (req.query.division) {
      query.division = req.query.division
    }
    Team.find(query, (err, docs) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.json(docs)
    }).lean()
    // .populate('division', 'name')
    // .populate('captain', 'username discriminator')
    // .populate({
    //   path: 'players',
    //   populate: { path: 'player', select: 'username discriminator' }
    // })
  })
  .post(userAuth, upload.single('logo'), (req, res) => {
    const doc = new Team({ ...req.body })
    doc.owner = req.session.user._id // prevent creating teams in others' names
    if (req.file) {
      doc.logo = req.file
    }
    doc.save((err) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.sendStatus(200)
    })
  })

router
  .route('/:teamID')
  .put(userAuth, upload.single('logo'), (req, res) => {
    Team.findById(req.params.teamID, (err, doc) => {
      if (err) res.status(500).send(err)
      if (req.session.user.roles.includes(ADMIN_ROLE_ID)) { // allow admin full write
      } else if (doc.owner === req.session.user._id) { // allow owner partial write
        delete req.body.division // prevent overwriting division
        delete req.body.owner // and owner
      } else {
        res.sendStatus(403)
        return
      }
      Object.assign(doc, req.body)
      if (req.file) {
        doc.logo = req.file
      }
      doc.save((err) => {
        if (err) res.status(500).send(err)
        res.sendStatus(200)
      })
    })
  })
  .delete(userAuth, (req, res) => {
    const query = { _id: req.params.teamID }
    if (req.session.user.roles.includes(ADMIN_ROLE_ID)) { // allow admin full deletion
    } else { query.owner = req.session.user._id } // otherwise, search for only this user's teams
    Team.deleteOne(
      query,
      (err) => {
        if (err) res.status(500).send(err)
        res.sendStatus(200)
      }
    )
  })

router.use('/logos', express.static('logos', { setHeaders, maxAge: '1y' }))

function setHeaders (res, path) {
  res.set({
    'Content-Disposition': 'inline'
  })
}
