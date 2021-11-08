const mongoose = require('mongoose')
const Schema = mongoose.Schema

const slotSchema = new Schema({
    slotid: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type:String,
    },
    status: {
        type:String,
        required:true
    },
    enteredat: {
        type:Date
    },
    leftat: {
        type:Date
    }
})

module.exports = mongoose.model('Slot', slotSchema)