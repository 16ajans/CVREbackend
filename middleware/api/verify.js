import express from 'express'
import { addRole, removeRole } from '../../drivers/bot.js'
import { Player, Team, Division } from '../../drivers/db.js'
import { adminAuth } from '../auth.js'

export const router = express.Router()
const opts = ['-1', '2']

function assignRoles (playerID) {
  Team.find({ 'players.player': playerID }, (_err, docs) => {
    const roles = new Set(docs.map((team) => team.division.playerRole[0]))
    roles.forEach((role) => {
      addRole(playerID, role)
    })
  })
    .select('division')
    .populate('division', 'playerRole')
}

function removeRoles (playerID) {
  Team.find({ 'players.player': playerID }, (_err, docs) => {
    const roles = new Set(docs.map((team) => team.division.playerRole[0]))
    roles.forEach((role) => {
      removeRole(playerID, role)
    })
  })
    .select('division')
    .populate('division', 'playerRole')
}

export function propgateRoleChanges (divisionID) {
  // Division.findById(divisionID, (err, doc) => {
  //   if (err) console.error(err)
  //   console.log(doc)
  // })
  // get list of users who should have role
  // get list of users who *do* have role
  // give roles to users unique to list a
  // take roles from users unique to list b?
}

router.route('/:playerID/:op').get(adminAuth, (req, res) => {
  Player.findById(req.params.playerID, (err, doc) => {
    if (err) {
      res.status(500).send(err)
      return
    }
    if (opts.includes(req.params.op)) {
      doc.verified = req.params.op
      doc.verification = undefined
      doc.save((err) => {
        if (err) {
          res.status(500).send(err)
          return
        }
        res.sendStatus(200)
        if (req.params.op === '2') assignRoles(req.params.playerID)
        else removeRoles(req.params.playerID)
      })
    } else {
      res.status(400).send('Invalid Operation.')
    }
  })
})
