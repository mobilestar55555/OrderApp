/**
 * All datastores are in-memory
 */

import * as Datastore from 'nedb';

const items = new Datastore();
const users = new Datastore();

users.ensureIndex({fieldName: 'email', unique: true});

export default {
	items,
	users
};
