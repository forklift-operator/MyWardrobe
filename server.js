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
        res.redirect('/');
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
        res.redirect('/');
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
    const id = newCard._id;
    console.log("Received JSON data:", {id, name, description, tag });
})


// GET
app.get('/', (req,res)=>{
    if (req.session.userId) {
        // User is authenticated
        console.log("User is authenticated")
        res.sendFile(path.join(__dirname,'public','main.html'));
    } else {
        res.redirect('/login');  // Redirect to login page if not authenticated
    }
})

app.get('/cards', isAuthenticated, async (req, res) => {
    const cards = await Card.find({ userId: req.session.userId });
    res.json(cards);
});

app.get('/login', (req,res)=>{
    res.sendFile(path.join(__dirname,'public','login.html'))
})

app.get('/register', (req,res)=>{
    res.sendFile(path.join(__dirname,'public','register.html'));
})

app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Failed to log out');
            }
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    } else {
        res.redirect('/login'); 
    }
});

app.delete('/delete/:id', isAuthenticated, async(req,res) => {
    const { id } = req.params;
    const cards = await Card.findOneAndDelete({_id:id})
    console.log("Deleted card: ", id)
    res.status(200).send({ message: 'Card deleted successfully' });

})

// ERROR HANDLING AND APP START
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, ()=>{
    console.log(`app running on: http://localhost:${PORT}`)
})