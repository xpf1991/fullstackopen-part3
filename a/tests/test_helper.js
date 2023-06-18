const Note = require('../models/note')
const User = require('../models/user')

const initialNotes = [
    {
        content: 'HTML is easy',
        date: new Date(),
        important: false
    },
    {
        content: 'Browser can execute only Javascript',
        date: new Date(),
        important: true
    }
]

const nonExistingId = async () => {
    const note = new Note({ content: 'willremovethissoon', date: new Date() })
    await note.save()
    await note.remove()
    return note._id.toString()
}

const notesInDb = async () => {
    const notes = await Note.find({})
    const notesToJSON = notes.map(note => note.toJSON())
    /*  notes 与 notesToJSON 主要差距在于_id, __v
        原因在于models/note.js 中的noteSchema.set('toJSON'...）
        另外，如果直接用 app.get, app.post等方法，由于返回时 response.json()，
        已经默认将数据库中的data 'json'化，会自动调用'toJSON'方法
        console.log('notes:', notes)
        console.log('notes toJSON:', notesToJSON)
    */
    return notesToJSON
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    initialNotes, nonExistingId, notesInDb, usersInDb
}