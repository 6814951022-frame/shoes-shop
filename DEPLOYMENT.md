# Deployment

The Vite client is served as a static site and `api/index.js` is the Express
Vercel Function. The API connects to MongoDB Atlas using `MONGO_URI`. Product
image uploads are held in memory only for the request and are then written to
a public Vercel Blob store; the returned Blob URL is stored with the product.

1. In MongoDB Atlas, create a database user and configure Network Access for
   Vercel (or use Atlas's recommended production network configuration).
2. Import this Git repository into Vercel.
3. In the Vercel project's Storage tab, create and connect a public Blob store.
   Vercel adds `BLOB_READ_WRITE_TOKEN` to selected environments automatically.
4. In Vercel Project Settings > Environment Variables, add `MONGO_URI` and a
   long random `JWT_SECRET`. Confirm `BLOB_READ_WRITE_TOKEN` is available to
   Production (and Preview if needed), then deploy.

For local development, copy `server/.env.example` to `server/.env` and set the
values. Do not commit `.env` files. Deployed clients call same-origin `/api`;
set `VITE_API_URL` only when using a separately hosted API.

Uploads accept JPEG, PNG, and WebP up to 4 MB, below Vercel Functions' 4.5 MB
request limit.
