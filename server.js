// importing packages
const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const path = require('path');

// firebase admin setup
let serviceAccount = require("./maydecor-89f84-firebase-adminsdk-bjvyw-9cf8daa04f.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();


//declare static path
let staticPath = path.join(__dirname, 'public');

// initializing express.js
const app = express();

//middlewares
app.use(express.static(staticPath));
app.use(express.json());

//routes
//home route
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
})

//signup route
app.get('/signup', (req, res) => {
    res.sendFile(path.join(staticPath, 'signup.html'));
})

app.post('/signup', (req, res) => {
    let {name, email, password, number, tac, seller} = req.body;

    // form validation
    if (name.length < 3) {
        return res.json({'alert': 'Name must be atleast 3 characters long'});
    } else if (!email.length) {
        return res.json({'alert': 'enter your email'});
    } else if (password.length < 6) {
        return res.json({'alert': 'Password must be atleast 6 characters long'});
    } else if (number.length < 10) {
        return res.json({'alert': 'enter your phone number'});
    } else if(!Number(number) || number.length < 10) {
        return res.json({'alert': 'Invalid number, please enter a valid number'});
    } else if (!tac) {
        return res.json({'alert': 'Please accept terms and conditions'});
    } 

    // store user in database
    db.collection('users').doc(email).get()
    .then((user) => {
        if (user.exists) {
            return res.json({'alert': 'email already exists'});
        } else {
            // hash password
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    req.body.password = hash;
                    // store user in database
                    db.collection('users').doc(email).set(req.body)
                    .then(data => {
                        res.json({
                            name: req.body.name,
                            email: req.body.email,
                            seller: req.body.seller,
                        })
                    })
                })
            })
        }
    })
})

// login route
app.get('/login', (req, res) => {
    res.sendFile(path.join(staticPath, 'login.html'));
})

app.post('/login', (req, res) => {
    let {email, password} = req.body;
    if(!email.length || !password.length){
        return res.json({'alert': 'Please enter your email and password'});
    }

    // check if user exists
    db.collection('users').doc(email).get()
    .then(user => {
        if(!user.exists){ // if user does not exist
            return res.json({'alert': 'Invalid email or password'});
        } else{ 
            bcrypt.compare(password, user.data().password, (err, result) => {
                if(result){ // if password is correct
                    let data = user.data();
                    return res.json({
                        name: data.name,
                        email: data.email,
                        seller: data.seller,
                    })
                } else{ // if password is incorrect
                    return res.json({'alert': 'Wrong password'});
                }
            })
        }
    })
})

// seller dashboard route
app.get('/seller', (req, res) => {
    res.sendFile(path.join(staticPath, "seller.html"));
})

app.post('/seller', (req, res) => {
    let {name, about, address, number, tac, legit, email} = req.body;
    if(!name.length || !about.length || !address.length || number.length < 10 || !Number(number)) {
        return res.json({'alert': 'Some feilds are empty or invalid'});
    } else if(!tac || !legit) {
        return res.json({'alert': 'Please accept terms and conditions'});
    } else {
        // update seller's status
        db.collection('sellers').doc(email).set(req.body)
        .then(data => {
            db.collection('users').doc(email).update({
                seller: true
            }).then(data => {
                res.json(true);
            })
        })
    }
})

// 404 route
app.get('/404', (req, res) => {
    res.sendFile(path.join(staticPath, "404.html"));
})

app.use((req, res) => {
    res.redirect('/404');
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})