import 'dotenv/config' // FIXME: temporary for testing
import { Client, Events } from 'discord.js'

// TODO: understand if i need gateway intents
const client = new Client({ intents: [] })
let guild

client.once(Events.ClientReady, async (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
    guild = c.guilds.resolve(process.env.GUILD_ID)

    // console.log(guild.members.me.permissions.toArray());
})

// TODO: watch gateway for captain and player role changes
// propogate to db and set verified/approved status accordinnpmgly

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
    // let roleList = roles.map((role) => [role.position, role.id, role.name]);
    const roleList = roles.map((role) => role.id)
    // roleList.sort((a, b) => {
    // return b[0] - a[0];
    // });
    return roleList
}

export async function fetchGuildMember (username, discriminator) {
    const members = await guild.members.fetch({ query: username })
    return members.find((member) =>
        member.user.discriminator.includes(discriminator)
    )
}

client.login(process.env.DISCORD_BOT_TOKEN)
