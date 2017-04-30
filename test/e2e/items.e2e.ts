import * as supertest from 'supertest';
import * as c0nfig from 'c0nfig';
import { getTestUser, getUserAccessToken } from '../mocks';

let request = supertest(`${c0nfig.apiUrl}/items`);
let authHeaders;
let authUser;

let itemData = {
    title: 'Basket Case',
    description: 'Seventh track and third single from Green Day third album, Dookie (1994).',
    isPublic: true
};

describe('/items endpoints', () => {
    beforeEach(async done => {
        try {
            const { user, accessToken } = await getTestUser();
            authUser = user;
            authHeaders = {'X-Access-Token': accessToken};
            done();
        } catch (err) {
            done();
        }
    });

    describe('POST /', () => {
        describe('when creating item as a listener', () => {
            let invalidAuthHeaders;

            beforeEach(async done => {
                try {
                    const accessToken = await getUserAccessToken('listener');
                    invalidAuthHeaders = {'X-Access-Token': accessToken};
                    done();
                } catch (err) {
                    done();
                }
            });

            it('should return a proper error', done => {
                request
                    .post('/')
                    .set(invalidAuthHeaders)
                    .send(itemData)
                    .expect(403)
                    .expect(res => {
                        expect(Object.keys(res.body)).toContain('errors');
                        expect(res.body.errors.length).toEqual(1);
                        expect(res.body.errors[0].message).toEqual('Only artist have permission to execute this operation');
                    })
                    .end(_ => done());
            });
        });

        describe('when creating item as an artist', () => {
            let createdItem: any = {};

            it('should create new item successfully', done => {
                request
                    .post('/')
                    .set(authHeaders)
                    .send(itemData)
                    .expect(200)
                    .expect(res => {
                        const keys = Object.keys(itemData).concat(['_id', 'owner']);
                        expect(Object.keys(res.body)).toEqual(Object.keys(res.body).concat(keys));
                        expect(res.body.owner).toEqual(authUser.email);

                        createdItem = res.body;
                    })
                    .end(_ => done());
            });

            describe('GET /:id', () => {
                describe('when getting created item', () => {
                    it('should return item successfully', done => {
                        request
                            .get(`/${createdItem._id}`)
                            .set(authHeaders)
                            .expect(200)
                            .expect(res => {
                                const keys = Object.keys(itemData).concat(['_id', 'owner']);
                                expect(Object.keys(res.body)).toEqual(Object.keys(res.body).concat(keys));
                                expect(res.body._id).toEqual(createdItem._id);
                                expect(res.body.owner).toEqual(authUser.email);
                            })
                            .end(_ => done());
                    });

                    describe('PUT /:id', () => {
                        let itemUpdatedData = Object.assign({}, itemData, {
                            title: 'Basket Case (Single)'
                        });

                        describe('when updating created item', () => {
                            it('should return updated successfully', done => {
                                request
                                    .put(`/${createdItem._id}`)
                                    .set(authHeaders)
                                    .send(itemUpdatedData)
                                    .expect(200)
                                    .expect(res => {
                                        const keys = Object.keys(itemData).concat(['_id', 'owner']);
                                        expect(Object.keys(res.body)).toEqual(Object.keys(res.body).concat(keys));
                                        expect(res.body.owner).toEqual(authUser.email);
                                        expect(res.body.title).toEqual(itemUpdatedData.title);
                                    })
                                    .end(_ => done());
                            });

                            describe('when getting updated item', () => {
                                it('should return item successfully', done => {
                                    request
                                        .get(`/${createdItem._id}`)
                                        .set(authHeaders)
                                        .expect(200)
                                        .expect(res => {
                                            const keys = Object.keys(itemData).concat(['_id', 'owner']);
                                            expect(Object.keys(res.body)).toEqual(Object.keys(res.body).concat(keys));
                                            expect(res.body.owner).toEqual(authUser.email);
                                            expect(res.body.title).toEqual(itemUpdatedData.title);
                                        })
                                        .end(_ => done());
                                });

                                describe('DELETE /:id', () => {
                                    describe('when deleting created item', () => {
                                        it('should delete item successfully', done => {
                                            request
                                                .del(`/${createdItem._id}`)
                                                .set(authHeaders)
                                                .expect(204)
                                                .end(_ => done());
                                        });

                                        describe('when getting deleted item', () => {
                                            it('should return a proper error', done => {
                                                request
                                                    .get(`/${createdItem._id}`)
                                                    .set(authHeaders)
                                                    .expect(404)
                                                    .expect(res => {
                                                        expect(Object.keys(res.body)).toContain('errors');
                                                        expect(res.body.errors.length).toEqual(1);
                                                        expect(res.body.errors[0].message).toEqual('Item not found');
                                                    })
                                                    .end(_ => done());
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
