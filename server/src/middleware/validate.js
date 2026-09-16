/**
 * Usage: router.post('/x', validate(schema), handler)
 * Parses req.body against a Zod schema, replacing req.body with the
 * parsed (and type-coerced) result. Throws ZodError on failure, caught
 * by the central error handler.
 */
function validate(schema) {
  return (req, res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}

module.exports = validate;
