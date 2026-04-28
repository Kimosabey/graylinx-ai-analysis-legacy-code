module.exports = function permit(...allowed) {
  const isAllowed = role => allowed.indexOf(role) > -1;
  return (request, response, next) => {
    if (request.user && isAllowed(request.user.roleName)) next();
    else {
      response.status(403).json({ message: 'Forbidden' });
    }
  };
};
