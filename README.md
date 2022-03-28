A simple file upload in node.js and TypeScript.

# Supports:

- Uploading to S3 and local file system. Uses [Express](http://expressjs.com/) and [Multer](https://github.com/expressjs/multer).
- Uses JWT for authentication and allows only the "ADMIN" role to access the `POST` endpoint.
- Computes a hash of the file and thus specifies `Cache-Control` headers with one year `max-age`.

# Exposes the following endpoints:

- POST /upload
  Uploads the file and saves it to a local folder (see [.env.example](.env.example) for configuration).
- GET /upload/:filename
  Returns the specified file.

# Getting started:

```sh
cp .env.example .env # Change .env to specify your configuration
npm install
npm run start
```
