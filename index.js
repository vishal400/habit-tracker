require('dotenv').config();
const express = require('express');
const ejsLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.urlencoded());

app.use(ejsLayouts);
// extract styles and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

app.use(express.static('./assets'));

// setup view engine
app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', require('./routes'));

app.listen(PORT, function(err){
    if(err){
        console.log(`Error: ${PORT}`);
        return;
    }

    console.log(`Server is up and running on port: ${PORT}`);
})