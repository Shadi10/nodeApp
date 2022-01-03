const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const app = express();

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);

app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    });
});

mongoose.connect("mongodb+srv://1stDb:QAI9NAG7ESH24ZI0@cluster0.gxlun.mongodb.net/messages?retryWrites=true&w=majority")
    .then(result => {
       const server =  app.listen(8080);
        console.log("connected");
        const io = require('socket.io')(server, {
            cors: {
                origin: "http://localhost:8080",
                methods: ["GET", "POST"]
              }
        });
        io.on('connection', (stream) => {
            console.log('someone connected!');
            });
    }).catch(err => {
        console.log(err);
    })