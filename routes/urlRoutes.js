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

router.get('/edit-url/:id', async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    let { id } = req.params;
    try {
        let db = await getConnection();
        let q = `SELECT * FROM urls where id = ?`;
        let [url_info] = await db.query(q, id);
        let urlDetails = [url_info[0].url, url_info[0].short_url, url_info[0].id];
        res.render('edit-url', {urlDetails});
    } catch (err) {
        console.log(err);
        res.send('Something went wrong in DB');
    }
});

router.patch('/edit-url/:id', async (req, res) => {
    let { id } = req.params;
    let { url } = req.body;
    if(!isValidUrl(url)) {
        return res.render('/edit-url', {error: 'Invalid URL'});
    } else {
        try {
            let db = await getConnection();
            let q = `SELECT * FROM urls where url = ? AND user_id = ?`;
            let [urlInfo] = await db.query(q, [url, req.session.user_id]);
            let q2 = `SELECT * FROM urls WHERE id = ?`;
            let [existingUrl] = await db.query(q2, id);
            let url_info = [url, id];
            if (urlInfo.length) {
                let urlDetails = [url, existingUrl[0].short_url, existingUrl[0].id];
                return res.render(`edit-url`, {error: 'URL already in use', urlDetails});
            } else {
                try {
                    let q1 = `UPDATE urls SET url = ? WHERE id = ?`;
                    let [result] = await db.query(q1, url_info);
                    res.redirect('/dashboard');
                } catch (err) {
                    console.log(err);
                    res.send('Something went wrong in DB');
                }
            }
        } catch (err) {
            console.log(err);
            res.send('Something went wrong in DB');
        }
    }
});

module.exports = router;