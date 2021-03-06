const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken, deprecated } = require('../routes/middlewares');
const { Domain, User, Post, Hashtag } = require('../models');

const router = express.Router();

router.use(deprecated);

router.post('/token', async (req, res) => {
    const { clientSecret } = req.body;
    try{
        const domain = await Domain.find({
            where : { clientSecret },
            include : {
                model : User,
                attribute : ['nick', 'id']
            }
        });
        if(!domain){
            return res.status(401).json({
                code : 401,
                message : '등록되지 않은 도메인입니다. 먼저 도메인을 등록해주세요'
            });
        }
        const token = jwt.sign({
            id : domain.user.id,
            nick : domain.user.nick,
        }, process.env.JWT_SECRET, {
            expiresIn : '1m',    //1분
            MESSAGE : '토큰이 발급되었습니다.',
            token
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            code : 500,
            message : '서버 에러'
        });
    }
});

router.get('/test', verifyToken, (req, res) => {
    res.json(req.decoded);
})

router.get('/posts/my', verifyToken, (req, res) => {
    Post.findAll({ where : { userId : req.decoded.id }})
        .then((posts) => {
            console.log(posts);
            res.json({
                code : 200,
                payload : posts
            });
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({
                code : 500,
                message : '서버에러'
            });
        });
});

router.get('/posts/hashtag/:title', verifyToken, async(req, res) => {
    try{
        const hashtag = await Hashtag.find({where : {title : req.params.title}});
        if(!hashtag){
            return res.status(404).json({
                code : 404,
                message : '검색 결과가 없습니다.'
            });
        }
        const posts = await hashtag.getPost();
        return res.json({
            code : 200,
            payload : posts
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            code : 500,
            message : '서버 에러'
        });
    }
});
/*
    자신이 올린 포스트와 해시태그를 검색하는 라우터 및 서비스를 작성함.
*/
module.exports = router;