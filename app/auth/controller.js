const Player = require('../player/models')
const path = require('path')
const fs = require('fs')
const config = require('../../config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
    signup: async (req, res, next) => {
        try {
            const payload = req.body

            if (req.file) {
                let tmp_path = req.file.path
                let originaEXt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]
                let filename = req.file.filename + '.' + originaEXt
                let target_path = path.resolve(config.rootPath, `public/uploads/${filename}`)

                const src = fs.createReadStream(tmp_path);
                const dest = fs.createWriteStream(target_path);

                src.pipe(dest);

                src.on('end', async () => {
                    try {
                        const player = new Player({ ...payload, avatar: filename })
                        
                        await player.save(); 

                        delete player._doc.password 

                        res.status(201).json({ data : player })
                    } catch (err) {
                        if (err && err.name === 'ValidationError') {
                            return res.status(422).json({
                                error: 1,
                                message: err.message,
                                fields: err.errors
                            })
                        }

                        next(err)
                    }
                });

                src.on('err', async () => {
                    next()
                })
            } else {
                let player = new Player(payload)

                await player.save()

                delete player._doc.password 

                res.status(201).json({ data : player })
            }
            
        } catch (error) {
            if (error && error.name === 'ValidationError') {
                return res.status(422).json({
                    error: 1,
                    message: error.message,
                    fields: error.errors
                })
            }

            next(error)
        }
    },

    signin: async (req, res, next) => {
        const { email, password } = req.body

        Player.findOne({ email: email }).then((player) => {
            if (player) {
                const checkPassword = bcrypt.compareSync(password, player.password)

                if (checkPassword) {
                    const token = jwt.sign({
                        player : {
                            id : player.id,
                            username : player.username,
                            email : player.emaiil,
                            nama : player.nama,
                            phoneNumber: player.phoneNumber,
                            avatar : player.avatar,
                        }
                    }, config.jwtKey)

                    res.status(200).json({
                        data: {token}
                    })
                } else {
                    res.status(403).json({
                        message: 'Password yang Anda masukkan salah.'
                    })
                }
            } else {
                res.status(403).json({
                    message: 'Email yang Anda masukkan belum terdaftar.'
                })
            }
        }).catch((err) => {
            res.status(500).json({
                message: err.message || `Internal server error`
            })

            next()
        })
    },

}