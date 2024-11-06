const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Set up storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save the uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000000 }, // Limit file size to 1GB
    fileFilter: (req, file, cb) => {
        const filetypes = /mp4|mkv|avi|pl/;
        const mimetype = filetypes.test(file.mimetype);
        console.log(file.mimetype)
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Videos Only!');
        }
    }
});

// Set up the route for file upload
app.post('/upload', upload.single('video'), (req, res) => {
    if (req.file == undefined) {
        res.status(400).send('No file selected.');
    } else {
        res.send(`File uploaded successfully: ${req.file.filename}`);
    }
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
