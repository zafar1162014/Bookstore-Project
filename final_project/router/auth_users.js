const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
	//returns boolean
	let validUser = users.filter((user) => user.username === username);
	if (validUser.length > 0) {
		return false;
	}
	return true;
	//write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
	let authUser = users.filter(
		(user) => user.username === username && user.password === password
	);
	if (authUser.length > 0) {
		return true;
	}
	return false;
};

//only registered users can login
regd_users.post('/login', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	if (!username || !password) {
		return res.status(208).json({ message: 'Invalid credentials' });
	}
	if (authenticatedUser(username, password)) {
		let accessToken = jwt.sign({ data: password }, 'access', {
			expiresIn: 660 * 60,
		});

		req.session.authorization = {
			accessToken,
			username,
		};
		return res
			.status(200)
			.json({ message: `${username} Logged in successfully` });
	}
	return res.status(300).json({ message: 'Invalid credentials' });
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
	const username = req.session.authorization.username;
	const ISBN = req.params.isbn;
	let review = req.query.review;
	if (!username) {
		return res.send({ message: 'User not authorized' });
	}
	if (!books[ISBN]) {
		return res.send({ message: 'Book not found' });
	}
	if (!review) {
		return res.send({ message: 'Please provide a review' });
	}
	books[ISBN].reviews[username] = review;
	return res
		.status(200)
		.json({ book: books[ISBN], message: 'Review added successfully' });
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
	let user = req.session.authorization.username;
	let ISBN = req.params.isbn;
	if (!user) {
		return res.send({ message: 'User not authorized' });
	}
	if (!books[ISBN]) {
		return res.send({ message: 'Book not found' });
	}
	delete books[ISBN].reviews[user];
	return res.send({
		book: books[ISBN],
		message: `Deleted ${user}'s review successfully`,
	});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
