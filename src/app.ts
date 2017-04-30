import * as http from 'http';
import * as path from 'path';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { host, port, env } from 'c0nfig';

import api from './v1';

import * as middleware from './middleware';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/docs', express.static(path.join(__dirname, '../docs/v1')));
app.use('/v1', api());
app.use(middleware.handleNotFound);
app.use(middleware.handleErrors);

http.createServer(app).listen(port, () => {
  console.log(`API is listening on http://${host}:${port} env=${env}`);
});
