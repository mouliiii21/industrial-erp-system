const { ZodError } = require('zod');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Postgres FK / unique / check constraint violations that slipped past
  // application-level validation still come back as a clean 4xx instead
  // of a raw stack trace.
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with this value already exists.' });
  }
  if (err.code === '23503') {
    return res.status(409).json({ error: 'Referenced record does not exist.' });
  }
  if (err.code === '23514') {
    return res.status(409).json({ error: 'Operation violates a data constraint.' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
