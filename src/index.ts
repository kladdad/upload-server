import express from "express";
import multer, { FileFilterCallback } from "multer";
import CustomStorage from "./customStorage.js";
import FileService from "./fileService.js";
import AuthHelper from "./authHelper.js";
import cors from "cors";
import path from "path";
import getExtension from "./utils.js";

const app = express();
const corsOptions = {
  credentials: true,
  origin: process.env.ALLOWED_CORS_ORIGINS,
};
app.use(cors(corsOptions));

const uploadDir = process.env.UPLOAD_DIR
  ? process.env.UPLOAD_DIR
  : path.join(__dirname, "..", "uploads");
const fileService = new FileService(uploadDir, process.env.HASH_ALGO);
const storageService = fileService;
const mimeMapping = JSON.parse(process.env.MIME_MAPPING);
const storage = CustomStorage(storageService);
const upload = multer({
  storage,
  fileFilter: (_req: express.Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    const extension = getExtension(file.originalname).toLowerCase();
    const contentHeader: string = mimeMapping[extension];
    if (!contentHeader) {
      callback(new Error(`File extension '${extension}' not supported`));
    } else {
      callback(null, true);
    }
  },
}).single("file");
const maxAge = 60 * 60 * 24 * 365;
const CACHE_CONTROL_HEADER = `public, max-age=${maxAge}`;
const port = process.env.PORT || 5000;

app.post("/upload", AuthHelper.checkJwt, (req: express.Request, res: express.Response) => {
  upload(req, res, (error) => {
    if (error) {
      res.status(400).send({ message: error.message });
    } else {
      uploadFile(req, res);
    }
  });
});
app.get("/upload/:fileName", getFile);

function uploadFile(req: express.Request, res: express.Response): void {
  const file = req.file;
  res.send({ status: "success", path: file.path });
}

function getFile(req: express.Request, res: express.Response): void {
  const fileName = req.params.fileName;
  const extension = getExtension(fileName).toLowerCase();
  const contentHeader: string = mimeMapping[extension];
  if (!contentHeader) {
    res.status(404).send({ message: `File extension '${extension}' not supported` });
  } else {
    const options = {
      root: "",
      headers: {
        "Content-Type": contentHeader,
        "Cache-Control": CACHE_CONTROL_HEADER,
      },
    };
    storageService.load(fileName, (error, filePath) => {
      if (error) {
        res.status(404).send("No such file");
      } else {
        res.sendFile(filePath, options);
      }
    });
  }
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
