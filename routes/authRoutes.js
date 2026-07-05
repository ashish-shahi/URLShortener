const express = require('express');
const router = express.Router();
const {v4: uuidv4} = require('uuid');
const getConnection = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/login', (req, res) => {
    if (req.session.user_id) {
        return res.redirect('/dashboard');
    }
    res.render('login');
});

router.get('/register', (req, res) => {
    if (req.session.user_id) {
        return res.redirect('/dashboard');
    }
    res.render('register');
});

router.post('/register', async (req, res) => {
    let {user_name, user_email, user_pass} = req.body;
    let q = `SELECT user_email FROM users WHERE user_email = '${user_email}'`;
    let db = await getConnection();
    try {
        let [email] = await db.query(q);
        if (email.length > 0) {
            return res.render('register', {error: 'Email already exists'});
        } else {
            let user_id = uuidv4();
            const hashedPass = await bcrypt.hash(user_pass, saltRounds);
            q = `INSERT INTO users (user_id, user_name, user_email, user_pass) VALUE ('${user_id}', '${user_name}', '${user_email}', '${hashedPass}')`;
            try {
                let [result] = await db.query(q);
                res.redirect("/login");
            } catch (err) {
                console.log(err);
                res.send('Something went wrong in inner DB');
            }
        }
    } catch (err) {
        console.log(err);
        res.send('Something went wrong in outer DB');
    }
});

router.post('/login', async (req, res) => {
    let {user_email, user_pass} = req.body;
    let q = `SELECT * FROM users WHERE user_email = '${user_email}'`;
    let db = await getConnection();
    try {
        let [user] = await db.query(q);
        if (!user.length) {
            res.render('login', {error: "Email doesn't exist"});
        } else {
            if (await bcrypt.compare(user_pass, user[0].user_pass)) {
                req.session.user_id = user[0].user_id;
                res.redirect('dashboard');
            } else {
                res.render('login', {error: "Incorrect Password"});
            }
        }
    } catch (err) {
        console.log(err);
        res.send("Something went wrong in DB");
    }
});

router.get('/logout', async (req, res) => {
    req.session.user_id = undefined;
    res.redirect('/login');
});

module.exports = router;