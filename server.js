// importing packages
const {Storage} = require('@google-cloud/storage');
const {v4: uuidv4} = require('uuid');
const express = require('express');
const formidable = require("formidable");
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors');

//declare static path
let staticPath = path.join(__dirname, 'public');
// initializing express.js
const app = express();
//middlewares
app.use(cors());
app.use(express.static(staticPath));
app.use(express.json({limit: '50mb', extended: true})); // parse json data
app.use(express.urlencoded({limit: '50mb', extended: false})); // parse urlencoded data

const corsOptions = {
    origin: 'http://localhost:3000', 'https://maydecor-89f84.web.app': 'https://maydecor-89f84.firebaseapp.com',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
};

app.use(cors(corsOptions));

// firebase admin setup
var admin = require('firebase-admin');

var serviceAccount = require("./maydecor-89f84-firebase-adminsdk-bjvyw-9cf8daa04f.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://maydecor-89f84-default-rtdb.firebaseio.com"
});

let db = admin.firestore();

const userRef = db.collection('sellers');

// firebase storage setup
const storage = new Storage({
    projectId: 'maydecor-89f84',
    keyFilename: './maydecor-89f84-firebase-adminsdk-bjvyw-9cf8daa04f.json',
    bucket: 'gs://maydecor-89f84.appspot.com'
});

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

// add product
app.get('/add-product', (req, res) => {
    res.sendFile(path.join(staticPath, "add-product.html"));
})

app.get('/add-product/:id', (req, res) => {
    res.sendFile(path.join(staticPath, "add-product.html"));
})

// image upload route

// add product to database
app.post('/add-product', (req, res) => {
    let { name, shortDes, des, sizes, actualPrice, discount, sellPrice, stock, tags, tac, email, draft, id } = req.body;

    // form validation
    if(!draft){
        if (!name.length) {
            return res.json({'alert': 'Product name is required'});
        } else if (shortDes.length > 100 || shortDes.length < 10) {
            return res.json({'alert':'Short description should be between 10 to 100 characters'});
        } else if (!des.length) {
            return res.json({'alert':'Description is required'});
        } /* else if(!images.length){ // imagePaths is an array
            return res.json({'alert':'Please upload atleast one image'});
        } */ 
        else if (!sizes.length) { // sizes is an array
            return res.json({'alert':'Please select atleast one size'});
        } else if (!actualPrice.length || !discount.length || !sellPrice.length) {
            return res.json({'alert':'Please enter price details'});
        } else if (stock < 10) {
            return res.json({'alert':'You should have atleast 10 items in stock'});
        } else if (!tags.length) {
            return res.json({'alert':'Please enter atleast one tag'});
        } else if (!tac) {
            return res.json({'alert':'Please accept terms and conditions'});
        }
    }

    // add product
    let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random() * 5000)}` : id;
    db.collection('products').doc(docName).set(req.body)
    .then(data => {
        res.json({'product': name});
    })
    .catch(err => {
        return res.json({'alert': 'some error occurred. Try again'});
    })

})

// get products
app.post('/get-products', (req, res) => {
    let { email, id } = req.body;
    let docRef = id ? db.collection('products').doc(id) : db.collection('products').where('email', '==', email);

    docRef.get()
    .then(products => {
        if(products.empty){
            return res.json('No products found');
        }
        let productsArray = [];
        if(id){
            return res.json(products.data());
        } else{
            products.forEach(item => {
                let data = item.data();
                data.id = item.id;
                productsArray.push(data);
            })
            res.json(productsArray);
        }
    })
})

app.post('/delete-product', (req, res) => {
    let { id } = req.body;
    db.collection('products').doc(id).delete()
    .then(data => {
        res.json('success');
    }).catch(err => {
        res.json('err');
    })
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