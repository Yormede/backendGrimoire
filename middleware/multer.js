const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { CLIENT_RENEG_LIMIT } = require('tls');
const fs = require('fs').promises;

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images")
    },
    filename: (req, file, callback) => {
        const name =file.originalname.split(".")
        const newName = name[0].split(" ").join("_");
        const extension = MIME_TYPES[file.mimetype];
        callback(null, newName + Date.now() + "." + extension)
    }
});

module.exports = multer({storage: storage}).single('image');

module.exports.resizeImage = async (req, res, next) => {
    if (!req.file) {
      return next();
    }
  
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const outputFilePath = path.join('images', `resized_${fileName.split(".jpg")[0]}.webp`);
    try {
      await sharp(filePath)
        .resize({ width: 206})
        .webp()
        .toFile(outputFilePath)
        .then((info) => {
          console.log(info);
          req.file.path = outputFilePath; 
        })
        .catch(err => {console.log(err)});

      await fs.unlink(filePath);
  

      console.log(req.file.path);

      next();
    } catch (err) {
      console.error(err);
      next();
    }
  };