import { Client, Events, GatewayIntentBits } from 'discord.js'

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
})

export async function addRole (userSnowflake, roleSnowflake) {
  return await guild.members.addRole({
    user: userSnowflake,
    role: roleSnowflake
  })
}
export async function removeRole (userSnowflake, roleSnowflake) {
  return await guild.members.removeRole({
    user: userSnowflake,
    role: roleSnowflake
  })
}
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

client.login(process.env.DISCORD_BOT_TOKEN)
