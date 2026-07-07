const express = require('express');
const router = express.Router();
const getConnection = require('../config/db');
const {isValidUrl, getRandomStr} = require('../public/js/main');
const {v4: uuidv4} = require('uuid');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

router.get('/dashboard', async (req, res) => {
    let user_id = req.session.user_id;
    if (!user_id) {
        return res.redirect('/login');
    }
    let q = 'SELECT * FROM urls WHERE user_id = ?';
    let db = await getConnection();
    try {
        let [urls] = await db.query(q, user_id);
        res.render('dashboard', {urls, baseUrl: process.env.BASE_URL});
    } catch (err) {
        console.log(err);
        res.send("Something went wrong in DB");
    }
});

router.get('/create-url', async (req, res) => {
    let user_id = req.session.user_id;
    if (!user_id) {
        return res.redirect('/login');
    }
    res.render('create-url');
});

router.post('/create-url', async (req, res) => {
    let { url } = req.body;
    if (isValidUrl(url)) {
        let id = uuidv4();
        let str = getRandomStr();
        let user_id = req.session.user_id;
        let q = `INSERT INTO urls (id, url, short_url, user_id) VALUE ('${id}', '${url}', '${str}', '${user_id}')`;
        try {
            let db = await getConnection();
            let [result] = await db.query(q);
            res.redirect('/dashboard');
        } catch (err) {
            console.log(err);
            res.send('Something went wrong in DB');
        }
    } else {
        return res.render('create-url', {error: 'Invalid URL'});
    }
});

router.get('/url/:short_url', async (req, res) => {
    let { short_url } = req.params;
    let q = `SELECT * FROM urls WHERE short_url = ?`;
    try {
        let db = await getConnection();
        let [url_info] = await db.query(q, short_url);
        res.redirect(url_info[0].url);
    } catch (err) {
        console.log(err);
        res.send('Something went wrong in DB');
    }
});

router.delete('/delete-url/:id', async (req, res) => {
    let { id } = req.params;
    let q = 'DELETE FROM urls WHERE id = ?';
    try {
        let db = await getConnection();
        let [url_info] = await db.query(q, id);
        res.redirect('/dashboard');

    } catch (err) {
        console.log(err);
        res.send('Something went wrong in DB');
    }
});

module.exports = router;