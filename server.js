const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const fs = require('fs');
const path = require('path');
const { notes } = require('./db/db.json');

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static('public'));

function createNewNote(body, noteArray) {
    const note = body;
    noteArray.push(note);
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify({ notes: noteArray }, null, 2)
    );

    return note;
}

function validateNote(note) {
    if (!note.title || typeof note.title !== 'string') {
        return false;
    }
    if (!note.text || typeof note.text !== 'string') {
        return false;
    }

    return true;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});


app.get('/api/notes', (req, res) => {
   res.json(notes);
});

app.post('/api/notes', (req, res) => {

    if(!validateNote(req.body)) {

        res.status(400).send("The note is not properly formatted.");
        
    } else {
        const note = createNewNote(req.body, notes);

        res.json(notes);
    }
    
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`);
});