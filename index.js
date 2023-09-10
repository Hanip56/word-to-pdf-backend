require("dotenv").config();
require("colors");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fsPromises = require("fs/promises");
const uploadContents = require("./utils/uploadContents");
const { convertWordFiles } = require("convert-multiple-files-ul");

const port = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/api/convert", async (req, res) => {
  uploadContents(req, res, async function (err) {
    if (err instanceof multer.MulterError || err) {
      res.status(400);
      return res.status(500).json({ message: err.message });
    }

    if (!req.file) {
      res.status(400);
      return res.status(500).json({ message: "Error not file selected" });
      // An unknown error occurred when uploading.
    }

    // convert
    try {
      const outputPath = await convertWordFiles(
        `./public/${req.file.filename}`,
        "pdf",
        "./resources"
      );

      const splitted = outputPath.split("\\");
      const filename = splitted[splitted.length - 1];

      res.status(200).json({
        message: "Successfully converted",
        data: { originalName: req.file.originalname, name: filename },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  });
});

app.get("/api/download", async (req, res) => {
  const { filename } = req.query;
  const pathFile = `./resources/${filename}`;
  if (!filename) {
    return res.status(404).json({ message: "Filename params is required" });
  }

  try {
    const fileExist = await fsPromises.readFile(pathFile);

    res.download(`./resources/${filename}`);
  } catch (error) {
    return res.status(404).json({ message: "File not found" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`.yellow.underline);
});
