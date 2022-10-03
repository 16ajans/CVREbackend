import express from 'express'
import { Player } from '../../drivers/db.js'

export const router = express.Router()

router.get('/', (req, res) => {
    Player.find({}, (err, docs) => {
        if (err) res.status(500).send(err)
        res.json(docs)
    }).lean()
})
router.route('/:playerID/roles')
    .get((req, res) => {
        Player.findById(req.params.playerID, (err, doc) => {
            if (err) res.status(500).send(err)
            res.json(doc.roles)
        }).lean()
    })
    .post((req, res) => {
        Player.findById(req.params.playerID, (err, doc) => {
            if (err) res.status(500).send(err)
            if (!(req.body.roleID in doc.roles)) doc.roles.push(req.body.roleID)
            doc.save((err) => {
                if (err) res.status(500).send(err)
                res.sendStatus(200)
            })
        })
    })
router.delete('/:playerID/roles/:roleID', (req, res) => {
    Player.findById(req.params.playerID, (err, doc) => {
        if (err) res.status(500).send(err)
        const index = doc.roles.indexOf(req.params.roleID)
        if (index > -1) doc.roles.splice(index, 1)
        doc.save((err) => {
            if (err) res.status(500).send(err)
            res.sendStatus(200)
        })
    })
})
