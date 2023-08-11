const isAuth = (req, res, next) => {
  if(req.session.isAuth) {
    next();
  } else {
    return res.send({
      status: 401,
      message: "Invalid session, please login agian.",
    })
  }
};

module.exports = { isAuth };
