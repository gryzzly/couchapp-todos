// http://wiki.apache.org/couchdb/Formatting_with_Show_and_List
// 
// Show function – when queryied with GET returns a representation of a document.
//
// @param {Object} - doc - populated with the document, if the update function
// was requested with a document id. 
// @param {Object} - req - populated with information about the request environment.
// @return {Object} – response object, may contain string (as body), or hashes for header and body.
function ( doc, req ) { 
  return {
    headers : { 
      "Content-Type" : "application/json" 
    },
    body : JSON.stringify( doc ) + "\n"
  }
}