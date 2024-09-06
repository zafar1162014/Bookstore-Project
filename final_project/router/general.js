const express = require('express');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

public_users.post('/register', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	if (!username || !password) {
		return res.status(208).json({ message: 'Invalid credentials' });
	}
	if (isValid(username)) {
		users[username] = password;
		return res
			.status(200)
			.json({ users, message: `Registered ${username} successfully` });
	}
	return res.status(300).json({ message: `User ${username} already exists` });
});

// Get the book list available in the shop

public_users.get('/', async function (req, res) {
	try {
		if (books) {
			// Simulate async behavior
			const bookList = await new Promise((resolve) =>
				setTimeout(() => resolve(books), 100)
			);
			return res.status(200).json(bookList);
		}
		return res.status(300).json({ message: 'Yet to be implemented' });
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Internal Server Error', error: error.message });
	}
});

// Update this part in your general.js file
public_users.get('/isbn/:isbn', function (req, res) {
	let ISBN = req.params.isbn;

	// Simulate asynchronous behavior using a Promise
	new Promise((resolve, reject) => {
		setTimeout(() => {
			if (books[ISBN]) {
				resolve(books[ISBN]);
			} else {
				reject(new Error('Not Found'));
			}
		}, 100); // Simulate a delay (e.g., for database access)
	})
		.then((book) => {
			return res.status(200).json(book);
		})
		.catch((error) => {
			return res.status(404).json({ message: error.message });
		});
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
	let title = req.params.title.split('-').join(' ');
	let booksBytitle = [];
	for (let ISBN in books) {
		if (
			books[ISBN].title.toLowerCase() === title.toLowerCase() &&
			!booksBytitle.includes(books[ISBN])
		) {
			booksBytitle.push(books[ISBN]);
		}
	}
	if (booksBytitle.length > 0) {
		return res.status(200).json(booksBytitle);
	}
	return res.status(404).json({ title, message: 'Not Found' });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
	let ISBN = req.params.isbn;
	if (books[ISBN]) {
		return res.status(200).json(books[ISBN].reviews);
	}
	return res.status(404).json({ message: 'Not Found' });
});

module.exports.general = public_users;
