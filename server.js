const express = require('express');
const session = require('express-session'); // For session management
const bodyParser = require('body-parser');
const multer = require('multer')
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose'); 
const {User, Card} = require('./dbModels/userCard');


const app = express();
const PORT = 3000;

const storage = multer.memoryStorage(); // or configure to store on disk
const upload = multer({ storage: storage });

mongoose.connect('mongodb://localhost:27017/cards_db');

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
    secret: '12345', // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
}))

function isAuthenticated(req, res, next) {
    if (req.session.userId || ['/register', '/login'].includes(req.path)) {
        return next();  // Allow access to login and register routes
    }
    res.redirect('/login');
}




app.post('/register', async(req,res)=>{
    const { username, password } = req.body;

    console.log('Request body:', req.body); // Debugging line

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        req.session.userId = newUser._id;
        res.redirect('/wardrobe');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
})


app.post('/login', async(req,res)=>{
    const {username, password} = req.body;
    const user = await User.findOne({username});

    if (user && await bcrypt.compare(password, user.password)) { //
        req.session.userId = user._id;
        res.redirect('/wardrobe');
    }else {
        res.status(401).json({message:'Invalid credentials'})
    }
})


app.post('/add',upload.single('image'), async (req,res)=>{
    console.log(req.body);
    console.log(req.file);
    
    
    const {name, description, tag} = req.body;
    const image = req.file ? req.file.buffer.toString('base64') : undefined; // Convert image buffer to base64
    const newCard = new Card({name, description, tag, image, userId: req.session.userId}) 
    
    await newCard.save();
    res.json(newCard);
    console.log("Received JSON data:", { image ,name, description, tag });
})


// GET
app.get('/', (req,res)=>{
    if (req.session.userId) {
        // User is authenticated
        console.log("User is authenticated")
        res.redirect('/wardrobe');  // Redirect to wardrobe page if authenticated
    } else {
        res.redirect('/login');  // Redirect to login page if not authenticated
    }
})

app.get('/wardrobe', isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname,'public','wardrobe.html'))
})

app.get('/outfits', isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname,'public','outfits.html'));
})

app.get('/cards', isAuthenticated, async (req, res) => {
    const cards = await Card.find({ userId: req.session.userId });
    res.json(cards);
});

app.get('/login', isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname,'public','login.html'))
})

app.get('/register', isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname,'public','register.html'));
})


// ERROR HANDLING AND APP START
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, ()=>{
    console.log(`app running on: http://localhost:${PORT}`)
})