const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// The saved file's extension is derived only from this map, never from the
// client-supplied filename — this closes off extension-spoofing tricks
// (e.g. an SVG/HTML payload uploaded with a forged "image/png" mimetype
// to land a stored-XSS file on the server) since the file is always written
// out and served back under a safe, server-chosen image extension.
const MIME_TO_EXT = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = crypto.randomBytes(16).toString('hex') + MIME_TO_EXT[file.mimetype];
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (MIME_TO_EXT[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
