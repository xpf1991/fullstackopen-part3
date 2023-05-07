require('dotenv').config()
const express = require('express')
const Note = require('./models/note')

const app = express()

app.use(express.static('build'))
app.use(express.json())

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('---')
    /* 
       目前看中间件是在下文app.post等运行前执行，
       也即中间件函数在路由事件处理程序被调用前执行

       注意：这里中间件无法输出response值，下述都是undefined,
        console.log('Response:', response.PORT)
        console.log('Response:', response.body)
       因为response根本没有被定义
       需要特别注意：中间件的执行顺序与它们通过app.use函数加载到 express 中的顺序相同
    */
    next()
}
app.use(requestLogger)

/*
let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2022-05-30T17:30:31.098Z",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2022-05-30T18:39:34.091Z",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2022-05-30T19:20:14.298Z",
        important: true
    }
]
*/

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
    /*
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    console.log(note, typeof (note))
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
    */
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
        .then(result => {
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

app.put('/api/notes/:id', (request, response, next) => {
    const body = request.body
    const note = {
        content: body.content,
        important: body.important
    }

    Note.findByIdAndUpdate(request.params.id, note, { new: true })
        .then(updateNote => response.json(updateNote))
        .catch(error => next(error))
})

app.post('/api/notes', (request, response) => {
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
    note.save().then(savedNote => {
        response.json(savedNote)
    })
    console.log('save after')
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = ((error, request, response, next) => {
    console.error(error.message)

    if (error.name = 'CastError') {
        return response.status(404).send({ error: 'malformatted id' })
    }

    next(error)
})
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
