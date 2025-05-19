const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

port = process.env.port || 5000;
const URI = process.env.uri

const User = require('./Model/userModel');

mongoose.connect(URI)
.then(() => {
  console.log('Connected to MongoDB');
}
)
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
}
);

app.post('/signup', async(req, res) => {
  try {
    const { name, mail, password } = req.body;
    const user = new User({name,mail,password});
   await user.save()
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
)

app.post('/signin', async (req, res) => {
    try {
        const { mail, password } = req.body;
        const user = await User.findOne({ mail });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        res.status(200).json({ message: 'User signed in successfully' });
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





app.get('/', (req, res) => {
  res.send('Hello World!');
}
);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}
);