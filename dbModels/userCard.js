
const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});
    
const CardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    tag: { type: String, required: true },
    image: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to the user
});

const User = mongoose.model('User', UserSchema);
const Card = mongoose.model('Card', CardSchema);

module.exports = { User, Card };