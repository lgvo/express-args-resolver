// express-args-resolver - A resolver of arguments for express
// Copyright © 2015 Luis Gustavo Vilela de Oliveira
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import functionArgsNames from 'js-args-names';

function getRequest(req) {
    return req;
}

function getResponse(req, res) {
    return res;
}

function getNextCallback(req, res, next) {
   return next;
}

function getParam(req, name) {
    if (req.params && req.params[name]) {
        return req.params[name];
    }
}

function getQueryParam(req, name) {
    if (req.query && req.query[name]) {
        return req.query[name];
    }
}

function makeDefault(name) {
    return function getParamOrQuery(req) {
        return getParam(req, name) || getQueryParam(req, name);
    };
}

function getParams(req) {
    return req.params;
}

function getQuery(req) {
    return req.query;
}

var resolverMake = makeDefault;

var resolvers = {
    "req": getRequest,
    "request": getRequest,
    "res": getResponse,
    "response": getResponse,
    "next": getNextCallback,
    "params": getParams,
    "query": getQuery
};

export function getResolvers(func) {
    return functionArgsNames(func).map(function(name) {
        return resolvers[name] || resolverMake(name); 
    });
}

function resolverNotNecessary(func, resolvers) {
    return (func.length === 1 && resolvers[0] === getRequest) ||
            (func.length === 2 && resolvers[0] === getRequest && resolvers[1] === getResponse) ||
            (func.length === 3 && resolvers[0] === getRequest && resolvers[1] === getResponse && 
             resolvers[2] === getNextCallback);
}

export function proxy(func, bind) {

    var resolvers = getResolvers(func);

    if (resolverNotNecessary(func, resolvers)) {
        return func;
    }

    return function(req, res, next) {
        return func.apply(bind, resolvers.map(function(resolver) {
            return resolver(req, res, next);
        }));
    };
}

export function changeDefault(func) {
    resolverMake = func;
}

export function resetDefault() {
    resolverMake = makeDefault;
}

export function addResolver(name, func) {
    resolvers[name] = func;
}

export function paramResolversFor(func) {
    return functionArgsNames(func).map(function(name) {
        return resolvers[name] || resolverMake(name);
    });
}
