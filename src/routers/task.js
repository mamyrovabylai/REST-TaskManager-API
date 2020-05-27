const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks',auth, async (req, res)=>{
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save()
        return res.status(201).send(task)
    } catch(e){
        return res.status(400).send(e)
    }
})


router.get('/tasks',auth ,async (req, res)=>{
    try{
        // const tasks = await Task.find({
        //     owner: req.user._id
        // })
        const match = {}
        const completed = req.query.completed
        if(completed){
            match.completed = completed === 'true'
        }
        
        sort = {}
        const sortBy = req.query.sortBy
        if(sortBy){
            const params = sortBy.split(':')
            sort[params[0]] = params[1] === 'desc'? -1 : 1
        }


        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        const tasks = req.user.tasks
        return res.status(200).send(tasks)
    } catch(e){
        return res.status(500).send()
    }
})


router.get('/tasks/:id', auth,async (req, res)=>{
    const _id = req.params.id

    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })
        if(!task) return res.status(404).send()
        return res.send(task)
    } catch(e){
        return res.status(500).send()
    }
})



router.patch('/tasks/:id', auth ,async(req, res)=>{
    
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
    
    if(!isValidOperation) return res.status(400).send()

    try{
        
        //const task = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })
        if(!task) return res.status(404).send()
        
        updates.forEach((update)=>{
            task[update] = req.body[update]
        })
        await task.save()
        
        
        return res.send(task)
    } catch(e){
        return res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id

    try {
        //const task = await Task.findByIdAndDelete(_id)
        const task = await Task.findOneAndDelete({
            _id,
            owner: req.user._id
        })
        if(!task) return res.status(404).send()
        return res.send(task)
    } catch(e){
        return res.status(500).send()
    }
})

module.exports = router
