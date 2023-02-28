import mongoose from 'mongoose'
const { Schema } = mongoose

// TODO validation

const userSchema = new Schema({
  _id: String, // discord snowflake
  username: String,
  discriminator: Number,
  avatar: String,
  roles: Array,
  auth: {
    type: Map,
    of: String
  }
})

const playerSchema = new Schema({
  _id: String, // discord snowflake
  username: String,
  discriminator: Number,
  captain: {
    type: String,
    ref: 'User'
  },
  verified: Number, // -1:denied, 0:none provided, 1:pending, 2:yes

  // sensitive info:
  name: String,
  school: String,
  verification: {
    type: Map,
    of: String
  }
})

const assignmentSchema = new Schema({
  player: {
    type: String,
    ref: 'Player'
  },
  scoresaber: String,
  gamertag: String
})

const teamSchema = new Schema({
  name: String, // name
  captain: {
    type: String,
    ref: 'User'
  },
  division: {
    type: String,
    ref: 'Division'
  },
  locale: String,
  players: [assignmentSchema],
  logo: {
    type: Map,
    of: String
  }
})

const divisionSchema = new Schema({
  name: String, // name, required
  game: String, // required
  open: Boolean, // required
  admin: [String], // snowflake, username, discriminator, nickname
  desc: String,
  minPlayers: Number, // not negative
  maxPlayers: Number, // not negative
  playerRole: [String] // snowflake, name
  // captainRole: [String] // snowflake, name
})

mongoose.set('strictQuery', false)
// TODO error handling
mongoose.connect(process.env.MONGODB_URI)

export const User = mongoose.model('User', userSchema)
export const Player = mongoose.model('Player', playerSchema)
export const Assignment = mongoose.model('Assignment', assignmentSchema)
export const Team = mongoose.model('Team', teamSchema)
export const Division = mongoose.model('Division', divisionSchema)
