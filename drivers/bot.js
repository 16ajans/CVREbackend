import { Client, Events, GatewayIntentBits } from 'discord.js'
import { Team } from './db.js'
import { CronJob } from 'cron'

// TODO: understand if i need gateway intents
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
let guild

client.once(Events.ClientReady, async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`)
  guild = c.guilds.resolve(process.env.GUILD_ID)

  // c.users.createDM('144973321749004289').then((DMChannel) => {
  //   DMChannel.send('bot is up!')
  // })
  // console.log(guild.members.me.permissions)

  job.start()
  console.log(`Job started with frequency ${process.env.ROLE_CRON}`)
})

export async function addRole (userSnowflake, roleSnowflake) {
  return await guild.members.addRole({
    user: userSnowflake,
    role: roleSnowflake
  })
}
// export async function removeRole (userSnowflake, roleSnowflake) {
//   return await guild.members.removeRole({
//     user: userSnowflake,
//     role: roleSnowflake
//   })
// }
export async function fetchMemberRoles (userSnowflake) {
  const member = await guild.members.fetch(userSnowflake)
  return member._roles
}
export async function fetchGuildRoles () {
  const roles = await guild.roles.fetch()
  const roleList = roles.map((role) => [role.id, role.name])
  // const roleList = roles.map((role) => role.id)
  roleList.sort((a, b) => {
    return b[0] - a[0]
  })
  return roleList
}
export async function sendDM (userSnowflake, message) {
  client.users.createDM(userSnowflake).then((DMChannel) => {
    DMChannel.send(message)
  })
}

export async function searchGuildMember (query) {
  try {
    if (BigInt(query).toString() === query) {
      const member = await guild.members.fetch(query)
      return [
        member.user.id,
        member.user.username,
        member.user.discriminator,
        member.nickname
      ]
    }
  } catch {
    const members = await guild.members.fetch({ query, limit: 6 })
    return members.map((member) => {
      return [
        member.user.id,
        member.user.username,
        member.user.discriminator,
        member.nickname
      ]
    })
  }
}

export function getRoleTemplate () {
  return Team.aggregate([
    {
      $lookup: {
        from: 'divisions',
        let: { divID: { $toObjectId: '$division' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$divID'] } } },
          { $project: { playerRole: true } }
        ],
        as: 'division'
      }
    },
    { $unwind: { path: '$division' } },
    { $unwind: { path: '$players' } },
    {
      $replaceRoot: {
        newRoot: {
          role: '$division.playerRole',
          player: '$players.player'
        }
      }
    },
    {
      $lookup: {
        from: 'players',
        localField: 'player',
        foreignField: '_id',
        pipeline: [{ $project: { verified: true } }],
        as: 'player'
      }
    },
    { $unwind: { path: '$player' } },
    { $group: { _id: '$role', players: { $push: '$player' } } }
  ])
}

export function applyRoleTemplate (roleTemplate) {
  roleTemplate.forEach((role) => {
    role.players.forEach((player) => {
      guild.members.fetch(player._id).then((member) => {
        if (!member._roles.includes(role._id[0]) && player.verified === 2) {
          addRole(player._id, role._id[0])
          // console.log(`Adding role ${role._id[0]} to member ${player._id}`)
          // } else {
          //   console.log(`Passed over member ${player._id}`)
        }
      })
    })
  })
}

const job = new CronJob(process.env.ROLE_CRON, async function () {
  applyRoleTemplate(await getRoleTemplate())
})

client.login(process.env.DISCORD_BOT_TOKEN)
