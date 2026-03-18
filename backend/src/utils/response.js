// Función para enviar una respuesta exitosa con datos
const ok = (res, data, status = 200) => {
  return res.status(status).json({
    data,
  });
};
// Función para enviar una respuesta con un mensaje personalizado
const message = (res, text, status = 200, data = null) => {
  const payload = { message: text };

  if (data !== null) {
    payload.data = data;
  }

  return res.status(status).json(payload);
};
// Función para enviar una respuesta de error
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