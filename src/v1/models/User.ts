import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as moment from 'moment';
import * as config from 'c0nfig';

import db from '../../utils/db';

const { hashRounds } = config.bcrypt;
const { signKey, tokenTTL } = config.auth;

export class User {
  static create(doc) {
    return User.storePassword(doc.password)
      .then(hash => {
        let user = Object.assign({}, doc, {
          password: hash,
          createdAt: Date.now()
        });

        return new Promise((resolve, reject) => {
          db.users.insert(user, (err, saved) => {
            err ? reject(err) : resolve(saved);
          });
        });
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.users.findOne({ email }, (err, user) => {
        err ? reject(err) : resolve(user);
      });
    });
  }

  static storePassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(hashRounds, (err, salt) => {
        if (err) {
          return reject(err);
        }

        bcrypt.hash(password, salt, (err, hash) => {
          return err ? reject(err) : resolve(hash);
        });
      });
    });
  }

  static comparePassword(passwordToCompare, actualPassword) {
    return new Promise((resolve, reject) => {
      if (!passwordToCompare) {
        return resolve(false);
      }

      bcrypt.compare(passwordToCompare, actualPassword, (err, same) => {
        return err ? reject(err) : resolve(same);
      });
    });
  }

  static generateAccessToken(email) {
    const timestamp = moment();
    const message = `${email};${timestamp.valueOf()}`;
    const hmac = crypto.createHmac('sha1', signKey).update(message).digest('hex');
    const token = `${message};${hmac}`;
    const tokenBase64 = new Buffer(token).toString('base64');

    return tokenBase64;
  }

  static validateAccessToken(token) {
    const decoded = new Buffer(token, 'base64').toString();
    const parsed = decoded.split(';');

    if (parsed.length !== 3) {
        return false;
    }

    const [ email, timestamp, receivedHmac ] = parsed;
    const message = `${email};${timestamp}`;
    const computedHmac = crypto.createHmac('sha1', signKey).update(message).digest('hex');

    if (receivedHmac !== computedHmac) {
        return false;
    }

    const currentTimestamp = moment();
    const receivedTimestamp = moment(+timestamp);
    const tokenLife = currentTimestamp.diff(receivedTimestamp);

    if (tokenLife >= tokenTTL) {
        return false;
    }

    return email;
  }

  static transformResponse(user) {
    const { email, firstName, lastName, role } = user;
    return Object.assign({}, { email, firstName, lastName, role });
  }
}

const emailSchema = {
  type: 'string',
  format: 'email',
  required: true
};
const notEmptyStringSchema = {
  type: 'string',
  required: true,
  minLength: 1
};

export const loginSchema = {
  payload: {
      email: emailSchema,
      password: notEmptyStringSchema
  }
};

export const signupSchema = {
  payload: {
      email: emailSchema,
      password: notEmptyStringSchema,
      firstName: notEmptyStringSchema,
      lastName: notEmptyStringSchema,
      role: {
          type: 'string',
          required: true,
          enum: ['artist', 'listener']
      }
  }
};
