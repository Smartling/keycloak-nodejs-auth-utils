'use strict';

const GrantManager = require('./../index').GrantManager;
const Config       = require('./../index').Config;
const test         = require('tape');

const delay = (ms) => (value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
const getManager = (fixture) => new GrantManager(new Config(fixture));

test( 'GrantManager in public mode should be able to obtain a grant', (t) => {
  const manager = getManager('spec/fixtures/keycloak-public.json');
  manager.obtainDirectly( 'test-user', 'tiger' )
    .then( (grant) => t.notEqual( grant.access_token, undefined ) )
    .then(t.end);
});

const manager = getManager('spec/fixtures/keycloak-confidential.json');

test( 'GrantManager in confidential mode should be able to obtain a grant', (t) => {
  manager.obtainDirectly( 'test-user', 'tiger' )
    .then( (grant) => t.notEqual( grant.access_token, undefined ) )
    .then(t.end);
});

test( 'GrantManager in confidential mode should be able to refresh a grant', (t) => {
  let originalAccessToken;
  manager.obtainDirectly( 'test-user', 'tiger' )
    .then( delay(3000) )
    .then( (grant) => {
      t.notEqual( grant.access_token, undefined );
      originalAccessToken = grant.access_token;
      return grant;
    })
    .then( (grant) => manager.ensureFreshness(grant) )
    .then( (grant)  => {
      t.notEqual( grant.access_token, undefined );
      t.notEqual( grant.access_token.token, originalAccessToken.token );
    })
    .then(t.end);
});

test( 'GrantManager in confidential mode should be able to validate a valid token', (t) => {
  let originalAccessToken;
  manager.obtainDirectly( 'test-user', 'tiger' )
    .then( (grant) => {
      originalAccessToken = grant.access_token;
      return manager.validateAccessToken( grant.access_token );
    })
    .then( (token) => {
      t.notEqual( token, undefined );
      t.equal( token, originalAccessToken );
    })
    .then(t.end);
});

test( 'GrantManager in confidential mode should be able to validate an invalid token', (t) => {
  let originalAccessToken;
  manager.obtainDirectly( 'test-user', 'tiger' )
    .then( delay(3000) )
    .then( (grant) => {
      originalAccessToken = grant.access_token;
      return manager.validateAccessToken(grant.access_token);
    })
    .then( (result) => t.equal( result, false ))
    .then(t.end);
});

test( 'GrantManager in confidential mode should be able to validate a valid token string', (t) => {
  let originalAccessToken;
  manager.obtainDirectly( 'test-user', 'tiger' )
    .then( (grant) => {
      originalAccessToken = grant.access_token.token;
      return manager.validateAccessToken( grant.access_token.token );
    })
    .then( (token) => {
      t.notEqual( token, undefined );
      t.equal( token, originalAccessToken );
    })
    .then(t.end);
});

test( 'GrantManager in confidential mode should be able to validate an invalid token string', (t) => {
  let originalAccessToken;
  manager.obtainDirectly( 'test-user', 'tiger' )
    .then( delay(3000) )
    .then( (grant) => {
      originalAccessToken = grant.access_token.token;
      return manager.validateAccessToken( grant.access_token.token );
    })
    .then( (result) => t.equal( result, false ))
    .then(t.end);
});
