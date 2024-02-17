import express from 'express'
import { User } from '../drivers/db.js'
import {
  authorizationURL,
  revokeToken,
  getTokenResponse,
  getCurrentUser,
  getGuildRoles
} from '../drivers/discord.js'
import intersect from 'just-intersect'

const captainRoleIDs = process.env.CAPTAIN_ROLE_IDS.split(',')
const adminRoleID = process.env.ADMIN_ROLE_ID
const scoresaberRoleID = process.env.SCORESABER_ROLE_ID

export const userAuth = (req, res, next) => {
  if (req.session.user) next()
  else res.sendStatus(401)
}
export const captainAuth = (req, res, next) => {
  if (req.session.user) {
    if (
      intersect(req.session.user.roles, captainRoleIDs) > 0 ||
      req.session.user.roles.includes(adminRoleID)
    ) {
      next()
    } else res.sendStatus(403)
  } else res.sendStatus(401)
}
export const adminAuth = (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.roles.includes(adminRoleID)) next()
    else res.sendStatus(403)
  } else res.sendStatus(401)
}

export const router = express.Router()

router.get('/login', (req, res) => {
  res.redirect(authorizationURL)
})

// TODO: error handling, implement state paramter (session?)
// TODO: token handling? keep it in the session and encrypt?

router.get('/callback', async (req, res) => {
  // TODO speed up?
  const tokenResponse = await getTokenResponse(req.query.code)
  const discordRoles = await getGuildRoles(tokenResponse.access_token)
  const discordUser = await getCurrentUser(tokenResponse.access_token)
  const user = await User.findOneAndUpdate(
    { _id: discordUser.id },
    {
      _id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      roles: discordRoles,
      avatar: discordUser.avatar,
      auth: tokenResponse
    },
    { upsert: true, new: true }
  )

  req.session.user = user
  req.session.save(() => {
    res.redirect('/')
  })
})
router.get('/logout', (req, res) => {
  if (req.session.user) {
    revokeToken(req.session.user.auth.access_token)
    User.updateOne(
      { _id: req.session.user._id },
      {
        auth: {}
      }
    ).exec()
    req.session.destroy()
  }
  res.redirect('/')
})
// router.get('/refresh', userAuth, async (req, res) => {
//   const discordRoles = await getGuildRoles(req.session.user.auth.access_token)
//   User.findOneAndUpdate(
//     { _id: req.session.user._id },
//     {
//       roles: discordRoles
//     }
//   ).then((oldDoc) => {
//     res.redirect('back')
//   })
// })
router.get('/me', userAuth, async (req, res) => {
  const clean = Object.assign({}, req.session.user)
  delete clean.auth
  if (clean.roles.includes('144973321749004289')) { // hard overwrite for haazman - post removal of admin role
    clean.admin = true
  }
  if (clean.roles.includes(adminRoleID)) {
    clean.admin = true
  }
  if (clean.roles.includes(scoresaberRoleID)) {
    clean.sc = true
  }
  if (intersect(clean.roles, captainRoleIDs) > 0) {
    clean.captain = true
  }
  res.json(clean)
})
