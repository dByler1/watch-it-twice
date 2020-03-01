# watch-it-twice
Watch it Twice

Stateless REST API with token based authentication
Providing endpoints for watchittwice.com

## Dev Server
`npm run watch` to start the dev server (nodemon, babel-node)

## Build
`npm run build` to clean and build the dist directory (babel)

## Production Server
`npm run start` to start the production server

## Hosted on Heroku
- `npm run build`
- `git push heroku master`
- new env - `heroku config:set TIMES=2`