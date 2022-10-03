import express from 'express'
import { Role, User } from '../drivers/db.js'
import { authorizationURL, revokeToken, getTokenResponse, getCurrentUser, getGuildRoles } from '../drivers/discord.js'

export const userAuth = (req, res, next) => {
    if (req.session.user) next()
    else res.sendStatus(401)
}
export const captainAuth = async (req, res, next) => {
    if (req.session.user) {
        const roleDocs = await Role.find({ approved: true })
        const roleIDs = roleDocs.map(doc => doc.snowflake)
        const intersection = res.session.user.roles.filter(snowflake => roleIDs.includes(snowflake))
        if (intersection && intersection.length) next()
        else res.sendStatus(403)
    } else res.sendStatus(401)
}
export const adminAuth = (req, res, next) => {
    if (req.session.user) {
        if (req.session.user.roles.includes(process.env.ADMIN_ROLE_ID)) next()
        else res.sendStatus(403)
    } else res.sendStatus(401)
}

export const router = express.Router()

router.get('/login', (req, res) => {
    res.redirect(authorizationURL)
})

// TODO error handling, implement state paramter (session?)

router.get('/callback', async (req, res) => { // TODO speed up?
    const tokenResponse = await getTokenResponse(req.query.code)
    const discordRoles = await getGuildRoles(tokenResponse.access_token)
    const discordUser = await getCurrentUser(tokenResponse.access_token)
    const user = await User.findOneAndUpdate({ snowflake: discordUser.id }, {
        snowflake: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        roles: discordRoles,
        avatar: discordUser.avatar,
        auth: tokenResponse
    }, { upsert: true, new: true })

    req.session.user = user
    req.session.save(() => {
        res.redirect('/portal')
    })
})
router.get('/logout', (req, res) => { // TODO test for race conditions and async exec
    if (req.session.user) {
        revokeToken(req.session.user.token)
        User.updateOne({ snowflake: req.session.user.snowflake }, {
            auth: {}
        })
        req.session.destroy()
    };
    res.redirect('/')
})
