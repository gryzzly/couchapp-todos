# Backend for Chrome Extension I am writing

## Dependencies

* CouchDB ~> 1.1.0
* couchapp ~> 0.8.1

## App

In order to build an app and push it to the CouchDB (database name is
todos):

    couchapp push todos


In order to test the existing functionality you also need to create a
virtual host in CouchDBs config and add a host record for that virtual
host in your `/etc/hosts` file. I've added `local.todos.com` to point
to 127.0.0.1 and in CouchDB's local configuration file (the default
location is `/usr/local/etc/couchdb/local.ini`, though it may vary from
installation to installation) I've written this:

    [vhosts]
    ;example.com = /database/
    local.todos.com:5984 = /todos/_design/todos/_rewrite

The idea is to point the vhost to the rewrite handle – this will allow
to have the URLs in the `rewrite.json` to be relative to the database
address.

To test that the code is working, start CouchDB, push the app and try to
post and get with `curl`, like this:

    curl -X POST http://local.todos.com:5984/todos/whoa

This should return JSON with request data (and save a todo item with
name 'whoa' to the db).

    curl -X GET http://local.todos.com:5984/todos/whoa

This will return the saved document with proper name (whoa).
