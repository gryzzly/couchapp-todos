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
      data, todo,
      isEmpty, typeOf, isValidJSON, handleData;
  
  // Determine if object is empty? (has no keys and values)
  // @param {Object} obj
  // @returns {Boolean}
  isEmpty = function ( obj ) {
    for ( var key in obj ) {
      if ( ({}).hasOwnProperty.call({}, key) ) return false;
    }
    return true;
  };
  
  // Determine the type of the argument
  // @param {*} obj
  // @returns {String} Capitalized type of the argument (Array, Number etc.)
  typeOf = function ( obj ) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  };
  
  // Is `json` valid?
  isValidJSON = function ( json ) {
    try {
      JSON.parse ( json );
    } catch (e) {
      return false;
    }
    return true;
  };
  
  // When data is an object, put it in array
  // Assign ids to all objects based on the last todo item if it exists.
  // @param {Object|Array} data 
  // @param {Object} doc
  // @returns {Array}
  handleData = function ( data, doc ) {
    // calculate the starting id
    var baseId = 0;
    // updating existing doc
    if ( doc ) {
      // at this point doc may not yet have any todos
      if ( doc.todos.length !== 0 ) baseId = doc.todos.slice(-1)[0]._id + 1
    }
    if ( typeOf ( data ) === 'object' ) {
      data._id = baseId;
      data = [ data ];
    }
    if ( typeOf ( data ) === 'array' ) {
      data.forEach ( function ( todo, index ) {
        todo._id = baseId + index;
      } );
    }
    return data;
  };
  
  // new document
  // PUTting twice should have the same result as PUTting once
  if ( !doc || ( doc && req.method === "PUT" ) ) {
    responseDoc = {
      _id : req.id,
      todos : [],
      // a hack to have rev set to something
      // so CouchDB won't complain
      _rev : ( doc && doc._rev ) || "0-0"
    };
  }
  // updating existing document (adding new todo item) 
  else {
    responseDoc = doc;
  }
  
  if ( data = isValidJSON ( req.body ) ? JSON.parse ( req.body ) : void 0 ) {
    responseDoc.todos = responseDoc.todos.concat ( handleData ( data, responseDoc ) );
  }
  // return saved document
  return [ responseDoc, JSON.stringify ( responseDoc ) ];
}