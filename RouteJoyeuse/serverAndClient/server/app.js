var express = require('express');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var vertify = require('./routes/vertify');
var srt = require('./routes/srt');
var animation = require('./routes/3D');
var userInfoFileControl = require('./routes/userInfoFileControl');
var note = require('./routes/note');

const compression = require('compression');

var app = express();
app.use(compression()); // 使用compression中间件进行数据压缩

app.use(logger('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/vertify', vertify);
app.use('/srt', srt);
app.use('/userInfoFileControl', userInfoFileControl);
app.use('/note', note);
app.use('/3D', animation);

//支持跨域
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.header('X-Powered-By', ' 3.2.1')
    req.method == "OPTIONS" ? res.send(200) : next()
})

module.exports = app;
