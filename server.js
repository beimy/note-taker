const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const fs = require('fs');
const path = require('path');
const { notes } = require('./db/db.json');
const { v4: uuidv4 } = require('uuid');

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static('public'));

function createNewNote(body, noteArray) {
    const note = body;
    note.id = generateNewID();
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
    if (!note.id || typeof note.id !== 'string') {
        console.log('generating new id');
        note.id = generateNewID();
        return validateNote(note);
    }

    return true;
}

function generateNewID() {
    return uuidv4();
}

function findById(id, notesArray) {
    const result = notesArray.filter(note => note.id === id)[0];
    return result;
}

function deleteNote(id, notesArray) {
    const index = (notesArray.indexOf(findById(id, notesArray)));

    if(index > -1 ) {
         notesArray.splice(index, 1);
         
         fs.writeFileSync(
             path.join(__dirname, './db/db.json'),
             JSON.stringify({ notes: notesArray}, null, 2)
         );
         return notesArray;
    } else {
        console.log(`No note with the id ${id} found`);
        return;
    }
}

//  ROUTES

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

app.delete('/api/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    if(result) {
        const updatedNoteArray = deleteNote(req.params.id, notes);
        res.json(updatedNoteArray);
    } else {
        res.send(404);
    }
})

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`);
});