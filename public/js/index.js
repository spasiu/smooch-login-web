'use strict';

$('.message a').click(function(){
   $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});

$('.login-action').click(function(e) {
	e.preventDefault();
	var username = $('.login-username').val();
	var password = $('.login-password').val();
	login(username, password);
});

$('.signup-action').click(function(e) {
	e.preventDefault();
	var name = $('.signup-name').val();
	var username = $('.signup-username').val();
	var password = $('.signup-password').val();
	signup(username, password, name);
});

// call backend to signup
function signup(username, password, name) {
  fetch('/signup', {
    method: 'post',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password,
      name: name
    })
  })
    .then(res => {
      if (!res.ok) throw Error(res.statusText);
      return;
    })
    .then(() => console.log('signup', username));
}

// call backend to login, then call login method of Smooch SDK with response params
function login(username, password) {
  fetch('/login', {
    method: 'post',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    })
  })
    .then(res => {
      if (!res.ok) throw Error(res.statusText);
      return res.json();
    })
    .then(data => {
    	console.log('userId:', data.username, '\ntoken:', data.token);
    	Smooch.login(data.username, data.token);
    	$('#user').text('authenticated as ' + data.username);
    })
    .then(() => console.log('login', username));
}