import * as express from 'express';

import { User, signupSchema, loginSchema } from '../../models/User';
import { Item } from '../../models/Item';
import Errors from '../../../utils/errors';
import { validateAccessToken, validateUserRole } from '../../../middleware';

export default function () {
    const router = express.Router();

    router.post('/signup',
        findUserByEmail,
        signupUser,
        generateAccessToken,
        returnUser
    );

    router.post('/login',
        findUserByEmail,
        loginUser,
        generateAccessToken,
        returnUser
    );

    router.get('/me',
        validateAccessToken,
        findUserByEmail,
        returnUser
    );

    router.get('/items',
        validateAccessToken,
        validateUserRole('artist'),
        findUserItems,
        returnItems
    );

    async function findUserByEmail (req, res, next) {
        try {
            const email = req.email || req.body.email;
            req.user = await User.findByEmail(email);
            next();
        } catch (err) {
            next(err);
        }
    }

    async function signupUser (req, res, next) {
        try {
            if (req.user) {
                return next(new Errors.BadRequest('Email is already registered'));
            }
            req.user = await User.create(req.body);
            next();
        } catch (err) {
            next(err);
        }
    }

    async function loginUser (req, res, next) {
        try {
            if (!req.user) {
                return next();
            }

            const same = await User.comparePassword(req.body.password, req.user.password);
            if (!same) {
                return next(new Errors.BadRequest('Password is not matching email address'));
            }
            next();
        } catch (err) {
            next(err);
        }
    }

    async function findUserItems (req, res, next) {
        try {
            if (!req.user) {
                return next();
            }

            req.items = await Item.getArtistItems(req.email);
            next();
        } catch (err) {
            next(err);
        }
    }

    async function generateAccessToken (req, res, next) {
        try {
            if (!req.user) {
                return next();
            }

            req.accessToken = await User.generateAccessToken(req.user.email);
            next();
        } catch (err) {
            next(err);
        }
    }

    function returnItems(req, res) {
        res.json(req.items.map(Item.transformResponse));
    }

    function returnUser(req, res, next) {
        if (!req.user) {
            return next(new Errors.NotFound('User with this email is not found'));
        }
        const user = User.transformResponse(req.user);
        const data = req.accessToken ? { accessToken: req.accessToken, user } : user;
        res.json(data);
    }

    return router;
}
