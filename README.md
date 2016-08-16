### > The backend source for [vandemataramlibrary.org](http://vandemataramlibrary.org).

## Development setup


1. `npm install`
2. `npm install -g typings`
3. `typings install`
4. Enter appropriate config in `.env` (see `.env.example` for required values).
5. Seed the database.

## Starting the server

In development mode

```js
npm start
```

In production mode

```js
NODE_ENV=production npm start
```

In production mode the server runs as a daemon.
