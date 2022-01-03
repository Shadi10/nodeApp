const User = require('../models/User');
const {
    validationResult
} = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signUp = async(req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    try{
    const hashedPassword = await bcrypt.hash(password, 12)
            const user = new User({
                email: email,
                name: name,
                password: hashedPassword
            });
            const result = await user.save()
            res.status(201).json({
                message: "User account created Successfully"
            })
        } catch(error) {
            if (!error.statusCode)
                error.statusCode = 500;
            next(error);
        }

}
exports.login = async(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try{
    const user = await User.findOne({
        email: email,
    })
        if (!user) {
            const error = new Error('A user with this email could not be found');
            error.statusCode = 404;
            throw error
        }
        loadedUser = user;
        const passwordMatched = await bcrypt.compare(password, user.password)
        if (!passwordMatched) {
            const error = new Error('Password is incorrect');
            error.statusCode = 404;
            throw error;
        }
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 'someveryhugesecret', {
            expiresIn: '1h'
        });
        res.status(200).json({token : token , userId : loadedUser._id.toString() });

    } catch(error) {
        if (!error.statusCode){
            error.statusCode = 500;
        }
            next(error);
    }
}