import express from 'express'
import { Division } from '../../drivers/db.js'

export const router = express.Router()

router.route('/')
    .get((req, res) => {
        Division.find({}, (err, docs) => {
            if (err) res.status(500).send(err)
            res.json(docs)
        }).lean()
    })
    .post((req, res) => {
        const doc = new Division({ ...req.body })
        doc.admin = req.session.user._id
        doc.save((err) => {
            if (err) res.status(500).send(err)
            res.sendStatus(200)
        })
    })
router.route('/:divisionID')
    .get((req, res) => {
        Division.findById(req.params.divisionID, (err, doc) => {
            if (err) res.status(500).send(err)
            res.json(doc)
        }).lean()
    })
    .patch((req, res) => {
        Division.findById(req.params.divisionID, (err, doc) => {
            if (err) res.status(500).send(err)
            Object.assign(doc, req.body)
            doc.save((err) => {
                if (err) res.status(500).send(err)
                res.sendStatus(200)
            })
        })
    })
    .delete((req, res) => {
        Division.deleteOne({ _id: req.params.divisionID }, (err) => {
            if (err) res.status(500).send(err)
            res.sendStatus(200)
        })
    })
