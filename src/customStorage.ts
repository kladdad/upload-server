import fs from "fs";
import "dotenv/config";
import multer from "multer";
import StorageService from "./storageService";

class CustomStorage implements multer.StorageEngine {
  storageService: StorageService;

  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }

  _handleFile = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error?: any, info?: any) => void
  ) => {
    this.storageService.save(file, (err, fileName, getSize) => {
      cb(err, { path: fileName, size: getSize() });
    });
  };

  _removeFile = (req: Express.Request, file: Express.Multer.File, cb: (error: Error) => void) => {
    fs.unlink(file.path, (err) => {
      cb(err);
    });
  };
}

export default function (storageService: StorageService) {
  return new CustomStorage(storageService);
}
