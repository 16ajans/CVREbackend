import axios from 'axios'

const instance = axios.create({
    baseURL: 'https://discord.com/api'
})

export const authorizationURL = encodeURI('https://discord.com/api/oauth2/authorize' +
    '?response_type=code' +
    `&client_id=${process.env.DISCORD_OAUTH_ID}` +
    `&scope=${process.env.DISCORD_OAUTH_SCOPES}` +
    `&redirect_uri=${process.env.DISCORD_OAUTH_REDIRECT_URI}` +
    '&prompt=none')

// TODO error handling

export async function getTokenResponse (code) {
    const res = await instance.post('/oauth2/token',
        new URLSearchParams({
            client_id: process.env.DISCORD_OAUTH_ID,
            client_secret: process.env.DISCORD_OAUTH_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.DISCORD_OAUTH_REDIRECT_URI
        }).toString())
    return res.data
};

export async function revokeToken (token) {
    const res = await instance.post('/oauth2/token/revoke',
        new URLSearchParams({
            client_id: process.env.DISCORD_OAUTH_ID,
            client_secret: process.env.DISCORD_OAUTH_SECRET,
            token
        }).toString(),
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return res.data
};

export async function getCurrentUser (token) {
    const res = await instance.get('/users/@me', {
        headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
};

export async function getGuildRoles (token) {
    const res = await instance.get(`/users/@me/guilds/${process.env.GUILD_ID}/member`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.roles
};
