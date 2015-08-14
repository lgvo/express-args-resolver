import chai from 'chai';

import {paramResolversFor, proxy, addResolver, changeDefault, resetDefault} from './express-args-resolver'; 

const expect = chai.expect;

describe('Params Resolver', function() {

    it('should resolve request param', function() {

       var resolvers = paramResolversFor(function(req){
           return req;
       });

       expect(resolvers.length).to.be.equal(1);
       expect(resolvers[0]('request', 'response', 'next')).to.equal('request');

       
       resolvers = paramResolversFor(function(request){
           return request;
       });

       expect(resolvers.length).to.be.equal(1);
       expect(resolvers[0]('req', 'res', 'next')).to.equal('req');
        
    });

    it('should resolve response param', function() {

        var resolvers = paramResolversFor(function(res) {
            return res;
        });

        expect(resolvers.length).to.equal(1);
        expect(resolvers[0]('request', 'response', 'next')).to.equal('response');
        
        resolvers = paramResolversFor(function(response) {
            return response;
        });

        expect(resolvers.length).to.equal(1);
        expect(resolvers[0]('req', 'res', 'next')).to.equal('res');
        
    });

    it('should resolve next param', function() {
        
        var resolvers = paramResolversFor(function(next) {
            return next;
        });

        expect(resolvers.length).to.equal(1);
        expect(resolvers[0]('request', 'response', 'next')).to.equal('next');
        
    });

    it('should resolve params', function() {

        var req = {
            params: 'params'
        };
        
        var resolvers = paramResolversFor(function(params) {
            return params;
        });

        expect(resolvers.length).to.equal(1);
        expect(resolvers[0](req, 'response', 'next')).to.equal('params');
        
    });

    it('should resolve query', function() {

        var req = {
            query: 'query'
        };
        
        var resolvers = paramResolversFor(function(query) {
            return query;
        });

        expect(resolvers.length).to.equal(1);
        expect(resolvers[0](req, 'response', 'next')).to.equal('query');
        
    });

    it('should resolve body', function() {

        var req = {
            body: 'data'
        };
        
        var resolvers = paramResolversFor(function(body) {
            return body;
        });

        expect(resolvers.length).to.equal(1);
        expect(resolvers[0](req, 'response', 'next')).to.equal('data');
        
    });

    it('should resolve from params and query by default', function() {

        var reqWithParam = {
            params: {
                id: "param"
            }
        };

        var resolvers = paramResolversFor(function(id) {
            return id;
        });

        expect(resolvers.length).to.equal(1);
        expect(resolvers[0](reqWithParam)).to.equal('param');

        var reqWithQuery = {
            query: {
                id: "query"
            }
        };
        
        expect(resolvers[0](reqWithQuery)).to.equal('query');

        var reqWithBoth = {
            query: {
                id: "query"
            }, 
            params: {
                id: "param"
            }
        };

        expect(resolvers[0](reqWithBoth)).to.equal('param');

    });

    it('should be able to add a Resolver', function() {

        var object = {};
        addResolver("newResolver", () => object);

        var resolvers = paramResolversFor(function(newResolver) {});

        expect(resolvers[0]()).to.equal(object);

    });

    it('should be able to change the default resolver', function() {

        changeDefault((name) => {
            return function(req, res, next) {
                return `new:${name}`;
            };
        });

        var resolvers = paramResolversFor(function(id) {});

        expect(resolvers[0]()).to.equal('new:id');
        resetDefault();
        
    });

});

describe('Proxy', function() {

    it('should create a proxy closure to pass the params', function() {
        var req = {
            query: {
                id: "query"
            },
            params: {
                name: "param"
            }
        };

        var proxyFunction = proxy(function(res, id, next, name) {
            return {id, name, res, next};
        });

        var result = proxyFunction(req, 'res', 'next');
        
        expect(result.id).to.equal('query');
        expect(result.name).to.equal('param');
        expect(result.res).to.equal('res');
        expect(result.next).to.equal('next');
    });

    it('should create only if necessary (params in the original order: req, res, next must use the same function)', function() {

        function req(request) {

        }

        function reqRes(req, res) {

        }

        function reqResNext(req, res, next) {

        }

        expect(proxy(req)).to.equal(req);
        expect(proxy(reqRes)).to.equal(reqRes);
        expect(proxy(reqResNext)).to.equal(reqResNext);

    });

});
