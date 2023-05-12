const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      ref_code: decoded.ref_code,
      username: decoded.username,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
  }
};

function authorize(
  allowedRoles = ["super-admin", "admin", "user"],
  allowedRolesInRequestBody = []
) {
  return (req, res, next) => {
    const userRoleAllowed = allowedRoles.includes(req.user.role);
    const requestBodyRoleAllowed =
      allowedRolesInRequestBody.length === 0
        ? true
        : allowedRolesInRequestBody.includes(req.body.role);

    if (userRoleAllowed && requestBodyRoleAllowed) {
      next(); // Continue to the next middleware function or route handler
    } else {
      res.status(403).json({
        message: "Forbidden: You do not have permission to perform this action",
      });
      // Don't call next() here, as the request should not proceed further
    }
  };
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticate,
  authorize,
  verifyToken,
};
