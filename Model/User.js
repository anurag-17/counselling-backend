const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    mobile: {
      type: String,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    cast: {
      type: String
    },
    role: {
      type: String,
      enum: ['student', 'parent'],
      default: 'student',
    },
    activeToken: {
      type: String,
    },
    address: String,
    state: {
      type: String
    },
    city: {
      type: String
    },
    documents: [{ 
      type: String 
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    careerGoals: { 
      type: String 
    },
    tenthPercentage: {
      type: String
    },
    twelfthPercentage: {
      type: String
    },
    neetScore: {
      type: String
    },
    fathersName: { 
      type: String 
    },
    fathersOccupation: {
      type: String
    },
    mothersName: {
      type: String
    },
    mothersOccupation: {
      type: String
    },
    wishlist: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'College'
    }],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.passwordResetToken = resetToken;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
