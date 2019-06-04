# Scrum Poker Web App - BFF Repository

## Description

This is the backend for frontend repository of 
[Scrum Poker Web Application.](https://github.com/volaka/scrum-poker-frontend)

This application is an ExpressJS RestAPI Server.

Scrum Poker App is a dummy scrum voting app for scrum master and
developers. Scrum Master can create Sessions/Sprints and con
manage each sprint and its stories. 

A developer can see each stories final point, or can vote
an active story.
## Used Technologies 
Technologies are defined as below:

* ExpressJS
* Postgres Client - pg
* Morgan Logger

Development technologies are:

* Babel
* Dotenv
* Nodemon
* Eslint Rallycoding -> [repo](https://github.com/volaka/ESLint-Rallycoding)

## Run Server

To run server, you must first run a postgres database. 
Postgres config can be found under util/pgClient.js file.

This project uses dotenv library, so to run different pg servers for 
dev & prod environments, you must create `.env.dev` and `.env` files. 
You can find an example of environment file.

```dotenv
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=password
PGDATABASE=demo
PGPORT=5432
```

To start a postgres database quickly, you can run 
`npm run-script start:pg-docker` if you have docker 
installed on you component.

To start development server, run `npm run dev`.

To start a production server, run `npm start`.