import * as supertest from 'supertest';

import * as c0nfig from 'c0nfig';
import { createTestEmail, getTestUser, generateItems } from '../mocks';

let request = supertest(`${c0nfig.apiUrl}/user`);
let userData = {
    email: createTestEmail(),
    password: 'qwerty',
    firstName: 'John',
    lastName: 'Doe',
    role: 'artist'
};

describe('/user endpoints', () => {
    describe('POST /signup', () => {
        describe('when sending not valid user data', () => {
            describe('when email is not valid', () => {
                it('should not register new user', done => {
                    request
                        .post('/signup')
                        .send(Object.assign({}, userData, {email: 'notvalid'}))
                        .expect(400)
                        .expect(res => {
                            expect(Object.keys(res.body)).toContain('errors');

                            let [ error ] = res.body.errors;
                            expect(error.message).toEqual('must be email format');
                        })
                        .end(_ => done());
                });
            });

            describe('when some field is missed', () => {
                it('should not register new user', done => {
                    request
                        .post('/signup')
                        .send({email: 'valid@example.com', 'password': 'qwerty'})
                        .expect(400)
                        .expect(res => {
                            expect(Object.keys(res.body)).toContain('errors');
                            expect(res.body.errors.length).toEqual(3);
                        })
                        .end(_ => done());
                });
            });
        });

        describe('when creating non-existed user', () => {
            it('should register and return new user with access token', done => {
                request
                    .post('/signup')
                    .send(userData)
                    .expect(200)
                    .expect(res => {
                        expect(Object.keys(res.body)).toEqual(Object.keys(res.body).concat(['accessToken', 'user']));
                        expect(Object.keys(res.body.user)).toEqual(Object.keys(res.body.user).concat(['email', 'firstName', 'lastName', 'role']));
                        expect(res.body.user.email).toEqual(userData.email);
                    })
                    .end(_ => done());
            });

            describe('when trying to create existed user', () => {
                it('should return error', done => {
                    request
                        .post('/signup')
                        .send(userData)
                        .expect(400)
                        .expect(res => {
                            expect(Object.keys(res.body)).toContain('errors');
                        })
                        .end(_ => done());
                });
            });

            describe('POST /login', () => {
                describe('when login with valid credentianls', () => {
                    let validAccessToken = '12345';

                    it('should return user and access token', done => {
                        request
                            .post('/login')
                            .send({email: userData.email, password: userData.password})
                            .expect(200)
                            .expect(res => {
                                expect(Object.keys(res.body)).toEqual(Object.keys(res.body).concat(['accessToken', 'user']));
                                expect(Object.keys(res.body.user)).toEqual(Object.keys(res.body.user).concat(['email', 'firstName', 'lastName', 'role']));
                                expect(res.body.user.email).toEqual(userData.email);

                                validAccessToken = res.body.accessToken;
                            })
                            .end(_ => done());
                    });

                    describe('GET /me', () => {
                        describe('when requesting self info as authorized user', () => {
                            it('should return user and access token', done => {
                                request
                                    .get('/me')
                                    .set({'X-Access-Token': validAccessToken})
                                    .expect(200)
                                    .expect(res => {
                                        expect(Object.keys(res.body)).toEqual(Object.keys(res.body).concat(['email', 'firstName', 'lastName', 'role']));
                                        expect(res.body.email).toEqual(userData.email);
                                    })
                                    .end(_ => done());
                            });
                        });

                        describe('when requesting self info as non-authorized user', () => {
                            it('should return user and access token', done => {
                                request
                                    .get('/me')
                                    .set({'X-Access-Token': '12345'})
                                    .expect(401)
                                    .expect(res => {
                                        expect(Object.keys(res.body)).toContain('errors');
                                        expect(res.body.errors.length).toEqual(1);
                                        expect(res.body.errors[0].message).toEqual('User is not authorized');
                                    })
                                    .end(_ => done());
                            });
                        });
                    });
                });

                describe('when trying to login with invalid email', () => {
                    it('should return error', done => {
                        request
                            .post('/login')
                            .send({email: 'notvalid', password: 'qwerty'})
                            .expect(400)
                            .expect(res => {
                                expect(Object.keys(res.body)).toContain('errors');
                                expect(res.body.errors.length).toEqual(1);
                            })
                            .end(_ => done());
                    });
                });

                describe('when trying to login with invalid password', () => {
                    it('should return error', done => {
                        request
                            .post('/login')
                            .send({email: userData.email, password: 'foo'})
                            .expect(400)
                            .expect(res => {
                                expect(Object.keys(res.body)).toContain('errors');
                                expect(res.body.errors.length).toEqual(1);
                            })
                            .end(_ => done());
                    });
                });
            });
        });
    });

    describe('GET /items', () => {
        let testUser, authHeaders;

        describe('signup a new user and create some items', () => {
            beforeEach(async done => {
                try {
                    let { user, accessToken } = await getTestUser();
                    authHeaders = {'X-Access-Token': accessToken};
                    testUser = user;
                    done();
                } catch (err) {
                    done();
                }
            });

            beforeEach(async done => {
                try {
                    await generateItems(testUser.email);
                    done();
                } catch (err) {
                    done();
                }
            });

            describe('when getting items and user not logged in', () => {
                it('should return an error', done => {
                    request
                        .get('/items')
                        .expect(401)
                        .end(_ => done());
                });
            });

            describe('when getting items for logged in user', () => {
                it('should return an array of items', done => {
                    request
                        .get('/items')
                        .set(authHeaders)
                        .expect(200)
                        .expect(res => {
                            expect(Array.isArray(res.body)).toEqual(true);
                            expect(res.body.length).toEqual(5);
                            expect(res.body[0].owner).toEqual(testUser.email);
                        })
                        .end(_ => done());
                });
            });
        });
    });
});
