import fs from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import FileService from "./fileService";
import StorageService from "./storageService";

export default class S3Service implements StorageService {
  region: string;
  fileService: FileService;
  bucketName: string;

  constructor(region: string, fileService: FileService, bucketName: string) {
    this.region = region;
    this.fileService = fileService;
    this.bucketName = bucketName;
  }

  save(
    file: Express.Multer.File,
    cb: (error: Error | null, uploadName?: string, getSize?: () => number) => void
  ) {
    this.fileService.save(
      file,
      (error: Error | null, filePath?: string, getSize?: () => number) => {
        if (error) {
          cb(error, null);
          return;
        }
        const s3 = new S3Client({ region: this.region });
        const putInput: PutObjectCommandInput = {
          Bucket: this.bucketName,
          Key: path.basename(filePath),
          Body: fs.createReadStream(this.fileService.getFilePath(filePath)),
        };

        const uploadCommand = new PutObjectCommand(putInput);
        s3.send(uploadCommand).then(
          (_data) => {
            console.log("Uploaded to S3...");
            cb(null, path.basename(filePath), getSize);
          },
          (error) => {
            console.log("Error uploading to S3...");
            cb(error, null);
          }
        );
      }
    );
  }

  load(fileName: string, cb: (error: Error | null, filePath: string) => void) {
    this.fileService.load(fileName, (error: Error | null, filePath?: string) => {
      if (!error) {
        cb(null, filePath);
      } else {
        const s3 = new S3Client({ region: this.region });
        const getInput: GetObjectCommandInput = {
          Bucket: this.bucketName,
          Key: fileName,
        };

        const getCommand = new GetObjectCommand(getInput);
        s3.send(getCommand).then(
          (data) => {
            this.fileService.saveFileLocally(fileName, data, (err, filePath) => {
              if (err) {
                cb(err, null);
                return;
              } else {
                cb(null, filePath);
              }
            });
          },
          (err) => {
            console.log("Error downloading from S3...");
            cb(err, null);
          }
        );
      }
    });
  }
}
