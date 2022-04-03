const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByProperty, createNewUser } = require("./user");
const error = require("../utils/error");
const { JWT_SECRET_KEY } = require("../utils");
const { JWT_EXPIRE_TIME } = require("../config");

const registerService = async ({ name, email, password }) => {
	let user = await findUserByProperty("email", email);
	if (user) throw error("User already exist", 400);

	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(password, salt);

	return createNewUser({ name, email, password: hash });
};

const loginService = async ({ email, password }) => {
	const user = await findUserByProperty("email", email);
	if (!user) throw error("Invalid Credential", 400);

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) throw error("Invalid Credential", 400);

	const payload = {
		_id: user._id,
		name: user.name,
		email: user.email,
	};
	return jwt.sign(payload, JWT_SECRET_KEY, JWT_EXPIRE_TIME);
};

module.exports = { registerService, loginService };
