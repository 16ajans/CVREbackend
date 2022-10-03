import express from 'express'
import { Player, User } from '../../drivers/db.js'
import { userAuth, captainAuth, adminAuth } from '../auth.js'

export const router = express.Router()

router.get('/', adminAuth, (req, res) => {
    User.find({}, (err, docs) => {
        if (err) res.status(500).send(err)
        res.json(docs)
    }).lean()
})
router.route('/:userID/roles', adminAuth)
    .get((req, res) => {
        User.findById(req.params.userID, (err, doc) => {
            if (err) res.status(500).send(err)
            res.json(doc.roles)
        }).lean()
    })
    .post((req, res) => {
        User.findById(req.params.userID, (err, doc) => {
            if (err) res.status(500).send(err)
            if (!(req.body.roleID in doc.roles)) doc.roles.push(req.body.roleID)
            doc.save((err) => {
                if (err) res.status(500).send(err)
                res.sendStatus(200)
            })
        })
    })
router.delete('/:userID/roles/:roleID', adminAuth, (req, res) => {
    User.findById(req.params.userID, (err, doc) => {
        if (err) res.status(500).send(err)
        const index = doc.roles.indexOf(req.params.roleID)
        if (index > -1) doc.roles.splice(index, 1)
        doc.save((err) => {
            if (err) res.status(500).send(err)
            res.sendStatus(200)
        })
    })
})

router.get('/me', userAuth, (req, res) => {
    User.findById(req.session.user._id, (err, doc) => {
        if (err) res.status(500).send(err)
        res.json(doc)
    }).lean()
})
router.route('/me/players', captainAuth)
    .get((req, res) => {
        Player.find({ captain: req.session.user._id }, (err, docs) => {
            if (err) res.status(500).send(err)
            res.json(docs)
        }).lean()
    })
    .post((req, res) => {
        const doc = new Player({ ...req.body })
        doc.captain = req.session.user._id
        doc.save((err) => {
            if (err) res.status(500).send(err)
            res.sendStatus(200)
        })
    })
router.route('/me/players/:playerID', captainAuth)
    .get((req, res) => {
        Player.findOne({
            captain: req.session.user._id,
            _id: req.params.playerID
        }, (err, doc) => {
            if (err) res.status(500).send(err)
            res.json(doc)
        }).lean()
    })
    .patch((req, res) => {

    })
    .delete((req, res) => {

    })
router.route('/me/teams', captainAuth)
    .get((req, res) => {

    })
    .post((req, res) => {

    })
router.route('/me/teams/:teamID', captainAuth)
    .get((req, res) => {

    })
    .patch((req, res) => {

    })
    .delete((req, res) => {

    })
router.route('/me/teams/:teamID/players', captainAuth)
    .get((req, res) => {

    })
    .post((req, res) => {

    })
router.route('/me/teams/:teamID/players/:playerID', captainAuth)
    .get((req, res) => {

    })
    .patch((req, res) => {

    })
    .delete((req, res) => {

    })
