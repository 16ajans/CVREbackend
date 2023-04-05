import express from 'express'

import { router as divisions } from './api/divisions.js'
import { router as teams } from './api/teams.js'
import { router as players } from './api/players.js'
import { router as verify } from './api/verify.js'
import { Division, Team } from '../drivers/db.js'
import { getRoleTemplate } from '../drivers/bot.js'

// TODO: error handling with middleware, filter queries
// TODO: populate option?

export const router = express.Router()

router.use(express.json())

router.use('/divisions', divisions)

router.use('/teams', teams)

router.use('/players', players)

router.use('/verify', verify)

router.get('/stream', (req, res) => {
  Team.aggregate(
    [
      {
        $lookup: {
          from: 'users',
          localField: 'captain',
          foreignField: '_id',
          pipeline: [{ $project: { username: 1, discriminator: 1 } }],
          as: 'captain'
        }
      },
      {
        $group: {
          _id: '$division',
          teams: { $push: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'divisions',
          let: { divID: { $toObjectId: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$divID'] } } }],
          as: 'division'
        }
      }
    ],
    (err, agg) => {
      if (err) {
        res.status(500).send(err)
        return
      }
      res.json(agg)
    }
  )
})

router.get('/roles', async (req, res) => {
  res.json(await getRoleTemplate())
})

router.get('/public', (req, res) => {
  Division.find({}, async (err, docs) => {
    if (err) {
      res.status(500).send(err)
      return
    }
    res.json(
      await Promise.all(
        docs.map(async (div) => {
          const teams = await Team.find({ division: div._id })
            .lean()
            .populate({ path: 'captain', select: 'username discriminator' })
            .populate({
              path: 'players',
              populate: {
                path: 'player',
                select: 'username discriminator verified'
              }
            })
          div.teams = teams
          return div
        })
      )
    )
  })
    .lean()
    // .select('-playerRole -captainRole')
    .select('-playerRole')
})
