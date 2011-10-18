function ( doc, req ) {
  return [{
    _id : req.id,
    title : req.id,
    isDone : false
  },
    JSON.stringify( req )
  ];
}

