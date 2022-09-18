import express from 'express';
import { User, Role, Player, Assignment, Team, Division } from '../drivers/db.js'
import { userAuth, captainAuth, adminAuth } from './auth.js';

//TODO error handling

export const router = express.Router();

router.route('/divisions', adminAuth)
    .get((req, res) => {

    })
    .post((req, res) => {

    });
router.route('/divisions/:divisionID', adminAuth)
    .get((req, res) => {

    })
    .patch((req, res) => {

    })
    .delete((req, res) => {

    });

router.route('/roles', adminAuth)
    .get((req, res) => {

    })
    .post((req, res) => {

    });
router.route('/roles/:roleID', adminAuth)
    .get((req, res) => {

    })
    .patch((req, res) => {

    })
    .delete((req, res) => {

    });

router.get('/users', adminAuth, (req, res) => {

});
router.route('/users/:userID/roles', adminAuth)
    .get((req, res) => {

    })
    .post((req, res) => {

    });
router.delete('/users/:userID/roles/:roleID', adminAuth, (req, res) => {

});

router.get('/players', adminAuth, (req, res) => {

});
router.route('/players/:playerID/roles', adminAuth)
    .get((req, res) => {

    })
    .post((req, res) => {

    });
router.delete('/players/:playerID/roles/:roleID', adminAuth, (req, res) => {

});

//TODO teams?

router.get('/users/me', userAuth, (req, res) => {

});
router.route('/users/me/players', captainAuth)
    .get((req, res) => {

    })
    .post((req, res) => {

    });
router.route('/users/me/players/:playerID', captainAuth)
    .get((req, res) => {

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

});

router.get('/public', (req, res) => {

});