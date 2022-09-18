import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const userSchema = new Schema({
    snowflake: {
        type: String,
        unique: true
    },
    username: String,
    discriminator: Number,
    roles: [String],
    avatar: String,
    auth: {
        type: Map,
        of: String
    }
});

const roleSchema = new Schema({
    snowflake: {
        type: String,
        unique: true
    },
    name: String,
    color: String,
    approved: Boolean,
    verified: Boolean
});

const playerSchema = new Schema({
    snowflake: {
        type: String,
        unique: true
    },
    username: String,
    discriminator: Number,
    captain: {
        type: Types.ObjectId,
        ref: 'User'
    },
    verified: Boolean,
    roles: [String],

    // sensitive info:
    name: String,
    school: String,
    verification: Buffer,
    streamID: {
        type: Types.ObjectId,
        default: new Types.ObjectId
    }
});

const assignmentSchema = new Schema({
    player: {
        type: Types.ObjectId,
        ref: 'Player'
    },
    scoresaber: String,
    gamertag: String
});

const teamSchema = new Schema({
    name: String,
    captain: {
        type: Types.ObjectId,
        ref: 'User'
    },
    logo: Buffer,
    region: String,
    players: [assignmentSchema]
});

const divisionSchema = new Schema({
    name: String,
    game: String,
    open: Boolean,
    admin: {
        type: Types.ObjectId,
        ref: 'User'
    },
    logo: Buffer,
    desc: String,
    minPlayers: Number,
    maxPlayers: Number,
    teams: [{
        type: Types.ObjectId,
        ref: 'Team'
    }],
    playerRole: {
        type: Types.ObjectId,
        ref: 'Role'
    },
    captainRole: {
        type: Types.ObjectId,
        ref: 'Role'
    }
});

//TODO error handling
mongoose.connect(process.env.MONGODB_URI);

export default db = mongoose.connection;
export const User = mongoose.model('User', userSchema);
export const Role = mongoose.model('Role', roleSchema);
export const Player = mongoose.model('Player', playerSchema);
export const Assignment = mongoose.model('Assignment', assignmentSchema);
export const Team = mongoose.model('Team', teamSchema);
export const Division = mongoose.model('Division', divisionSchema);