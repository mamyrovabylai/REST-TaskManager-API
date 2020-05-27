const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelationEmail} = require('../email/account')



router.post('/users', async (req, res)=>{

    const user = new User (req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        
        return res.status(201).send({user, token})
    } catch (e){
        return res.status(400).send(e)
    }
    
})

router.post('/users/login', async(req, res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user: user, token}) // overriden toJSON() in userSchema.methods
    } catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


router.get('/users', auth, async (req, res)=>{

    try {
       const users =  await User.find({})
       return res.status(200).send(users)
    } catch(e) {
        return res.status(500).send()
    }
})

//profile
router.get('/users/me', auth, async(req,res)=>{
    res.send(req.user)
})


router.get('/users/:id', async (req, res)=>{
    const _id = req.params.id 
    try{
        const user = await User.findById(_id)
        if(!user) return res.status(404).send()
        return res.status(200).send(user)
    } catch(e) {
        return res.status(500).send()
    }
})

router.patch('/users/me',auth, async (req, res)=>{
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send()
    }

    try{
        const user = req.user
        updates.forEach((update)=>{
            user[update] = req.body[update]
        })
        
        await user.save()
        return res.send(user)
    } catch (e){
        return res.status(500).send()
    }
})


router.patch('/users/:id', async (req, res)=>{
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send()
    }

    try{
        //const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        
        const user = await User.findById(_id)

        updates.forEach((update)=>{
            user[update] = req.body[update]
        })

        await user.save()

        if(!user) return res.status(404).send()
        return res.send(user)
    } catch (e){
        return res.status(500).send()
    }
})

router.delete('/users/me', auth, async (req, res) =>{
    
    try {
        sendCancelationEmail(req.user.email, req.user.name)
        await req.user.remove()
        return res.send(req.user)
    } catch(e){
        return res.status(500).send(e)
    }
})

router.delete('/users/:id', async (req, res) =>{
    const _id = req.params.id

    try {
        const user = await User.findByIdAndDelete(_id)
        if(!user) return res.status(404).send()
        return res.send(user)
    } catch(e){
        return res.status(500).send(e)
    }
})


const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please, use an image file'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar') , async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async(req, res) =>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) throw new Error()

        res.set('Content-Type','image/png')
        res.send(user.avatar)

    } catch(e){
        res.status(404).send(e)
    }
})



module.exports = router
