angular.module('starter.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Observations', function() {

  var currentObservation = new Observation(); // used to keep the observation in memeort between controllers

  this.findByName = function (searchKey) {
      var deferred = $.Deferred();
      this.db.transaction(
          function (tx) {

              var sql =   "SELECT obs.mobileObservationID, " +
                          "obs.onlineObservationID, " +
                          "obs.dateObservation, " +
                          "obs.dateCreated, " +
                          "obs.dateModified, " +
                          "obs.whatnext, " +
                          "obs.comments, " +
                          "obs.title, " +
                          "obs.mobileUserID " +
                          "FROM " +
                          "tbl_observation obs " +
                          "WHERE " +
                          "obs.title=?;";

              tx.executeSql(sql, ['%' + searchKey + '%'], function (tx, results) {
                  var len = results.rows.length,
                      observations = [],
                      i = 0;
                  for (; i < len; i = i + 1) {
                      observations[i] = results.rows.item(i);
                  }
                  deferred.resolve(observations);
              });
          },
          function (error) {
              deferred.reject("Transaction Error: " + error.message);
          }
      );
      return deferred.promise();
  }

  this.findById = function (id) {
      var deferred = $.Deferred();
      this.db.transaction(
          function (tx) {

              var sql = "SELECT obs.mobileObservationID, " +
                          "obs.onlineObservationID, " +
                          "obs.dateObservation, " +
                          "obs.dateCreated, " +
                          "obs.dateModified, " +
                          "obs.whatnext, " +
                          "obs.comments, " +
                          "obs.title, " +
                          "obs.mobileUserID " +
                          "FROM " +
                          "tbl_observation obs " +
                          "WHERE " +
                          "obs.mobileObservationID=?;";

              tx.executeSql(sql, [id], function (tx, results) {
                  deferred.resolve(results.rows.length === 1 ? results.rows.item(0) : null);
              });
          },
          function (error) {
              deferred.reject("Transaction Error: " + error.message);
          }
      );
      return deferred.promise();
  };

  var createTables = function (tx) {
      tx.executeSql('DROP TABLE IF EXISTS employee');

      var tbl_observation =  "CREATE TABLE IF NOT EXISTS tbl_observation ( "+
                              "mobileUserID INTEGER, " +
                              "onlineObservationID INTEGER, " +
                              "mobileObservationID INTEGER PRIMARY KEY AUTOINCREMENT, " +
                              "dateObservation TEXT, " +
                              "dateCreated TEXT, " +
                              "dateModified TEXT, " +
                              "whatnext VARCHAR(250), " +
                              "title TEXT, " +
                              "comments VARCHAR(250)) ";

      var tbl_observation_x_aspect =  "CREATE TABLE IF NOT EXISTS tbl_observation_x_aspect ( " +
                                      "mobileObservationID INTEGER, " +
                                      "aspectID INTEGER) ";

      var tbl_observation_x_evidence = "CREATE TABLE IF NOT EXISTS tbl_observation_x_evidence ( "+
                                          "mobileObservationID INTEGER, " +
                                          "mobileEvidenceID INTEGER) ";

      var tbl_observation_x_user = "CREATE TABLE IF NOT EXISTS tbl_observation_x_user ( "+
                                  "mobileObservationID INTEGER, " +
                                  "userID INTEGER) ";
      
      var statements = [tbl_observation, tbl_observation_x_aspect, tbl_observation_x_evidence, tbl_observation_x_user]

      for (var i = 0; i < statements.length; i++) {
          //tx.executeSql('DROP TABLE IF EXISTS employee');

          var statement = statements[i];

          console.log('Create table['+statement+'] table..');

          tx.executeSql(""+statement, null,
              function () {
                  console.log('Create table table success');
              },
              function (tx, error) {
                  alert('Create table error: ' + error.message);
              });            
      }
  }

  return {
      setCurrentObservation: function(observation) {
        console.log('setting obs: ' + observation.mobileObservationID);
        console.log('setting obs2: ' + this.currentObservation.mobileObservationID);
        this.currentObservation = observation;
      },
      getCurrentObservation: function() {
        //console.log('getting obs: ' + this.currentObservation.mobileObservationID);

        return this.currentObservation;
      },
      findById: function (id) {
        var deferred = $.Deferred();
        this.db.transaction(
            function (tx) {

                var sql = "SELECT obs.mobileObservationID, " +
                            "obs.onlineObservationID, " +
                            "obs.dateObservation, " +
                            "obs.dateCreated, " +
                            "obs.dateModified, " +
                            "obs.whatnext, " +
                            "obs.comments, " +
                            "obs.title, " +
                            "obs.mobileUserID " +
                            "FROM " +
                            "tbl_observation obs " +
                            "WHERE " +
                            "obs.mobileObservationID=?;";

                tx.executeSql(sql, [id], function (tx, results) {
                    console.log('reading observation. Record count: ' + results.rows.length);
                
                    observation = new Observation();
                    
                    for (var i=0; i < results.rows.length; i++) 
                    {
                      dbResult = results.rows.item(i);
                      observation.mobileObservationID = dbResult.mobileObservationID; 
                      observation.onlineObservationID = dbResult.onlineObservationID; 
                      observation.dateObservation = dbResult.dateObservation; 
                      observation.dateCreated = dbResult.dateCreated; 
                      observation.dateModified = dbResult.dateModified; 
                      observation.whatnext = dbResult.whatnext; 
                      observation.comments = dbResult.comments; 
                      observation.title = dbResult.title; 
                      observation.mobileUserID = dbResult.mobileUserID;
                    }

                    deferred.resolve(observation);
                });
            },
            function (error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    },
    createObservation: function(observation) {

        var deferred = $.Deferred();
        this.db.transaction(
          function (tx) {
              var sql = "INSERT INTO " +
                  "tbl_observation " +
                  "(mobileUserID, onlineObservationID, dateObservation, dateCreated, dateModified, whatnext, comments, title) " +
                  "VALUES " +
                  "(?,?,?,?,?,?,?,?);";

              tx.executeSql(sql, [observation.mobileUserID,
                              observation.onlineObservationID, 
                              observation.dateObservation, 
                              observation.dateCreated, 
                              observation.dateModified,
                              observation.whatnext,
                              observation.comments,
                              observation.title],
              function (tx, results) {
                  deferred.resolve(results.insertId);
              });
          },
          function (error) {
              deferred.reject("Transaction Error: " + error.message);
          }
      );
      return deferred.promise();
    },
    updateObservation: function(observation) {
        var deferred = $.Deferred();
        this.db.transaction(
          function (tx) {
              var sql = "UPDATE " +
              "tbl_observation " +
              "SET " +
              "mobileUserID=?, " +
              "onlineObservationID=?, " +
              "dateObservation=?, " +
              "dateCreated=?, " +
              "dateModified=?, " +
              "whatnext=?, " +
              "comments=?, " +
              "title=? " +
              "WHERE " +
              "mobileObservationID=?;";

              tx.executeSql(sql, [observation.mobileUserID,
                  observation.onlineObservationID, 
                  observation.dateObservation, 
                  observation.dateCreated, 
                  observation.dateModified,
                  observation.whatnext,
                  observation.comments,
                  observation.title,
                  observation.mobileObservationID],
              function (tx, results) {
                  deferred.resolve(observation.mobileObservationID);
              });
          },
          function (error) {
              deferred.reject("Transaction Error: " + error.message);
          }
      );
      return deferred.promise();
    },
    all: function(mobileUserID) {
      var deferred = $.Deferred();
      this.db.transaction(
          function (tx) {

              var sql =   "SELECT obs.mobileObservationID, " +
                          "obs.onlineObservationID, " +
                          "obs.dateObservation, " +
                          "obs.dateCreated, " +
                          "obs.dateModified, " +
                          "obs.whatnext, " +
                          "obs.comments, " +
                          "obs.title, " +
                          "obs.mobileUserID " +
                          "FROM " +
                          "tbl_observation obs " +
                          "WHERE " +
                          "obs.mobileUserID=?;";

              tx.executeSql(sql, [mobileUserID], function (tx, results) {
                  var len = results.rows.length,
                      observations = [],
                      i = 0;
                  for (; i < len; i = i + 1) {
                      observations[i] = results.rows.item(i);
                  }
                  deferred.resolve(observations);
              });
          },
          function (error) {
              deferred.reject("Transaction Error: " + error.message);
          }
      );
      return deferred.promise();
    },
    initialize: function() {
      var deferred = $.Deferred();
      this.db = window.openDatabase("PriMateDB2", "1.0", "PriMate Development Database", 5*1024*1024);
      this.db.transaction(
          function (tx) {
              createTables(tx);
              //addSampleData(tx);
          },
          function (error) {
              console.log('Transaction error: ' + error);
              deferred.reject('Transaction error: ' + error);
          },
          function () {
              console.log('Transaction success');
              deferred.resolve();
          }
      );
      return deferred.promise();
    }
  }
  

})


.factory('Children', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var children = [
    { mobileUserID: 4, name: 'Tobias Mahoney' },
    { mobileUserID: 1, name: 'Oliver Mahoney' },
    { mobileUserID: 2, name: 'Grant Mahoney' },
    { mobileUserID: 3, name: 'Jojo Mahoney' }
  ];

  return {
    all: function() {
      return children;
    },
    get: function(mobileUserID) {
      return children[mobileUserID];
    }
  }
})

.factory('Evidences', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var evidences = [
    { mobileEvidenceID: 4, name: 'Video of little jimmy' },
    { mobileEvidenceID: 1, name: 'Photo of lego building' },
    { mobileEvidenceID: 2, name: 'Kung foo kid' },
    { mobileEvidenceID: 3, name: 'Back flipping age 2 years' }
  ];

  return {
    all: function() {
      return evidences;
    },
    get: function(mobileEvidenceID) {
      return evidences[mobileEvidenceID];
    }
  }
});
