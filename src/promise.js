require('./db/mongoose')

const Task = require('./models/task')

// Task.findByIdAndDelete('5ebe9078b731b90b261aefa8').then((task)=>{
//     console.log(task)
//     return Task.countDocuments({completed: false})
// }).then((result)=>{
//     console.log(result)
// }).catch((e)=>{
//     console.log(e)
// })

const deleteTaskAndCount = async (id) => {
    const task = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({completed: false})
    return {task, count}
}

deleteTaskAndCount('5ebe9075b731b90b261aefa7').then((result)=>{
    console.log(result)
}).catch((e)=>{
    console.log(e)
})