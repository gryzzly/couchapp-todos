// http://wiki.apache.org/couchdb/Document_Update_Handlers
//
// Update function – invokes server-side logic (augmenting documents in db) – accepting POST and PUT
// 
// @param {Object} - doc - populated with the document, if the update function
// was requested with a document id. 
// @param {Object} - req - populated with information about the request environment.
// @return {Array} – the first element is the (updated or new) document, which is committed to the database. If the first element is `null` no document will be committed to the database. If you are updating an existing, it should already have an _id set, and if you are creating a new document, make sure to set its _id to something, either generated based on the input or the req.uuid provided. The second element is the response that will be sent back to the caller.
//
function ( doc, req ) {
  return [{
    _id : req.id,
    title : req.body,
    isDone : false
  },
    JSON.stringify( req )
  ];
}

