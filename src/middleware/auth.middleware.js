const jwt = require('jsonwebtoken');
const UsersService = require('../services/user.service');
const { BadRequest, Unauthorized } = require('http-errors');

const usersService = new UsersService();

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) throw new Unauthorized('Access denied, no token found.');
  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await usersService.getUserById(_id);
    if (!user) throw new BadRequest('User not found');
    req.user = user;
    next();
  } catch (ex) {
    throw new Unauthorized('Invalid token');
  }
};

const checkAuthToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    req.user = null;
    next();
    return;
  }
  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await usersService.getUserById(_id);
    if (!user) throw new BadRequest('User not found');
    req.user = user;
    next();
  } catch (ex) {
    throw new Unauthorized('Invalid token');
  }
};

module.exports = { auth, checkAuthToken };
