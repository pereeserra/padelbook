const ok = (res, data, status = 200) => {
  return res.status(status).json({
    data,
  });
};

const message = (res, text, status = 200, data = null) => {
  const payload = { message: text };

  if (data !== null) {
    payload.data = data;
  }

  return res.status(status).json(payload);
};

const fail = (res, text, status = 500) => {
  return res.status(status).json({
    error: text,
  });
};

module.exports = {
  ok,
  message,
  fail,
};