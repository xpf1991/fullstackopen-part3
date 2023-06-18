const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', async (request, response) => {
    const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
    response.json(notes)
})

notesRouter.get('/:id', async (request, response, next) => {
    try {
        const note = await Note.findById(request.params.id)
        if (note) {
            response.json(note)
        } else {
            response.status(404).end
        }
    } catch (error) {
        next(error)
    }

    /* old version
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
    */
})

notesRouter.delete('/:id', async (request, response, next) => {
    try {
        await Note.findByIdAndDelete(request.params.id)
        response.status(204).end()
    } catch (error) {
        next(error)
    }
    /*
    Note.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
    */
    /*
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
    response.status(204).end()
    */
})

/*
const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(note => note.id))
        : 0
    return maxId + 1
}
*/

notesRouter.put('/:id', (request, response, next) => {
    const body = request.body
    const note = {
        content: body.content,
        important: body.important
    }

    Note.findByIdAndUpdate(request.params.id, note, { new: true, runValidators: true, context: 'query' })
        .then(updateNote => response.json(updateNote))
        .catch(error => next(error))
})

notesRouter.post('/', async (request, response, next) => {
    const body = request.body
    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const user = await User.findById(body.userId)
    console.log('user.notes is:', user.notes)

    const note = new Note({
        //id: generateId(),
        date: new Date(),
        content: body.content,
        important: body.important || false,
        user: user._id
    })

    try {
        const savedNote = await note.save()
        user.notes = user.notes.concat(savedNote._id)
        await user.save()
        response.status(201).json(savedNote)
    } catch (exception) {
        next(exception)
    }
    /* old version
    note.save()
        .then(savedNote => {
            response.status(201).json(savedNote)
        })
        .catch(error => next(error))
    */

})

module.exports = notesRouter