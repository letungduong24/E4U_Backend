const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Xác thực thất bại',
      errors: errorMessages
    });
  }

  next();
};

module.exports = validate;
