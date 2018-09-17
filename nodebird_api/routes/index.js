const express = require('express');
const uuidv4 = require('uuid/v4');
const { User, Domain } = require('../models');

const router = express.Router();
const URL = 'http://localhost:8002/v1';

const request = async(req,api) => {
    try{
        if(!req.session.jwt){
            const tokenResult = await axios.post(`${URL}/token`,{
                clilentSecret : process.env.CLIENT_SECRET
            });
            req.session.jwt = tokenResult.data.token;
        }
        return await axios.get(`${URL}${api}`, {
            headers : { authorization : req.session.jwt }
        }); // API 요청
    }catch(error){
        console.error(error);
        if(error.response.status < 500){    // 410, 419처럼 의도된 에러면 발생
            return error.response;
        }
        throw error;
    }
}

router.get('/mypost', async(req, res, next) => {
    try{
        const result = await request(req, '/posts/my');
        res.json(result.data);
    }catch(error){
        console.error(error);
        next(error);
    }
});

router.get('/search/:hashtag', async(req, res, next) => {
    try{
        const result = await request(
            req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`
        );
        res.json(result.data);
    }catch(error){
        if(error.code){
            console.error(error);
            next(error);
        }
    }
})

router.get('/', (req, res, next) => {
    User.find({
        where : { id : req.usr && req.user.id },
        include : {model : Domain }
    })
    .then((user) => {
        res.render('login', {
            user,
            loginError : req.flash('loginError'),
            domains : user && user.domains
        });
    })
    .catch((error) => {
        next(error);
    });
});

router.post('/domain', (req, res, next) => {
    Domain.create({
        userId : req.user.id,
        host : req.body.host,
        type : req.body.type,
        clientSecret : uuidv4()
    })
     .then( () => {
         res.redirect('/');
     })
     .catch((error) => {
         next(error);
     });
});

module.exports = router;