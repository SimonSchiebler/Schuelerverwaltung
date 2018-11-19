var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var LehrerSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String
	}
}, { collection: 'users' });

var User = module.exports = mongoose.model('User', LehrerSchema);

module.exports.createUser = function (newUser) {
	return this.checkIfUserExitst(newUser.username)
		.then(() => saveUser(newUser))

}

module.exports.checkIfUserExitst = function (username) {
	return new Promise((resolve, reject) => {
		User.findOne({
			username: {
				"$regex": "^" + username + "\\b", "$options": "i"
			}
		}, function (err, user) {
			if (err || user) {
				reject(err ? err : new Error(`User ${user.username} already esists`))
			} else {
				resolve(user)
			}
		})
	})
}

function saveUser(newUser) {
	return Promise((resolve, reject) => {
		return new Promise((resolve, reject) => {
			bcrypt.genSalt(10, function (err, salt) {
				bcrypt.hash(newUser.password, salt, function (err, hash) {
					newUser.password = hash;
					newUser.save((err, user) => resolve({ err: err, user: user }));
				});
			});
		})
	})
}

module.exports.getUserByUsername = function (username, ) {
	return new Promise((resolve, reject) => {
		var query = { username: username };
		User.findOne(query, (err, user) => resolve({ err: err, user: user }));
	})
}

module.exports.getUserById = function (id) {
	return new Promise((resolve, reject) => {
		User.findById(id, (err, user) => {
			resolve({ err: err, user: user })});
	})

}

module.exports.comparePassword = function (candidatePassword, user, callback) {
	let hash = user.user.password
	user = user.user;
	return new Promise((resolve, reject) => {
		bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
			if (err) {
				reject(err)
			} else {
				resolve({isMatch: isMatch, user: user});
			}
		});
	})
}