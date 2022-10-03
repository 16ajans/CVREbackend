import express from 'express'
import { Role } from '../../drivers/db.js'

export const router = express.Router()

router.route('/')
    .get((req, res) => {
        Role.find({}, (err, docs) => {
            if (err) res.status(500).send(err)
            res.json(docs)
        }).lean()
    })
    .post((req, res) => {
        const doc = new Role({ ...req.body })
        doc.save((err) => {
            if (err) res.status(500).send(err)
            res.sendStatus(200)
        })
    })
router.route('/:roleID')
    .get((req, res) => {
        Role.findById(req.params.roleID, (err, doc) => {
            if (err) res.status(500).send(err)
            res.json(doc)
        }).lean()
    })
    .patch((req, res) => {
        Role.findById(req.params.roleID, (err, doc) => {
            if (err) res.status(500).send(err)
            Object.assign(doc, req.body)
            doc.save((err) => {
                if (err) res.status(500).send(err)
                res.sendStatus(200)
            })
        })
    })
    .delete((req, res) => {
        Role.deleteOne({ _id: req.params.roleID }, (err) => {
            if (err) res.status(500).send(err)
            res.sendStatus(200)
        })
    })
