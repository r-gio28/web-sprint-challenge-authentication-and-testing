const server = require('./server')
const request = require('supertest')
const db = require('../data/dbConfig')

test('sanity', () => {
  expect(true).toBe(true)
});

beforeAll( async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
});

afterAll( async () => {
  await db.destroy()
});

beforeEach( async () => {
  await request(server).post('/api/auth/register')
    .send({username: "Gio", password: "winteriscoming"})
})

describe('[POST] /register', () => {
  test('adds user to database', async () => {
    const users = await db('users')
    expect(users).toHaveLength(1)
  })
  test('responds with newly created user', async () => {
    const users = await db('users')
    expect(users[0].username).toEqual('Gio')
  })
})

describe('[POST] /login', () => {
  let login
  beforeEach( async () => {
    login = await request(server).post('/api/auth/login')
      .send({
        username: "Gio",
        password: "winteriscoming"
      })
  })
  test('user can login successfully', async () => {
    expect(login.text).toMatch('token')
  })
  test('responds with successful login message', async () => {
    expect(login.text).toMatch('welcome back, Gio')
  })
})