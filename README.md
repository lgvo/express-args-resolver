# Express Arguments Resolver

Resolve function arguments to express objects based on the arguments names.

## Installation

```sh
$ npm install --save express-args-resolver
```

## Usage

###  Express app

```javascript
var express = require('express'),
    bodyParser = require('body-parser'),
    argsResolver = require('express-args-resolver');


var expressApp = express();
expressApp.use(bodyParser.text());

// to simplify the use of argsResolver.proxy
var app = {
    use: function(path, func) {
        expressApp.use(path, argsResolver.proxy(func));
    }
};

// the endpoints definitions go Here ...

expressApp.listen(3000, function() {
    console.log('Up and Running!');
});
```

The proxy function will create a closure resolving the arguments by name.

### Request.params

```javascript
app.use('/param/:id', function(id, res) {
    res.send(id);
});
```

In that case the closure will work someway like this:
```javascript
function inner(id, res) {
    res.send(id);
}

function out(req, res, next) {
    var id = req.params['id'] || req.query['id'];
    return inner(id, res);
}
```

So we can call this endpoint from curl to test it:
```shell
$ curl http://localhost:3000/param/1234
1234
```

It will look on the resolver table trying to find a resolver for that name.
We have one for res that pass the Response object, if it can't find one a default will be created, will look for the argument name on the params and on the query in that order.

### Request.query

```javascript
app.use('/query', function(name, res) {
    res.send(name);
});
```

In that case we don't have 'name' on the params object, we can pass it as a query:
```shell
$ curl http://localhost:3000/query?name=test
test
```

### Request.body

```javascript
app.use('/body', function(body, res) {
    res.send(body);
});
```

Same here using bodyParser and resolving the body argument:

```shell
$ curl http://localhost:3000/body --data "dataSent" --header "Content-Type: text/plain"
dataSent
```

### List of resolvers

* req: Request 
* request: Request
* res: Response 
* response: Response 
* next: next (callback) 
* params: Request.params 
* query: Request.query 
* body: Request.body 

### Add / change resolvers

You can add your own resolver. If you are using something like passport for auth, maybe you want to have a resolver for user and/or username.

```javascript
// resolver for user
argsResolver.addResolver('user', function(req, res, next) {
    return req.user;
});

// resolver for username
argsResolver.addResolver('username', function(req, res, next) {
    if (req.user) {
        return req.user.username;
    }
});
```

### Change the default resolver

The default resolver is used to resolve any param that is not in the table.
If you don't change, it will look at the params for the name and if not found at the query.


Lets say you want to look at the body insted.
You can do that:

```javascript

// by default will look at body properties
argsResolver.changeDefault(function(name) {
    return function(req, res, next) {
        if (req.body && req.body[name]) {
            return req.body[name];
        }
    };
});

```

## License
[MIT](LICENSE)
