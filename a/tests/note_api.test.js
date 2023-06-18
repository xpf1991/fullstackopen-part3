const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Note = require('../models/note')
const bcrypt = require('bcrypt')
const User = require('../models/user')

beforeEach(async () => {
    await Note.deleteMany({})
    /*重点：关于异步函数执行顺序问题： 
      下述返回结果是正常的：cleared saved saved done
    */
    console.log('cleared')
    for (let note of helper.initialNotes) {
        let noteObject = new Note(note)
        await noteObject.save()
        console.log('saved')
    }
    console.log('done')

    /* 下述返回结果是不对的： cleared done saved saved
       原因：在forEach独立函数中，beforeEach函数执行不会等待独立函数中的await执行完毕
    console.log('cleared')
    helper.initialNotes.forEach(async (note) => {
        let noteObject = new Note(note)
        await noteObject.save()
        console.log('saved')
    })
    console.log('done')
    */
})

describe('note-api', () => {
    test('notes are returned as json', async () => {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        // console.log(typeof (/application\/json/)); //Object
        // console.log(/application\/json/ === 'application\/json') //false
    })

    test('notes has two element', async () => {
        const response = await api.get('/api/notes')
        //console.log('response is:', response)
        //console.log('response-body is:', response.body)
        expect(response.body).toHaveLength(helper.initialNotes.length)
    })

    test('notes content contains Browser can execute only Javascript', async () => {
        const response = await api.get('/api/notes')
        const contents = response.body.map(note => note.content)
        //console.log('contents is:', contents)
        expect(contents).toContain('Browser can execute only Javascript')
    })

    test('a valid note can be added', async () => {
        const newNote = {
            content: 'async/await simplifies making async calls',
            important: true,
        }

        await api
            .post('/api/notes')
            .send(newNote)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const notesAtEnd = await helper.notesInDb()
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)
        const contents = notesAtEnd.map(note => note.content)
        expect(contents).toContain(newNote.content)
    })

    test('note without content is not added', async () => {
        const newNote = {
            important: true
        }

        await api
            .post('/api/notes')
            .send(newNote)
            .expect(400)

        const notesAtEnd = await helper.notesInDb()
        expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
    })

})

describe('error-handle', () => {
    test('a specific note can be viewed', async () => {
        const notesAtStart = await helper.notesInDb()

        const noteToView = notesAtStart[0]

        const resultNote = await api
            .get(`/api/notes/${noteToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
        /* processedNoteToView 与 noteToView 不同在于 date 属性差异
        console.log('noteToView :', noteToView)
        console.log('processedNoteToView :', processedNoteToView)
        console.log('resultNote.body', resultNote.body)
        */

        expect(resultNote.body).toEqual(processedNoteToView)
    })

    test('a note can be deleted', async () => {
        const notesAtStart = await helper.notesInDb()
        const noteToDelete = notesAtStart[0]

        await api
            .delete(`/api/notes/${noteToDelete.id}`)
            .expect(204)

        const notesAtEnd = await helper.notesInDb()

        expect(notesAtEnd).toHaveLength(
            helper.initialNotes.length - 1
        )

        const contents = notesAtEnd.map(r => r.content)

        expect(contents).not.toContain(noteToDelete.content)
    })
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
        await user.save()

        const passwordHash2 = await bcrypt.hash('xxx', 10)
        const user2 = new User({ username: 'power', name: "xpf", passwordHash: passwordHash2 })
        await user2.save()
    }, 10000)

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('username must be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
})

afterAll(() => {
    mongoose.connection.close()
})