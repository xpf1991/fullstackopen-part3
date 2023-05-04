const mongoose = require('mongoose')

const url = process.env.MONGODB_URL

console.log('connecting to ', url)

mongoose.connect(url)
    .then(result=>{
        console.log('connected to mongoDB')
    })
    .catch(error=>{
        console.log('error connecting to mongoDB', error.message)
    })

const noteSchema = mongoose.Schema({
    content: String,
    date: Date,
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