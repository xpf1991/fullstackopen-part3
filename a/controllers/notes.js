const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

notesRouter.get('/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

notesRouter.delete('/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
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

notesRouter.post('/', (request, response, next) => {
    const body = request.body
    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        //id: generateId(),
        date: new Date(),
        content: body.content,
        important: body.important || false
    })

    console.log('save before')
    note.save()
        .then(savedNote => {
            response.json(savedNote)
        })
        .catch(error => next(error))
    console.log('save after')
})

module.exports = notesRouter