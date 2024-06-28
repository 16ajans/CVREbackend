import mongoose from 'mongoose'
const { Schema } = mongoose

// TODO validation

const userSchema = new Schema({
  _id: String, // discord snowflake
  username: String, // unique uname
  global_name: String, // display name
  avatar: String,
  roles: Array,
  auth: {
    type: Map,
    of: String
  },
  state: {
    type: String,
    enum: ['awaiting', 'pending', 'accepted', 'manager']
  },

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
    ref: 'User'
  },
  team: {
    type: Schema.ObjectId,
    ref: 'Team'
  },
  gamertag: String,
  scoresaber: String,
  state: {
    type: String,
    enum: ['pending', 'accepted']
  }
})

const teamSchema = new Schema({
  name: String,
  owner: {
    type: String,
    ref: 'User'
  },
  division: {
    type: Schema.ObjectId,
    ref: 'Division'
  },
  logo: {
    type: Map,
    of: String
  }
})

const divisionSchema = new Schema({
  name: String, // name, required
  game: String, // required
  open: Boolean, // required
  admin: {
    type: String,
    ref: 'User'
  },
  desc: String,
  minPlayers: Number, // not negative
  maxPlayers: Number, // not negative
  playerRole: String, // role snowflake
  captainRole: String // role snowflake
})

mongoose.set('strictQuery', true)
// TODO error handling
mongoose.connect(process.env.MONGODB_URI)

export const User = mongoose.model('User', userSchema)
export const Assignment = mongoose.model('Assignment', assignmentSchema)
export const Team = mongoose.model('Team', teamSchema)
export const Division = mongoose.model('Division', divisionSchema)
