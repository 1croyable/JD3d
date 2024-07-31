const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'RouteJoyeuse';

router.get('/verify-token', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ success: false, message: '未提供Token' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ success: false, message: 'Token无效或已过期' });
        }

        res.send({ success: true, message: 'Token有效' });
    });
});

router.get('/vertify-token-return-name', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ success: false, message: '未提供Token' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ success: false, message: 'Token无效或已过期' });
        }
        res.send({ success: true, message: 'Token有效', userId: decoded.userId });
    });
})

module.exports = router;
