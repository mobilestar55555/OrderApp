import errors from '../utils/errors';

export function handleNotFound(req, res, next) {
  return next(new errors.NotFound(null));
}
