// importing packages
const {Storage} = require('@google-cloud/storage');
const {v4: uuidv4} = require('uuid');
const express = require('express');
const formidable = require("formidable");
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

// UPDATES: Pencode -------------------
const memostore = multer.memoryStorage();
const imgUpload = multer({ memostore });
// -------------------------------------

//declare static path
let staticPath = path.join(__dirname, 'public');
// initializing express.js
const app = express();
//middlewares
app.use(cors());
app.use(express.static(staticPath));
app.use(express.json({limit: '50mb', extended: true})); // parse json data
app.use(express.urlencoded({limit: '50mb', extended: false})); // parse urlencoded data

// const corsOptions = {
//     origin: 'http://localhost:3000', 'https://maydecor-89f84.web.app': 'https://maydecor-89f84.firebaseapp.com',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     allowedHeaders: 'Content-Type,Authorization'
// };

// app.use(cors(corsOptions));

// firebase admin setup
var admin = require('firebase-admin');

var serviceAccount = require("./maydecor-89f84-firebase-adminsdk-bjvyw-9cf8daa04f.json");
const { bucket } = require('firebase-functions/v1/storage');
const { getStorage } = require('firebase-admin/storage');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://maydecor-89f84-default-rtdb.firebaseio.com", 
    storageBucket: 'gs://maydecor-89f84.appspot.com'
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
    // UPDATES----------------------------------
    const docRef = db.collection('products').doc(docName);
    docRef.set(req.body)
    .then(() => {
        res.status(200).json({'product': name, 'product_id': docRef.id });
    })
    .catch(err => {
        return res.status(400).json({'alert': 'some error occurred. Try again'});
    })

    return;
    // -------------------------------

    // db.collection('products').doc(docName).set(req.body)
    // .then(data => {
    //     res.json({'product': name });
    // })
    // .catch(err => {
    //     return res.json({'alert': 'some error occurred. Try again'});
    // })

})

// UPDATES: Pencoder
// SAVE PRODUCT IMAGE 
app.post('/save-product-images', imgUpload.array('image_uploads'), async (req, res) => {
    const { uploadImages } = require('./controller/product_upload_controller');

    const product = req.body.product
    // console.log(product)

    let imgFiles = req.files

    if (!imgFiles || imgFiles.length < 1){
        return res.status(400).json({status: 'Error', msg: 'No files available'})
    }
    // UPLOAD IMAGES 
    let uploadRes = await uploadImages(imgFiles, product)
    // console.log(uploadRes)

    // if (uploadRes && uploadRes.status == 'Success'){
    //     res.status(200).json(uploadRes)
    // }else {
    //     res.status(400).json(uploadRes)
    // }
    // res.json({response: 'files here'})
})

// get products
app.post('/get-seller-products', (req, res) => {
    
    let { email, id } = req.body;
    let docRef = id ? db.collection('products').doc(id) : db.collection('products').where('email', '==', email);

    docRef.get()
    .then(products => {
        if(products.empty){
            return res.json('No products found');
        }
        let productsArray = [];
        if(id){
            // console.log(`id: ${id}`)
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

app.post('/get-products', (req, res) => {

    let { id } = req.body;
    let docRef = id ? db.collection('products').doc(id) : db.collection('products');

    docRef.get()
    .then(products => {
        if(products.empty){
            return res.json('No products found');
        }
        let productsArray = [];
        if(id){
            return res.status(200).json(products.data());
        } else{
            products.forEach(item => {
                let data = item.data();
                data.id = item.id;
                productsArray.push(data);
            })
            res.status(200).json(productsArray);
        }
    })
})

// UPDATES: Pencode 
// GET PRODUCT IMAGES 
app.post('/get-product-images', async (req, res) => {
    const { getImagesFromBucket } = require('./controller/product_upload_controller')

    let { product } = req.body
    let image_urls = await getImagesFromBucket(product)
    // let image_files = await getImagesFromBucket(product)
    // for (let i = 0; i < image_files.length; i++){
    //     let url = await image_files[i].getSignedUrl({action: 'read', expires: "03-01-2500"})
    //     image_urls.push(url)
    // }

    res.status(200).json({status: 'Success', content: image_urls})
})
// UPDATES: Pencode 
// GET CART VIEW 
app.get('/cart', (req, res) => {
    res.sendFile(path.join(staticPath, 'cart.html'));
})
// ADD TO CART 
app.post('/add-to-cart', (req, res) => {
    let cart_data_file = './data/json/cart-file.json';
    const {email, product} = req.body
    
    fs.readFile(cart_data_file, (err, json_data) => {
        if (err){
            console.log(`Error: ${err}`);
            // return res.status(400).json({status: 'Error', msg: err.message});
            fs.open(cart_data_file, 'w+', (err, fd) => {
                if (err){
                    return res.status(400).json({status: 'Error', msg: err.message})
                }
            })
        }
        
        json_data = json_data.toString('utf8');
        // console.log(json_data)
        let parsed_data = {};
        if (json_data){
            parsed_data = JSON.parse(json_data);
            if(parsed_data[email]){
                parsed_data[email].push(product);
            }else{
                parsed_data[email] = [];
                parsed_data[email].push(product)
            }
        }
        else {
            parsed_data[email] = [];
            parsed_data[email].push(product)
        }
        fs.writeFile(cart_data_file, JSON.stringify(parsed_data, null, 2), (err) => {
            if (err){ 
                console.log(err);
                return res.status(400).json({status: 'Error', msg: err.message})
            }
            res.status(200).json({status: 'Success', content: parsed_data[email]})
        })
    })
})
// COLLECT USER CART 
app.post('/get-user-cart', async (req, res) => {
    let cart_data_file = './data/json/cart-file.json';
    const {email } = req.body
    
    fs.readFile(cart_data_file, (err, json_data) => {
        if (err){
            console.log(`Error: ${err}`);
            return res.status(200).json({status: 'Error', content: []});
        }
        
        json_data = json_data.toString('utf8');
        let parsed_data = {};
        if (json_data){
            parsed_data = JSON.parse(json_data);
            if(parsed_data[email]){
                parsed_data = parsed_data[email];
            }else{
                parsed_data = [];
            }
        }
        else {
            parsed_data = []
        }
        res.status(200).json({status: 'Success', content: parsed_data})
    })
})
// REMOVE CART ITEM
app.post('/remove-cart-item', async (req, res) => {
    let cart_data_file = './data/json/cart-file.json';
    const { email, product_id } = req.body
    
    fs.readFile(cart_data_file, (err, json_data) => {
        if (err){
            console.log(`Error: ${err}`);
            return res.status(200).json({status: 'Error', content: []});
        }
        
        json_data = json_data.toString('utf8');
        let parsed_data = {};
        if (json_data){
            parsed_data = JSON.parse(json_data);
            if(parsed_data[email]){
                let filtered = parsed_data[email].filter((item) => item.id != product_id);
                parsed_data[email] = filtered;
                fs.writeFile(cart_data_file, JSON.stringify(parsed_data, null, 2), (err) => {
                    if (err){ 
                        console.log(err);
                        return res.status(400).json({status: 'Error', msg: err.message});
                    }
                    res.status(200).json({status: 'Success', content: parsed_data[email]});
                });
            }else {
                res.status(200).json({status: 'no-action', msg: 'No action executed'});
            }
        }else {
            res.status(200).json({status: 'no-action', msg: 'No action executed'});
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