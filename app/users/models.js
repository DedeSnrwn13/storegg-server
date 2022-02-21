const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    email: {
        type: String,
        require: [true, 'Enail harus diisi']
    },
    name: {
        type: String,
        require: [true, 'Nama harus diisi']
    },
    password: {
        type: String,
        require: [true, 'Kata Sandi harus diisi']
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'admin'
    },
    status: {
        type: String,
        enum: ['Y', 'N'],
        default: 'Y',
    },
    phoneNumber: {
        type: String,
        require: [true, 'Nomor Telepon harus diisi']
    },
}, {timestamps: true})

module.exports = mongoose.model('User', userSchema)