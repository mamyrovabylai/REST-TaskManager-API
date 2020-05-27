// CRUD create read update delete
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect(connectionURL,{useNewUrlParser: true}, (error, result)=>{
    if(error){
        return console.log("Error in connecting to the mongodb")
    }

    const db = result.db(databaseName)
    // db.collection('users').insertOne({
    //     name: 'Abylaikhan',
    //     age: 19.8
    // })

    db.collection('tasks').insertMany([
        {
            description: "First task",
            completed: true
        }, {
            description: "Second woman",
            completed: true
        }
    ], (error, response)=>{
        if(error){
            return console.log(error)
        }
        console.log(response.ops)
    })
})

