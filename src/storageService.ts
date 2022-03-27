export default interface StorageService {
  save(
    file: Express.Multer.File,
    cb: (error: Error | null, uploadName?: string, getSize?: () => number) => void
  ): void;
  load(fileName: string, cb: (error: Error | null, filePath: string) => void): void;
}
