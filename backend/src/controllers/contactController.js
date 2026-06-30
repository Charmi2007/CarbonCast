const catchAsync = require('../middlewares/catchAsync');

exports.submitContact = catchAsync(async (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ status: 'error', message: 'Please provide name, email, and message' });
  }

  // Dummy logic to save contact form
  // Contact.create(req.body)

  res.status(200).json({
    status: 'success',
    message: 'Thank you! Your message has been received.'
  });
});
