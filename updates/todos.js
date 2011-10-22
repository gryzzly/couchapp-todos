// http://wiki.apache.org/couchdb/Document_Update_Handlers
//
// Update function – invokes server-side logic (augmenting documents in db) – accepting POST and PUT
// 
// @param {Object} - doc - populated with the document, if the update function
// was requested with a document id. 
// @param {Object} - req - populated with information about the request environment.
// @return {Array} – the first element is the (updated or new) document, which is committed to the database. If the first element is `null` no document will be committed to the database. If you are updating an existing, it should already have an _id set, and if you are creating a new document, make sure to set its _id to something, either generated based on the input or the req.uuid provided. The second element is the response that will be sent back to the caller.
//
// This function is being called when /todos/:host is requested.
// When there is no document with id === :host, new document will be created. If data was passed in request (req.body), it will be saved in `todo` property of the new document, data may be a simple todo item or an array. Each item is also assigned an _id starting from 0.
// When there is already a document with id === :host, the data will be added to todos collection.
//
function ( doc, req ) {
  var responseDoc = {}, 
      data = {},
      isEmpty, typeOf;
  
  isEmpty = function ( obj ) {
    for ( var key in obj ) {
      if ( ({}).hasOwnProperty.call({}, key) ) return false;
    }
    return true;
  };
  
  typeOf = function ( obj ) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
  }
  
  // new document
  if ( !doc ) {
    // a todo
    responseDoc = {
      _id : req.id,
      todos : []
    };
    
    data = req.body;
    
    if ( typeOf( data ) === 'object' ) {
      data._id = 0;
      // turn data into an array
      data = [ data ];
    }
    if ( typeOf( data ) === 'array' ) {
      data.forEach(function ( todo, _i ) {
        todo._id = _i;
      });
    }
    
    responseDoc.todos.concat( data );
  }
  // updating existing document (adding new todo item/s)
  else {
    responseDoc = doc;
    todo = req.body;
    // increment the last todo's id
    todo._id = typeOf( doc.todos.slice(-1)[0] ) === 'number' ? 
               doc.todos.slice(-1)[0] + 1 : 
               0;
    req.body && responseDoc.todos.push( req.body );
  }
  return [
    responseDoc,
    JSON.stringify( req )
  ];
}