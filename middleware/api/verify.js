import express from 'express'
import { Player } from '../../drivers/db.js'
import { adminAuth } from '../auth.js'

export const router = express.Router()
const opts = ['-1', '2']

router.route('/:playerID/:op').get(adminAuth, (req, res) => {
  Player.findById(req.params.playerID, (err, doc) => {
    if (err) {
      res.status(500).send(err)
      return
    }
    if (opts.includes(req.params.op)) {
      doc.verified = req.params.op
      doc.verification = undefined
      doc.save((err) => {
        if (err) {
          res.status(500).send(err)
          return
        }
        res.sendStatus(200)
      })
    } else {
      res.status(400).send('Invalid Operation.')
    }
  })
})
