const Counselor = require("../Model/CounselorModel");
const validateMongoDbId = require("../Utils/validateMongodbId");
const { generateToken , verifyToken} = require("../config/jwtToken");
const sendToken = require("../Utils/jwtToken");
const jwt = require("jsonwebtoken");

exports.registerCounselor = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingCounselor = await Counselor.findOne({ email });

    if (existingCounselor) {
      return res.status(203).json({ error: "Counselor with this email already exists." });
    }

    const counselorData = {
      email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      mobile: req.body.mobile,
    };

    if (password) {
      counselorData.password = password;
    }

    const newCounselor = await Counselor.create(counselorData);

    sendToken(newCounselor, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.counselorLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const findCounselor = await Counselor.findOne({ email }).select("+password");

    if (!findCounselor) {
      throw new Error("Counselor not found");
    }

    if (findCounselor.role !== "counselor") {
      throw new Error("Not Authorized");
    }

    if (await findCounselor.matchPasswords(password)) {
      const token = generateToken(findCounselor._id, findCounselor.role);

      await Counselor.findByIdAndUpdate(
        { _id: findCounselor._id?.toString() },
        { activeToken: token },
        { new: true }
      );

      const user = {
        success: true,
        user: {
          _id: findCounselor._id,
          firstname: findCounselor.firstname,
          lastname: findCounselor.lastname,
          email: findCounselor.email,
        },
        token: token,
      };

      return res.status(200).json(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

exports.logoutCounselor = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      token = authHeader;
    }
    
    if (!token) {
      return res
        .status(401)
        .json({ message: "Please login to access this resource" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const counselorData = await Counselor.findOne({_id:decodedData?.id});

    if (counselorData.activeToken && counselorData.activeToken === token) {
      const counselor = await Counselor.findOneAndUpdate(
        { _id: decodedData.id, activeToken: token },
        { $unset: { activeToken: "" } },
        { new: true }
      );
      if (!counselor) {
        return res
          .status(401)
          .json({ message: "Invalid session or token, please login again" });
      }
      return res.status(200).json({
        message: `${counselorData._id} is Logout Successfully`,
      });
    } else {
      return res
        .status(401)
        .json({ message: "Token expired, please login again" });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired, please login again" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      console.error("Other error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
};

exports.verifyCounselor = async (req, res) => {
  const { token } = req.params;

  try {
    const decodedData = verifyToken(token);

    if (!decodedData) {
      return res.status(401).json({ message: "Unauthorized Access" });
    }

    const { id } = decodedData;

    const loggedCounselor = await Counselor.findOne({ _id: id, activeToken: token }).select("-password -activeToken");

    if (!loggedCounselor) {
      return res.status(401).json({ message: "Unauthorized Access" });
    }

    return res.status(200).json({ data: loggedCounselor, message: "Verification Successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updateCounselor = async (req, res) => {
  try {
    const updatedCounselor = await Counselor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCounselor);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getAllCounselors = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const searchQuery = req.query.search;

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);

    const counselorQuery = Counselor.find();

    if (searchQuery) {
      counselorQuery.or([
        { firstname: { $regex: new RegExp(searchQuery, "i") } },
        { lastname: { $regex: new RegExp(searchQuery, "i") } },
        { email: { $regex: new RegExp(searchQuery, "i") } },
        { mobile: { $regex: new RegExp(searchQuery, "i") } },
      ]);
    }

    const totalItems = await Counselor.countDocuments(counselorQuery);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const skip = (currentPage - 1) * itemsPerPage;
    const counselors = await counselorQuery.sort({ firstname: 1 }).skip(skip).limit(itemsPerPage).exec();

    res.json({
      totalItems,
      totalPages,
      currentPage,
      counselors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getCounselorById = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id);
    res.status(200).json({
      counselor,
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteCounselor = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedCounselor = await Counselor.findByIdAndDelete(id);
    res.json({
      deletedCounselor,
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateCounselorPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { _id } = req.user._id;

    const counselor = await Counselor.findById(_id).select("+password");
    // Verify the current password
    const isPasswordMatch = await counselor.matchPasswords(oldPassword);
    if (!isPasswordMatch) {
      return res.status(203).json({ message: "Current password is incorrect" });
    }

    counselor.password = newPassword;
    counselor.passwordChangedAt = Date.now();
    await counselor.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Password change failed" });
  }
};

exports.forgotPasswordCounselor = async (req, res, next) => {
  const { email } = req.body;

  try {
    const counselor = await Counselor.findOne({ email });

    if (!counselor) {
      return res.status(401).json(`${email} this email is not registered`);
    }
    const resetToken = counselor.getResetPasswordToken();
    await counselor.save();

    const resetUrl = `http://localhost:4000/auth/reset-password/${resetToken}`;

    const message = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 5px;
            }
            .header {
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 5px 5px 0 0;
            }
            .content {
                padding: 20px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white !important;
                text-decoration: none;
                border-radius: 5px;
            }
            .footer {
                background-color: #f5f5f5;
                padding: 10px;
                border-top: 1px solid #e0e0e0;
                border-radius: 0 0 5px 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Hello ${counselor.firstname},</h2>
            </div>
            <div class="content">
                <p>We have received a request to reset your password for your account. If you did not request this change, you can ignore this email and your password will not be changed.</p>
                
                <p>To reset your password, please click on the following link and follow the instructions:</p>
                
                <p><a class="button" href="${resetUrl}">Reset Password</a></p>
                
                <p>This link will expire in <strong>15 minutes</strong> for security reasons. If you need to reset your password after this time, please make another request.</p>
            </div>
            <div class="footer">
                <h3>Thank you,</h3>
                <h3>Your Organization Team </h3>
            </div>
        </div>
    </body>
    </html>
    `;
    try {
      // Assuming you have an appropriate function to send emails
      // await sendEmail({
      //   to: counselor.email,
      //   subject: "Account Password Reset Link",
      //   text: message,
      // });
      res.status(200).json({
        success: true,
        data: "Password Reset Email Sent Successfully",
      });
    } catch (error) {
      counselor.passwordResetToken = undefined;
      counselor.passwordResetExpires = undefined;

      await counselor.save();

      return res
        .status(500)
        .json({ success: false, data: "Email could not be sent" });
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPasswordCounselor = async (req, res, next) => {
  try {
    const counselor = await Counselor.findOne({
      passwordResetToken: req.params.resetToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    
    if (!counselor) {
      res.status(400).json("Invalid Reset Token");
    }
    counselor.password = req.body.password;
    counselor.passwordResetToken = undefined;
    counselor.passwordResetExpires = undefined;

    await counselor.save();
    res.status(201).json({
      success: true,
      data: "Password Reset Successfully",
    });
  } catch (error) {
    next(error);
  }
};