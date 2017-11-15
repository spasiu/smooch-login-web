'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const Smooch = require('smooch-core');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT;
const APP_KEY_ID = process.env.KEY_ID;
const APP_SECRET = process.env.APP_SECRET;
const APP_ID = process.env.APP_ID;
const ACCOUNT_KEY_ID = process.env.ACCOUNT_KEY_ID;
const ACCOUNT_SECRET = process.env.ACCOUNT_SECRET;

const smooch = new Smooch({
	scope: 'account',
	keyId: ACCOUNT_KEY_ID,
	secret: ACCOUNT_SECRET
});

// the insecure non-persistent user store
const users = { };

express()
	.use(express.static('public'))
	.use(bodyParser.json())
	.post('/login', loginHandler)
	.post('/signup', signupHandler)
	.listen(PORT, () => console.log(`server running on port ${PORT}`));

// login handler, auths user and provides token and userId in response
function loginHandler(req, res) {
	if (!req.body.username) {
		res.status(400).json({ error: 'missing username' });
	}

	if (!req.body.password) {
		res.status(400).json({ error: 'missing password' });
	}

	const user = users[req.body.username];

	if (user && user.password === req.body.password) {
		res.status(200).json({
			username: user.username,
			token: user.token
		});

		return;
	}

	res.status(401).json({});
}

// signup user, calls Smooch to create a user and signs a JWT for smooch login
function signupHandler(req, res) {
	if (!req.body.username) {
		res.status(400).json({ error: 'missing username' });
	}

	if (!req.body.password) {
		res.status(400).json({ error: 'missing password' });
	}

	if (users[req.body.username]) {
		res.status(409).json({});
		return;
	}

	smooch.appUsers.create(APP_ID, req.body.username, {
		givenName: req.body.name
	})
		.then(data => {
			const token = jwt.sign({
				scope: 'appUser',
				userId: req.body.username
			}, APP_SECRET, {
				header: {
					alg: 'HS256',
					typ: 'JWT',
					kid: APP_KEY_ID
		        }
			});

			users[req.body.username] = Object.assign(req.body, { token });
			res.status(201).json({});
		})
		.catch(error => console.log('error::', error));

}