import express from 'express';
import { Role, User } from '../drivers/db.js';
import { authorizationURL, revokeToken, getTokenResponse, getCurrentUser, getGuildRoles } from '../drivers/discord.js';

export const userAuth = (req, res, next) => {
    if (req.session.user) next();
    else res.sendStatus(401);
};

export const captainAuth = (req, res, next) => {
    //TODO get roles from session object and query db for captain roles
    // find intersection
    next();
};

export const adminAuth = (req, res, next) => {
    if (req.session.user.roles.includes(process.env.ADMIN_ROLE_ID)) next();
    else res.sendStatus(403);
};

export const router = express.Router();

router.get('/login', (req, res) => {
    res.redirect(authorizationURL);
});

//TODO error handling, implement state paramter (session?)

router.get('/callback', async (req, res) => { //TODO speed up?
    const tokenResponse = await getTokenResponse(req.query.code);
    const discordRoles = await getGuildRoles(tokenResponse.access_token);
    const discordUser = await getCurrentUser(tokenResponse.access_token);
    const user = await User.findOneAndUpdate({ snowflake: discordUser.id }, {
        snowflake: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        roles: discordRoles,
        avatar: discordUser.avatar,
        auth: tokenResponse
    }, { upsert: true, new: true });

    req.session.user = user;
    req.session.save(() => {
        res.redirect('/portal');
    });
});
router.get('/logout', (req, res) => { //TODO test for race conditions and async exec
    if (req.session.user) {
        revokeToken(req.session.user.token);
        User.updateOne({ snowflake: req.session.user.snowflake }, {
            auth: {}
        });
        req.session.destroy();
    };
    res.redirect('/');
});