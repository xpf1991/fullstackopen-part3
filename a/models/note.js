const mongoose = require('mongoose')
const config = require('../utils/config')

const url = config.MONGODB_URL

console.log('connecting to ', url)

mongoose.connect(url)
    .then(() => {
        console.log('connected to mongoDB')
    })
    .catch(error => {
        console.log('error connecting to mongoDB', error.message)
    })

const noteSchema = mongoose.Schema({
    content: {
        type: String,
        minLength: 5,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    important: Boolean
})

noteSchema.set('toJSON', {
    transform: (document, returnedObj) => {
        returnedObj.id = returnedObj._id.toString()
        delete returnedObj._id
        delete returnedObj.__v
    }
})

module.exports = mongoose.model('Note', noteSchema)