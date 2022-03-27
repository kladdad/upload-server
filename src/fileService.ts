import path from "path";
import crypto from "crypto";
import fs, { renameSync } from "fs";
import StorageService from "./storageService";
import getExtension from "./utils";

export default class FileService implements StorageService {
  uploadDir: string;
  hashAlgo: string;

  constructor(uploadDir: string, hashAlgo: string) {
    this.uploadDir = uploadDir;
    this.hashAlgo = hashAlgo;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir);
    }
  }

  save(
    file: Express.Multer.File,
    finishCb: (error: Error | null, uploadName?: string, getSize?: () => number) => void
  ) {
    const hash = this.getHash(this.hashAlgo, file);
    const ext = getExtension(file.originalname);

    const originalFileName = file.originalname;
    const tmpDirectory = fs.mkdtempSync("upload-");
    const tmpPath = path.join(tmpDirectory, originalFileName);
    const outStream = fs.createWriteStream(tmpPath);
    file.stream.pipe(outStream);

    outStream.on("error", (error) => finishCb(error));
    const getSize = () => outStream.bytesWritten;
    outStream.on("finish", () => {
      const hashName = hash.digest("hex") + "." + ext;
      const uploadPath = path.join(this.uploadDir, hashName);
      renameSync(tmpPath, uploadPath);
      fs.rmdirSync(tmpDirectory);

      finishCb(null, hashName, getSize);
    });
  }

  load(fileName: string, cb: (error: Error, filePath: string) => void) {
    const localFilePath = this.getFilePath(fileName);
    if (fs.existsSync(localFilePath)) {
      cb(null, localFilePath);
    } else {
      cb(new Error("File not found"), null);
    }
  }

  saveFileLocally(fileName: string, data, cb: (error: Error | null, filePath: string) => void) {
    const localFilePath = this.getFilePath(fileName);
    const outStream = fs.createWriteStream(localFilePath);
    data.Body.pipe(outStream);
    data.Body.on("end", () => {
      cb(null, localFilePath);
    });
  }

  getFilePath(fileName: string): string {
    return path.join(this.uploadDir, fileName);
  }

  private getHash(algo: string, file: Express.Multer.File): crypto.Hash {
    const hash = crypto.createHash(algo);
    file.stream.on("data", (chunk) => {
      hash.update(chunk);
    });
    return hash;
  }
}
