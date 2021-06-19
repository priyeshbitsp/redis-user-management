const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();

client.on('connect', function(){
  console.log('Connected to Redis...');
});

// Set Port
const port = 3000;

// Init app
const app = express();

// View Engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// methodOverride
/*
NOTE It is very important that this module is used before any module that needs to know the method of the request (for example, 
it must be used prior to the csurf module).

-> methodOverride(getter, options)
Create a new middleware function to override the req.method property with a new value. This value will be pulled from the provided getter
*/
app.use(methodOverride('_method')); // "_method" is the parameter to be used while we make a delete request from a form using POST request

// Search Page
app.get('/', function(req, res, next){
    res.render('searchusers');
});

// Search processing
app.post('/user/search', function(req, res, next){
    let id = req.body.id;

    client.hgetall(id, function(err, obj){
        if(!obj){
            // If no user, show searchusers with an error
            res.render('searchusers', {
                error: 'User does not exist'
        });
        } else {
        obj.id = id;
        res.render('details', {
            user: obj
        });
        }
    });
});

// Add User Page
app.get('/user/add', function(req, res, next){
    res.render('adduser');
});

// Process Add User Page
app.post('/user/add', function(req, res, next){
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;
  
    client.hmset(id, [
      'first_name', first_name,
      'last_name', last_name,
      'email', email,
      'phone', phone
    ], function(err, reply){
      if(err){
        console.log("Error from redis service: ", err);
      }
      console.log("Reply from redis service: ", reply);
      res.redirect('/');
    });
});
  
// Delete User
// We are actually sending POST request from form to delete the user, but we override using method-override and param as _method
app.delete('/user/delete/:id', function(req, res, next){
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(port, function(){
    console.log('Server started on port '+port);
});