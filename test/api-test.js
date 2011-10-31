// CouchDB HTTP reference http://wiki.apache.org/couchdb/HTTP_Document_API
// 
//
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
    };

// Create a test suite
var test = vows.describe ('CouchApp Todos REST API');

// --------------------------------------------
// Testing PUTs
// ============================================
// This also tests PUTs for being idempotent – 
// we do a set of PUTs one after another and 
// we still have one resulting doc with that id / url
test
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
      , "should respond with an object with id 'test-host'" : 
      function ( err, res, body ) {
        assert.equal ( JSON.parse( body )._id, 'test-host' );
      }
      , "should respond with an object containing empty todos []" : 
      function ( err, res, body ) {
        assert.include ( JSON.parse( body ), 'todos' );
        assert.deepEqual ( JSON.parse( body ).todos, [] );
      }
    }
  })
  .addBatch ({
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
        , "should respond with an object with id 'test-host'" : 
        function ( err, res, body ) {
          assert.equal ( JSON.parse( body )._id, 'test-host' )
        }
        , "should respond with an object containing todos array with one item" : 
        function ( err, res, body ) {
          assert.include ( JSON.parse( body ), 'todos' );
          assert.deepEqual ( 
            JSON.parse( body ).todos
            , [{
              "title" : "Testing Todo",
              "isDone" : false,
              "_id" : 0
            }] 
          );
        }
    }
  })
  .addBatch ({
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
      , "should respond with an object with id 'test-host'" : 
      function ( err, res, body ) {
        assert.equal ( JSON.parse( body )._id, 'test-host' )
      }
      , "should respond with an object containing todos array with two items" : 
      function ( err, res, body ) {
        assert.include ( JSON.parse( body ), 'todos' );
        assert.deepEqual (
          JSON.parse( body ).todos
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
  });

// --------------------------------------------
// Testing GETs
// ============================================
test
  .addBatch ({
    "A GET to resulting document" : {
      topic : function () {
        request ({
            uri: BASE_URL + "test-host"
          , method : "GET"
          , headers : HEADERS
        }, this.callback );
      }
    , "should respond with 200" : function ( err, res, body ) {
        assert.equal ( res.statusCode, 200 )
      }
    , "should respond with an object with id attribute" : 
      function ( err, res, body ) {
        assert.include ( JSON.parse ( body ), "_id" );
      }   
    , "should respond with an object with `todos` property" : 
      function ( err, res, body ) {
        assert.include ( JSON.parse ( body ), "todos" );
      }
    }
  })
  .addBatch ({
    "A GET to resulting document with parameters" : {
      topic : function () {
        request ({
            uri: BASE_URL + "test-host?whatever=dubydub&rev=1-123123&dobob"
          , method : "GET"
          , headers : HEADERS
        }, this.callback );
      }
    , "should respond with 200" : function ( err, res, body ) {
        assert.equal ( res.statusCode, 200 )
      }
    , "should not care for GET params" : 
      // FIXME: find more ways to test GET and to verify that params
      //        dont' affect anything
      function ( err, res, body ) {
        assert.include ( JSON.parse ( body ), "_id" );
        assert.include ( JSON.parse ( body ), "todos" );
      }
    }
  });

// --------------------------------------------
// Testing POSTs
// ============================================
test
  .addBatch ({
    "A first POST to the document" : {
      topic : function () {
        request ({
            uri: BASE_URL + "test-host"
          , body : JSON.stringify(
              [{
                "title" : "Testing POST Todo 1"
              , "isDone" : false
              }
            , {
                "title" : "Testing POST Todo 2"
              , "isDone" : true
            }]
            )
          , method : "POST"
          , headers : HEADERS
        }, this.callback );
      }
    , "should respond with 201" : function ( err, res, body ) {
        assert.equal ( res.statusCode, 201 );
      }
    , "should have todos in body" : function ( err, res, body ) {
        assert.include ( JSON.parse( body ), "todos" );
      }
    , "should add posted items and return the updated object as result" : 
      function ( err, res, body ) {
        var newItems = JSON.parse( body ).todos.slice(-2);
        
        assert.include ( newItems[ 0 ], "title" );
        assert.equal ( newItems[ 0 ].title, "Testing POST Todo 1" );
        assert.include ( newItems[ 0 ], "isDone" );
        assert.equal ( newItems[ 0 ].isDone, false );

        assert.include ( newItems[ 1 ], "title" );
        assert.equal ( newItems[ 1 ].title, "Testing POST Todo 2" );
        assert.include ( newItems[ 1 ], "isDone" );
        assert.equal ( newItems[ 1 ].isDone, true );
      }
    }
  })
  .addBatch ({
    "A sequental POST to the document" : {
      topic : function () {
        request ({
            uri: BASE_URL + "test-host"
          , body : JSON.stringify(
              [{
                "title" : "Testing POST Todo 3"
              , "isDone" : false
              }
            , {
                "title" : "Testing POST Todo 4"
              , "isDone" : true
            }]
            )
          , method : "POST"
          , headers : HEADERS
        }, this.callback );
      }
    , "should respond with 201" : function ( err, res, body ) {
        assert.equal ( res.statusCode, 201 );
      }
    , "should have todos in body" : function ( err, res, body ) {
        assert.include ( JSON.parse( body ), "todos" );
      }
    , "should add posted items and return the updated object as result" : 
      function ( err, res, body ) {
        var newItems = JSON.parse( body ).todos.slice(-2);
        
        assert.include ( newItems[ 0 ], "title" );
        assert.equal ( newItems[ 0 ].title, "Testing POST Todo 3" );
        assert.include ( newItems[ 0 ], "isDone" );
        assert.equal ( newItems[ 0 ].isDone, false );

        assert.include ( newItems[ 1 ], "title" );
        assert.equal ( newItems[ 1 ].title, "Testing POST Todo 4" );
        assert.include ( newItems[ 1 ], "isDone" );
        assert.equal ( newItems[ 1 ].isDone, true );
      }
    , "should set ids on todo items by their order" : 
      function ( err, res, body ) {
        var todos = JSON.parse( body ).todos,
            todosLen = todos.length,
            newItems = todos.slice(-2);
            
        assert.equal ( todosLen - 2, newItems[ 0 ]._id );
        assert.equal ( todosLen - 1, newItems[ 1 ]._id );
      }
    }
  });

// --------------------------------------------
// Testing DELETEs
// ============================================
// Deleting a document in CouchDB requires to speicfy
// revision as a get parameter.
test
  .addBatch ({
    "A DELETE to resulting document" : {
      topic : function () {
        var self = this;
        // Make a get request to retrieve the revision
        request ({
            uri: BASE_URL + "test-host"
          , method : "GET"
          , headers : HEADERS
        }, function ( err, res, body ) {
          request ({
              uri: BASE_URL + "test-host?rev=" + JSON.parse ( body )._rev
            , method : "DELETE"
            , headers : HEADERS
          }, self.callback );
        });
      }
    , "should respond with 200" : function ( err, res, body ) {
        assert.equal ( res.statusCode, 200 )
      }
      // this is couchdb's stuff, not to be changed I guess
    , "should respond with ok : true" : function ( err, res, body ) {
        assert.include ( JSON.parse ( body ), "ok" );
        assert.equal ( JSON.parse ( body ).ok, true );
      }
    , "should return a revision" : function ( err, res, body ) {
        assert.include ( JSON.parse ( body ), "rev" );
      }
    // TODO: decide wether to implement this? (testing DELETE is idempotent)
    // , "when followed by another DELETE" : {
    //     topic : function () {
    //       var self = this;
    //       request ({
    //           uri: BASE_URL + "test-host?rev=" + JSON.parse( parentBody ).rev
    //         , method : "DELETE"
    //         , headers : HEADERS
    //       }, function ( err, res, body ) {
    //         self.callback( err, res, body, parrentRes, parrentBody )
    //       });
    //     }
    //   , "should not affect anything" : function () {
    //     }
    //   }
    // }
    
  }
});

test.export(module);
