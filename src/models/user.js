const { default: mongoose } = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
      },
    },
  }
);

userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  const hash = crypto.createHash('sha256').update(user.password).digest('hex');
  user.password = hash;
  next();
});

userSchema.methods.verifyPassword = function (password) {
  return (
    this.password === crypto.createHash('sha256').update(password).digest('hex')
  );
};

userSchema.methods.generateAuthToken = function () {
  const payload = {
    _id: this._id,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
