class IError extends Error {
  status: number;
}

class NotFound extends IError {

  constructor(msg) {
    super(msg);
    this.message = msg || 'Not Found';
    this.status = 404;
    Error.captureStackTrace(this);
  }
}

class Forbidden extends IError {
  constructor(msg) {
    super(msg);
    this.message = msg || 'Forbidden';
    this.status = 403;
    Error.captureStackTrace(this);
  }
}

class Unauthorized extends IError {
  constructor(msg) {
    super(msg);
    this.message = msg || 'Unauthorized';
    this.status = 401;
    Error.captureStackTrace(this);
  }
}

export class BadRequest extends IError {
  constructor(msg) {
    super(msg);
    this.message = msg || 'Bad Request';
    this.status = 400;
    Error.captureStackTrace(this);
  }
}

export default { Unauthorized, BadRequest, Forbidden, NotFound };
