
const multer = require('multer')
const path = require('path');
const fs = require('fs');

//const upload = multer({ dest: path.join(__dirname, '..', 'public', 'upload', 'widgets') })

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let id = req.params.id;
        const uploadPath = path.join(__dirname, '..', 'public', 'upload', 'widgets', id);
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let exts = file.originalname.split(".");
        let ext = exts[exts.length - 1];
        cb(null, uniqueSuffix + "." + ext);
    }
});

var upload = multer({ storage: storage });

module.exports = [
    // function (req, res, next) {
    //     let id = req.params.id;
    //     const uploadPath = path.join(__dirname, '..', 'public', 'upload', 'widgets', id);
    //     fs.rmdirSync(uploadPath, { recursive: true });

    //     next();
    // },
    upload.any()
];