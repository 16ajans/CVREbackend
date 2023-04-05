import express from 'express'
import { Team, Assignment } from '../../drivers/db.js'
import { captainAuth } from '../auth.js'
import multer from 'multer'
import { mkdir } from 'node:fs/promises'
import { nanoid } from 'nanoid/non-secure'

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
  .get(captainAuth, (req, res) => {
    const query = {}
    if (!req.session.user.roles.includes(process.env.ADMIN_ROLE_ID)) {
      query.captain = req.session.user._id
    }
    Team.find(query, (err, docs) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.json(docs)
    })
      .lean()
      .populate('division', 'name')
      .populate('captain', 'username discriminator')
      .populate({
        path: 'players',
        populate: { path: 'player', select: 'username discriminator' }
      })
  })
  .post(captainAuth, upload.single('logo'), (req, res) => {
    const doc = new Team({ ...req.body })
    doc.captain = req.session.user._id
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
  .put(captainAuth, upload.single('logo'), (req, res) => {
    Team.findById(req.params.teamID, (err, doc) => {
      if (err) res.status(500).send(err)
      if (doc.captain === req.session.user._id) {
        delete req.body.division
        delete req.body.captain
        Object.assign(doc, req.body)
        if (req.file) {
          doc.logo = req.file
        }
        doc.save((err) => {
          if (err) res.status(500).send(err)
          res.sendStatus(200)
        })
      } else if (req.session.user.roles.includes(process.env.ADMIN_ROLE_ID)) {
        delete req.body.captain
        Object.assign(doc, req.body)
        if (req.file) {
          doc.logo = req.file
        }
        doc.save((err) => {
          if (err) res.status(500).send(err)
          res.sendStatus(200)
        })
      } else {
        if (err) res.sendStatus(403)
      }
    })
  })
  .delete(captainAuth, (req, res) => {
    Team.deleteOne(
      { _id: req.params.teamID, captain: req.session.user._id },
      (err) => {
        if (err) res.status(500).send(err)
        res.sendStatus(200)
      }
    )
  })
router.route('/:teamID/assignments').post(captainAuth, (req, res) => {
  Team.findById(req.params.teamID, async (err, doc) => {
    if (err) res.status(500).send(err)
    doc.players.push(new Assignment({ ...req.body }))
    await doc.populate({
      path: 'players',
      populate: { path: 'player', select: 'verified' }
    })
    doc.save((err) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.sendStatus(200)
    })
  }).populate('division', 'playerRole')
})
router
  .route('/:teamID/assignments/:assignmentID')
  .delete(captainAuth, (req, res) => {
    Team.findById(req.params.teamID, (err, doc) => {
      if (err) res.status(500).send(err)
      const index = doc.players.findIndex((assign) => {
        return assign._id.toString() === req.params.assignmentID
      })
      if (index > -1) {
        doc.players.splice(index, 1)
        doc.save((err) => {
          if (err) {
            res.status(500).send(err)
            return
          }
          res.sendStatus(200)
        })
      } else {
        res.status(500).send('No such assignment.')
      }
    }).populate('division', 'playerRole')
  })

router.use('/logos', express.static('logos', { setHeaders, maxAge: '1y' }))

function setHeaders (res, path) {
  res.set({
    'Content-Disposition': 'inline'
  })
}
