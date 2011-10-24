// Using:
// - https://github.com/mikeal/request
// - http://vowsjs.org/
// - assert is a standard lib
var request = require ('request')
    , vows = require ('vows')
    , assert = require ('assert');

var BASE_URL = "http://local.todos.com:5984/todos/"
    , HEADERS = {
      'Content-Type': 'application/json'
    }
    , revisionReference;

vows.describe ('CouchApp Todos REST API')
  .addBatch ({
    "A PUT to /todos/test-host without data": {
      topic : function () {
        request ({
          uri: BASE_URL + "test-host",
          method: 'PUT',
          headers: HEADERS
        }, this.callback );
      } 
      , "should respond with 201" : function ( err, res, body ) {
        assert.equal ( res.statusCode, 201 );
      }
      , "should have an id 'test-host'" : function ( err, res, body ) {
        assert.equal ( JSON.parse( res.body )._id, 'test-host' );
      }
      , "response should contain empty todos []" : function ( err, res, body ) {
        assert.include ( JSON.parse( res.body ), 'todos' );
        assert.deepEqual ( JSON.parse( res.body ).todos, [] );
      }
    }
  })
  .addBatch({
    "A PUT to /todos/test-host with one todo item (an object)" : {
        topic : function () {
          request ({
            uri: BASE_URL + "test-host"
            , body: JSON.stringify({
                "title" : "Testing Todo",
                "isDone" : false
              })
            , method : "PUT"
            , headers : HEADERS
          }, this.callback );
        }
        , "should respond with 201" : function ( err, res, body ) {
          assert.equal ( res.statusCode, 201 );
        }
        , "should have an id 'test-host'" : function ( err, res, body ) {
          assert.equal ( JSON.parse( res.body )._id, 'test-host' )
        }
        , "response should contain todos array with one item" : function ( err, res, body ) {
          assert.include ( JSON.parse( res.body ), 'todos' );
          assert.deepEqual ( 
            JSON.parse( res.body ).todos
            , [{
              "title" : "Testing Todo",
              "isDone" : false,
              "_id" : 0
            }] 
          );
        }
    }
  })
  .addBatch({
    "A PUT to /todos/test-host with two todo items (an array)" : {
      topic : function () {
        request ({
            uri: BASE_URL + "test-host"
          , body: JSON.stringify([{
              "title" : "Testing Todo",
              "isDone" : false
            }
            , {
              "title" : "Testing Todo 2",
              "isDone" : true
            }])
          , method : "PUT"
          , headers : HEADERS
        }, this.callback );
      }
      , "should respond with 201" : function ( err, res, body ) {
        assert.equal ( res.statusCode, 201 );
      }
      , "should have an id 'test-host'" : function ( err, res, body ) {
        assert.equal ( JSON.parse( res.body )._id, 'test-host' )
      }
      , "response should contain todos array with two items" : function ( err, res, body ) {
        assert.include ( JSON.parse( res.body ), 'todos' );
        assert.deepEqual ( 
          JSON.parse( res.body ).todos
          , [{
              "title" : "Testing Todo"
              , "isDone" : false
              , "_id" : 0
            } 
            ,{
              "title" : "Testing Todo 2"
              , "isDone" : true
              , "_id" : 1
            }] 
        );
      }
    }
  })
  
  // .addBatch ({
  //   "A DELETE to /todos/host": {
  //     topic : function () {
  //       request ({
  //         uri: BASE_URL + "test-host",
  //         method: 'DELETE',
  //         headers: HEADERS
  //       }, this.callback )
  //     },
  //     "should respond with 200": function ( err, res, body ) {
  //       assert.equal(res.statusCode, 200);
  //     },
  //     "should respond with ok": function ( err, res, body ) {
  //       var result = JSON.parse ( body );
  //       assert.equal ( result.ok, true );
  //     }
  //   }
  // })
  .export(module);
