import express from 'express'
import { Division } from '../drivers/db.js'
import { adminAuth } from './auth.js'

import { router as divisions } from './api/divisions.js'
import { router as roles } from './api/roles.js'
import { router as users } from './api/users.js'
import { router as players } from './api/players.js'

// TODO error handling with middleware, filter queries
// TODO populate option?

export const router = express.Router()

router.use(express.json())

router.use('/divisions', adminAuth, divisions)

router.use('/roles', adminAuth, roles)

router.use('/players', adminAuth, players)

router.use('/users', users)

// TODO teams for admins?

router.get('/stream', (req, res) => {
    Division.find({ game: 'Beat Saber' })
        .select('name teams')
        .populate({
            path: 'teams',
            select: 'name players'
        })
        .lean()
    // TODO transform into justin's expected keys and layout
})

router.get('/public', (req, res) => {
    // divisions
    // teams
    // players
})
