const { default: mongoose } = require('mongoose');
const jwt = require('jsonwebtoken');

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    walletAddress: {
      type: String,
    },
    discordId: {
      type: String,
    },
    googleId: {
      type: String,
    },
    twitterId: {
      type: String,
    },
    facebookId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.set('toJSON', { virtuals: true });
// userSchema.set('toObject', { virtuals: true });

userSchema.methods.generateAuthToken = function () {
  const payload = {
    _id: this._id,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
