import express from 'express'

import { router as divisions } from './api/divisions.js'
import { router as teams } from './api/teams.js'
import { router as players } from './api/players.js'
import { router as verify } from './api/verify.js'

import { fetchGuildRoles } from '../../drivers/bot.js'
import { userAuth } from '../auth.js'

// TODO: error handling with middleware, filter queries
// TODO: populate option?

export const router = express.Router()

router.use(express.json())

router.use('/divisions', divisions)

router.use('/teams', teams)

router.use('/players', players)

router.use('/verify', verify)

router.route('/roles').get(userAuth, async (req, res) => {
  res.json(await fetchGuildRoles())
})
