import express from 'express'
import { Division } from '../../drivers/db.js'
import { fetchGuildRoles } from '../../drivers/bot.js'
import { userAuth, adminAuth } from '../auth.js'

export const router = express.Router()

router
  .route('/')
  .get(userAuth, (req, res) => {
    Division.find({}, (err, docs) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.json(docs)
    }).lean()
  })
  .post(adminAuth, (req, res) => {
    req.body.admin = req.body.admin.split(',')
    req.body.playerRole = req.body.playerRole.split(',')
    // req.body.captainRole = req.body.captainRole.split(',')
    const doc = new Division({ ...req.body })
    doc.save((err) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.sendStatus(200)
    })
  })
router.route('/roles').get(userAuth, async (req, res) => {
  res.json(await fetchGuildRoles())
})

router
  .route('/:divisionID')
  .put(adminAuth, (req, res) => {
    req.body.admin = req.body.admin.split(',')
    req.body.playerRole = req.body.playerRole.split(',')
    // req.body.captainRole = req.body.captainRole.split(',')
    Division.findById(req.params.divisionID, (err, doc) => {
      if (err) res.status(500).send(err)
      Object.assign(doc, req.body)
      doc.save((err) => {
        if (err) res.status(500).send(err)
        res.sendStatus(200)
      })
    })
  })
  .delete(adminAuth, (req, res) => {
    Division.deleteOne({ _id: req.params.divisionID }, (err) => {
      if (err) res.status(500).send(err)
      res.sendStatus(200)
    })
  })
