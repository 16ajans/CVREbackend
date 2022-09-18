import { RPCCloseEventCodes } from 'discord.js';
import express from 'express';
import { User, Role, Player, Assignment, Team, Division } from '../drivers/db.js'
import { userAuth, captainAuth, adminAuth } from './auth.js';

//TODO error handling, queries, convert async/await to promises, swap findOne for findById(?)

export const router = express.Router();

router.use(express.json());

router.route('/divisions', adminAuth)
    .get(async (req, res) => {
        res.json(await Division.find({}.lean()));
    })
    .post((req, res) => {
        const doc = new Division({ ...req.body });
        doc.admin = req.session.user._id;
        doc.save((err) => {
            if (err) res.status(500).send(err);
            res.sendStatus(200);
        });
    });
router.route('/divisions/:divisionID', adminAuth)
    .get(async (req, res) => {
        res.json(await Division.findOne({ _id: req.params.divisionID }).lean());
    })
    .patch(async (req, res) => {
        const doc = await Division.findOne({ _id: req.params.divisionID });
        Object.assign(doc, req.body);
        doc.save((err) => {
            if (err) res.status(500).send(err);
            res.sendStatus(200);
        });
    })
    .delete((req, res) => {
        Division.deleteOne({ _id: req.params.divisionID }, (err) => {
            if (err) res.status(500).send(err);
            res.sendStatus(200);
        });
    });

router.route('/roles', adminAuth)
    .get(async (req, res) => {
        res.json(await Role.find({}.lean()));
    })
    .post((req, res) => {
        const doc = new Role({ ...req.body });
        doc.save((err) => {
            if (err) res.status(500).send(err);
            res.sendStatus(200);
        });
    });
router.route('/roles/:roleID', adminAuth)
    .get(async (req, res) => {
        res.json(await Role.findOne({ _id: req.params.roleID }).lean());
    })
    .patch(async (req, res) => {
        const doc = await Role.findOne({ _id: req.params.roleID });
        Object.assign(doc, req.body);
        doc.save((err) => {
            if (err) res.status(500).send(err);
            res.sendStatus(200);
        });
    })
    .delete((req, res) => {
        Role.deleteOne({ _id: req.params.roleID }, (err) => {
            if (err) res.status(500).send(err);
            res.sendStatus(200);
        });
    });

router.get('/users', adminAuth, async (req, res) => {
    res.json(await User.find({}.lean()));
});
router.route('/users/:userID/roles', adminAuth)
    .get((req, res) => {
        User.findOne({ _id: req.params.userID }, (err, doc) => {
            if (err) res.status(500).send(err);
            res.json(doc.roles);
        }).lean();
    })
    .post(async (req, res) => {
        const doc = await User.findOne({ _id: req.params.userID });
        if (!(req.body.roleID in doc.roles)) doc.roles.push(req.body.roleID);
        doc.save((err) => {
            if (err) res.status(500).send(err);
            res.sendStatus(200);
        });
    });
router.delete('/users/:userID/roles/:roleID', adminAuth, async (req, res) => {
    const doc = await User.findOne({ _id: req.params.userID });
    const index = doc.roles.indexOf(req.params.roleID);
    if (index > -1) doc.roles.splice(index, 1);
    doc.save((err) => {
        if (err) res.status(500).send(err);
        res.sendStatus(200);
    });
});

router.get('/players', adminAuth, async (req, res) => {
    res.json(await Player.find({}.lean()));
});
router.route('/players/:playerID/roles', adminAuth)
    .get((req, res) => {
        Player.findOne({ _id: req.params.userID }, (err, doc) => {
            if (err) res.status(500).send(err);
            res.json(doc.roles);
        }).lean();
    })
    .post(async (req, res) => {
        const doc = await Player.findOne({ _id: req.params.userID });
        if (!(req.body.roleID in doc.roles)) doc.roles.push(req.body.roleID);
        doc.save((err) => {
            if (err) res.status(500).send(err);
            res.sendStatus(200);
        });
    });
router.delete('/players/:playerID/roles/:roleID', adminAuth, async (req, res) => {
    const doc = await Player.findOne({ _id: req.params.userID });
    const index = doc.roles.indexOf(req.params.roleID);
    if (index > -1) doc.roles.splice(index, 1);
    doc.save((err) => {
        if (err) res.status(500).send(err);
        res.sendStatus(200);
    });
});

//TODO teams?

router.get('/users/me', userAuth, async (req, res) => {
    res.json(await User.findOne({ _id: req.session.user._id }).lean());
});
router.route('/users/me/players', captainAuth)
    .get(async (req, res) => {
        res.json(await Player.find({ captain: req.session.user._id }.lean()));
    })
    .post((req, res) => {
        const doc = new Player({ ...req.body });
        doc.captain = req.session.user._id;
        doc.save((err) => {
            if (err) res.status(500).send(err);
            res.sendStatus(200); //TODO VERIFICATION
        });
    });
router.route('/users/me/players/:playerID', captainAuth)
    .get(async (req, res) => {
        res.json(await Player.findOne({
            captain: req.session.user._id,
            _id: req.params.playerID
        }.lean()));
    })
    .patch((req, res) => {

    })
    .delete((req, res) => {

    });
router.route('/users/me/teams', captainAuth)
    .get((req, res) => {

    })
    .post((req, res) => {

    });
router.route('/users/me/teams/:teamID', captainAuth)
    .get((req, res) => {

    })
    .patch((req, res) => {

    })
    .delete((req, res) => {

    });
router.route('/users/me/teams/:teamID/players', captainAuth)
    .get((req, res) => {

    })
    .post((req, res) => {

    });
router.route('/users/me/teams/:teamID/players/:playerID', captainAuth)
    .get((req, res) => {

    })
    .patch((req, res) => {

    })
    .delete((req, res) => {

    });

router.get('/stream', (req, res) => {
    Division.find({ game: "Beat Saber" })
        .select('name teams')
        .populate({
            path: 'teams',
            select: 'name players'
        })
        .lean();
    //TODO transform into justin's expected keys and layout
});

router.get('/public', (req, res) => {
    // divisions
    // teams
    // players
});