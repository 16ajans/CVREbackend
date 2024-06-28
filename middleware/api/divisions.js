import express from 'express'
import { Division } from '../../drivers/db.js'
import { adminAuth } from '../auth.js'

export const router = express.Router()

router
  .route('/')
  .get((req, res) => {
    Division.find({}, (err, docs) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.json(docs)
    }).lean()
  })
  .post(adminAuth, (req, res) => {
    const doc = new Division({ ...req.body })
    doc.save((err) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.sendStatus(200)
    })
  })

router
  .route('/:divisionID')
  .put(adminAuth, (req, res) => {
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
