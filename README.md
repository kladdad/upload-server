A simple file upload using node.js, express.js, and multer.

Supports the following endpoints:

- POST /upload
  Uploads the file and saves it to a local folder (see [.env.example](.env.example) for configuration).
- GET /upload/:filename
  Returns the specified file.

A few features to note:

- Uses JWT for authentication and allows only the "ADMIN" role to access the `POST` endpoint.
- Computes a hash of the file and thus specifies `Cache-Control` headers with one year `max-age`.

Getting started:

```sh
cp .env.example .env # Change .env to specify your configuration
npm install
npm run start
```
