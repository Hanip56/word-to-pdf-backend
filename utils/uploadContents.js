const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const uploadContents = multer({
  storage,
  limits: { fileSize: 20000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("document");

// checking file
const checkFileType = (file, cb) => {
  // allowed ext
  const fileTypes = /doc|docx|odt/;
  // check ext
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  // check mimetype
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Error: doc/docx/odt file only"));
  }
};

module.exports = uploadContents;
