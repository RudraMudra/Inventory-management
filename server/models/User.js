const mongoose = require('mongoose');
const bcyrpt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    role: {
        type: String,
        enum: ['admin', 'viewer'],
        default: 'viewer'
    }
});

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcyrpt.hash(this.password, 8);
    }
    next();
});

userSchema.methods.comparePassword = async function(password){
    return await bcyrpt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);