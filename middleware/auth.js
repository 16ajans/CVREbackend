import express from 'express';
import { Role, User } from '../drivers/db.js';
import { authorizationURL, revokeToken } from '../drivers/discord.js';

export const userAuth = (req, res, next) => {
    if (req.session.user) next();
    else res.sendStatus(401);
};

export const captainAuth = (req, res, next) => {
    //TODO get roles from session object and query db for captain roles, find intersection
    next();
};

export const adminAuth = (req, res, next) => {
    if (req.session.user.roles.includes(process.env.ADMIN_ROLE_ID)) next();
    else res.sendStatus(403);
};

//TODO implement state paramter (session?)

router.get('/login', (req, res) => {
    res.redirect(authorizationURL);
});
router.get('/callback', (req, res) => {
    //TODO reimplement
});
router.get('/logout', (req, res) => {
    if (req.session.user) {
        revokeToken(req.session.user.token);
        User.findOneAndUpdate({ snowflake: req.session.user.snowflake }, {
            auth: {}
        });
        req.session.destroy();
    };
    res.redirect('/');
});

export const router = express.Router();