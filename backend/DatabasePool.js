// To Create Database Pool
const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();
// Useful Commands to check
// Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol 
// requested by server; consider upgrading MySQL client
// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
// flush privileges;
//

const mysqlconfig = {
    connectionLimit: process.env.MYSQL_CONNECTION_LIMIT,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME,
    timezone: process.env.MYSQL_TIMEZONE
}
const mysqlpool = mysql.createPool(mysqlconfig);

function executeQueryV0(myquery, mycallback, myres, myparams = [], mydatabase = 'gl_servicenow') {
    mysqlpool.getConnection(function (err, connection) {
        // if (err) throw err; // not connected!
        if (err) { // not connected!
            mycallback(err, myres);
            return;
        }

        // Use the connection
        // if (mydatabase !== '') connection.changeUser({database:mydatabase}, err=>{
        //     console.log("Unable to change database to - ", mydatabase, err.message);
        //     console.log("Using default database - ", process.env.MYSQL_DATABASE_NAME);
        // });
        connection.query(myquery, myparams, (error, results, fields) => {
            if (error) { // not connected!
                mycallback(error, myres);
                return;
            }
            // if (error) throw error;
            mycallback(null, myres, results, fields);
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;

            // Don't use the connection here, it has been returned to the pool.
        });
    });
}

function executeTransaction(myroute, mycallback, myres, myparams = []) {
    mysqlpool.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
        connection.beginTransaction(function (err) {
            if (err) { throw err; }
            // Get the Query for the Route
            var routeQuery = 'SELECT query FROM routequerymap WHERE api=?'
            // Use the Query to get Results
            connection.query(routeQuery, [myroute], function (error, results, fields) {
                if (error) {
                    return connection.rollback(function () {
                        throw error;
                    });
                }

                var log = 'Query: ' + results[0].query + '  ; Route: ' + myroute;
                var resultQuery = results[0].query;

                connection.query(results[0].query, myparams, function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function () {
                            throw error;
                        });
                    }
                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            });
                        }
                        console.log('success!');
                        // Use the results for the route
                        mycallback(null, myres, results, fields);
                        // When done with the connection, release it.
                        connection.release();

                        // Handle error after the release.
                        if (error) throw error;
                    });
                });
            });
        });
    });
}

function executeMultipleQueries(mycallback, myres, myqueries = [], myparams = []) {
    var myresults = [];
    mysqlpool.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
        connection.beginTransaction(function (err) {
            if (err) { throw err; }
            // Execute Queries as a transaction
            for (let i = 0; i < myqueries.length; i++) {
                connection.query(myqueries[i], [], function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function () {
                            throw error;
                        });
                    }
                    myresults.push(results);
                });
            }
            connection.commit(function (err) {
                if (err) {
                    return connection.rollback(function () {
                        throw err;
                    });
                }
                console.log('success!');
                // Use the results for the route
                mycallback(null, myres, myresults, 'fields');
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (err) throw err;
            });
        });
    });
}

function getConnection(databaseName = '') {
    return new Promise(function (resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err) on catch.
        mysqlpool.getConnection(function (err, connection) {
            if (err) { // not connected!
                return reject(err);
            }
            resolve(connection);
        });
    });
}

function processQuery(connection, mycallback, myres, query_str, query_var) {
    console.log("processQuery == ", query_str)
    return new Promise(function (resolve, reject) {
        connection.query(query_str, query_var, function (err, results, fields) {
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            // mycallback(null, myres, results, fields);
            resolve(connection);
        });
    });
}

function releaseConnection(connection) {
    return new Promise(function (resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err) on catch.
        connection.release(function (err, connection) {
            if (err) { // not connected!
                return reject(err);
            }
            resolve(connection);
        });
    });
}

function executeAPI(){}

// myquery, mycallback, myres, myparams = [], mydatabase = 'gl_servicenow'
function executeQuery(myquery, mycallback, myres, myparams = [], mydatabase = 'gl_servicenow') {
    console.log("execute query===================================")
    return getConnection(mydatabase)
        .then(connection => {
            return new Promise(function (resolve, reject) {
                connection.query(myquery, myparams, function (err, results, fields) {
                    // Call reject on error states,
                    // call resolve with results
                    if (err) {
                        var caller_line = err.stack.split("\n")[4];
                        var index = caller_line.indexOf("at ");
                        var clean = caller_line.slice(index + 2, caller_line.length);
                        console.log(err.message, myquery, clean);
                        mycallback(err, myres);
                        return reject(err);
                    }
                    console.log("Query - ", myquery, "First Result - ", results[0])
                    mycallback(null, myres, results, fields);
                    resolve(connection);
                });
            });
        })
        // .then(rows => { myres.json(rows) })
        .then(connection => releaseConnection(connection))
        .catch(err => {
            console.log(err.message, myquery);
            // myres.json(err.message);
        });
}
// function getLastRecord(name) {
//     return new Promise(function (resolve, reject) {
//         // The Promise constructor should catch any errors thrown on
//         // this tick. Alternately, try/catch and reject(err) on catch.
//         var connection = getMySQL_connection();

//         var query_str =
//             "SELECT name, " +
//             "FROM records " +
//             "WHERE (name = ?) " +
//             "LIMIT 1 ";

//         var query_var = [name];

//         connection.query(query_str, query_var, function (err, rows, fields) {
//             // Call reject on error states,
//             // call resolve with results
//             if (err) {
//                 return reject(err);
//             }
//             resolve(rows);
//         });
//     });
// }

// getLastRecord('name_record').then(function (rows) {
//     // now you have your rows, you can see if there are <20 of them
// }).catch((err) => setImmediate(() => { throw err; }));
// Throw async to escape the promise chain

module.exports = {
    mysqlpool,
    executeQuery,
    executeMultipleQueries
};
