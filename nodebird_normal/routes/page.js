const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', {titlie : '내정보 - NodeBird', user : req.user});
});

router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', {
        titlie : '회원가입 - NodeBird',
        user : req.user,
        joinError : req.flash('joinError')
    });
});

router.get('/', (req, res, next) => {
    res.render('main', {
        titlie : 'NodeBird',
        twits : [],
        user : req.user,
        loginError : req.flash('loginError')
    })
});

module.exports = router;