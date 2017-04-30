import { User } from '../../src/v1/models/User';
import { createTestEmail } from '../mocks';

describe('User model static methods', () => {
    let email = createTestEmail();
    let token;

    describe('when generating access token', () => {
        beforeEach(() => token = User.generateAccessToken(email));

        it('should return access token string', () => {
            expect(typeof token).toEqual('string');
        });

        describe('when validating access token', function () {
            let validEmail;

            beforeEach(() => validEmail = User.validateAccessToken(token));

            it('should return email used for this token', () => {
                expect(validEmail).toEqual(email);
            });
        });
    });
});
