import mongoose from 'mongoose'
const { Schema, Types } = mongoose

// TODO validation

const userSchema = new Schema({
    snowflake: {
        type: String,
        unique: true
    },
    username: String,
    discriminator: Number,
    avatar: String,
    auth: {
        type: Map,
        of: String
    }
})

const playerSchema = new Schema({
    snowflake: {
        type: String,
        unique: true
    },
    username: String,
    discriminator: Number,
    captain: {
        type: Types.ObjectId,
        ref: 'User',
        immutable: true
    },
    verified: Boolean,

    // sensitive info:
    name: String,
    school: String
})

const assignmentSchema = new Schema({
    player: {
        type: Types.ObjectId,
        ref: 'Player'
    },
    scoresaber: String,
    gamertag: String
})

const teamSchema = new Schema({
    name: String,
    captain: {
        type: Types.ObjectId,
        ref: 'User',
        immutable: true
    },
    logo: Buffer,
    region: String,
    players: [assignmentSchema]
})

const divisionSchema = new Schema({
    name: String,
    game: String,
    open: Boolean,
    admin: {
        type: Types.ObjectId,
        ref: 'User',
        immutable: true
    },
    desc: String,
    minPlayers: Number,
    maxPlayers: Number,
    teams: [
        {
            type: Types.ObjectId,
            ref: 'Team'
        }
    ],
    playerRole: String,
    captainRole: String
})

// TODO error handling
mongoose.connect(process.env.MONGODB_URI)

export const User = mongoose.model('User', userSchema)
export const Player = mongoose.model('Player', playerSchema)
export const Assignment = mongoose.model('Assignment', assignmentSchema)
export const Team = mongoose.model('Team', teamSchema)
export const Division = mongoose.model('Division', divisionSchema)
