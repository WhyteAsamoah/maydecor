// importing packages
const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const {Storage} = require('@google-cloud/storage');

// firebase admin setup
let serviceAccount = require("./maydecor-89f84-firebase-adminsdk-bjvyw-9cf8daa04f.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://maydecor-89f84-default-rtdb.firebaseio.com"
});

let db = admin.firestore();

// firebase storage setup
const storage = new Storage({
    projectId: 'maydecor-89f84',
    credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key.replace(/\\n/g, '\n')
    }
});

const bucket = storage.bucket('gs://maydecor-89f84.appspot.com');



//declare static path
let staticPath = path.join(__dirname, 'public');

// initializing express.js
const app = express();

//middlewares
app.use(express.static(staticPath));
app.use(express.json());

// configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb
    }
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

//handle image upload

// Handle the /imgurl endpoint
app.post('/imgurl', upload.single('file'), (req, res) => {
    // Access the uploaded file from the request object
    const file = req.file;

    // Generate a unique filename for the uploaded file
    const fileName = Date.now() + '-' + file.originalname;

    // Create a file reference in the Firebase storage bucket
    const fileRef = bucket.file(fileName);

    // Create a write stream to upload the file
    const uploadStream = fileRef.createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
    });

    // Handle errors during the upload process
    uploadStream.on('error', (error) => {
        console.log(error);
        res.status(500).json({ error: 'Error uploading file' });
    });

    // Handle the finish event
    uploadStream.on('finish', () => {
        // Get the public URL of the uploaded file
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;

        // Send the public URL as a response
        res.status(200).json({ url: publicUrl });
    });

    // Pipe the file to the upload stream
    uploadStream.end(file.buffer);
});


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