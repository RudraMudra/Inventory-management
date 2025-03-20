const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res)=> {
    try{
        const {username, password, role} = req.body;
        const user = new User({username, password, role : role || 'viewer'});
        await user.save();
        res.status(201).json({message: 'User created successfully'});
    }catch(err){
        res.status(400).json({message: err.message});
    }
});

router.post('/login', async (req, res)=> {
    try{
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if(!user || !(await user.comparePassword(password))){
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const token = jwt.sign({id: user._id, role: user.role},process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({token, role: user.role});
    } catch(err){
        res.status(500).json({message: "Internal server error"});
    }
});

module.exports = router;