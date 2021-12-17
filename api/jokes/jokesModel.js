const db = require('../../data/dbConfig')

const add = async (newUser) => {
    const [id] = await db('users').insert(newUser)
    return findByUserId(id)
}

const findUsers = () => {
    return db('users')
}