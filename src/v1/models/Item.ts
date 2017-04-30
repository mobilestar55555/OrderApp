import db from '../../utils/db';

export class Item {
  static create(doc) {
    return new Promise((resolve, reject) => {
      const item = Object.assign({}, doc, {
        isPublic: doc.isPublic || true,
        createdAt: Date.now()
      });
      db.items.insert(item, (err, saved) => {
        err ? reject(err) : resolve(saved);
      });
    });
  }

  static findById(_id) {
    return new Promise((resolve, reject) => {
        db.items.findOne({ _id }, (err, item) => {
            err ? reject(err) : resolve(item);
        });
    });
  }

  static update(oldItem, doc) {
    return new Promise((resolve, reject) => {
        const newItem = Object.assign({}, oldItem, doc);
        db.items.update({_id: oldItem._id }, newItem, {}, (err) => {
            err ? reject(err) : resolve(newItem);
        });
    });
  }

  static remove(_id) {
    return new Promise((resolve, reject) => {
        db.items.remove({ _id }, {}, (err, num, item) => {
            err ? reject(err) : resolve(item);
        });
    });
  }

  static getArtistItems(owner) {
    return new Promise((resolve, reject) => {
        db.items.find({ owner }, (err, items) => {
            err ? reject(err) : resolve(db.items);
        });
    });
  }

  static transformResponse(item) {
    const { _id, owner, title, description, isPublic } = item;
    return Object.assign({}, { _id, owner, title, description, isPublic });
  }
}

export const itemSchema = {
  payload: {
      title: {
          type: 'string',
          required: true
      },
      description: {
          type: 'string'
      },
      isPublic: {
          type: 'boolean'
      }
  }
};
