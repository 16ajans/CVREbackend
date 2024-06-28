import express from 'express'
import { User } from '../../drivers/db.js'
import { adminAuth } from '../auth.js'

export const router = express.Router()

router.route('/:userID/:op').get(adminAuth, (req, res) => {
  User.findById(req.params.userID, (err, doc) => {
    if (err) {
      res.status(500).send(err)
      return
    }
    if (req.params.op === 'deny') doc.verified = 'awaiting'
    else if (req.params.op === 'accept') doc.verified = 'accepted'
    else res.status(400).send('Invalid Operation.')
    doc.verification = undefined
    doc.save((err) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.sendStatus(200)
    })
  })
})
