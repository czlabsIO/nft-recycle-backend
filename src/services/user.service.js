const User = require('../models/user');

class UserService {
  createUser(data) {
    return User.create(data);
  }

  getUserById(_id) {
    return User.findById(_id);
  }

  getUserByEmail(email) {
    return User.findOne({ email });
  }

  getUserByTwitterId(id) {
    return User.findOne({ twitterId: id });
  }
}

module.exports = UserService;
