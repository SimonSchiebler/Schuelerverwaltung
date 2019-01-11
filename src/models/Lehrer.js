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
	},
	rolle: {
		type: String
	}
}, { collection: 'users' });

var User = module.exports = mongoose.model('User', LehrerSchema);

module.exports.createUser = function (newUser) {
	return new Promise((resolve, reject) => {
		this.checkIfUserExitst(newUser.username)
		.then(() => saveUser(newUser))
		.then(() => resolve())
		.catch(() => reject())
	})
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
				resolve()
			}
		})
	})
}

function saveUser(newUser) {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(10, function (err, salt) {
			bcrypt.hash(newUser.password, salt, function (err, hash) {
				newUser.password = hash;
				newUser.save((err, user) => {
					if (!err) {
						resolve(user)
					} else {
						reject(err)
					}
				});
			});
		});
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
			resolve({ err: err, user: user })
		});
	})
}

module.exports.getAllUsers = function (role) {
	return new Promise((resolve, reject) => {
		User.find({ }, (err, Lehrerliste) => {
			if (err) {
				reject(err)
			} else {
				resolve(Lehrerliste)
			}
		});
	})

}

module.exports.UpdateUserPW = function (id, newPW) {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(10, function (err, salt) {
			bcrypt.hash(newPW, salt, function (err, hash) {
				User.update({ _id: id }, { password: hash }, (err, user) => {
					if (err) {
						reject()
					} else {
						resolve({ err: err, user: user })
					}
				});
			});
		});
	})
}

module.exports.deleteUserById = function (id) {
	return new Promise((resolve, reject) => {
		User.deleteOne({_id: id}, (err, user) => {
			if (err) {
				reject()
			} else {
				resolve({ err: err, user: user })
			}
		});
	})
}

module.exports.getUserByRole = function (role) {
	return new Promise((resolve, reject) => {
		User.find({ rolle: role }, (err, Lehrerliste) => {
			if (err) {
				reject(err)
			} else {
				resolve(Lehrerliste)
			}
		});
	})
}

module.exports.comparePassword = function (candidatePassword, user, callback) {
	return new Promise((resolve, reject) => {
		if (user.user){
			let hash = user.user.password
			user = user.user;

			bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
				if (err) {
					reject(err)
				} else {
					resolve({ isMatch: isMatch, user: user });
				}
			});
		}else{
			reject(new Error("User or Password incorrect"))
		}
	})
}