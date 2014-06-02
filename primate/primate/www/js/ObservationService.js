var ObservationService = function () {

    this.initialize = function () {
        var deferred = $.Deferred();
        this.db = window.openDatabase("PriMateDB2", "1.0", "PriMate Development Database", 5*1024*1024);
        this.db.transaction(
            function (tx) {
                createTable(tx);
                addSampleData(tx);
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

        for (var i = 0; i < arrayLength; i++) {
            tx.executeSql(arrayLength[i], null,
                function () {
                    console.log('Create table['+i+'] table success');
                },
                function (tx, error) {
                    alert('Create table error: ' + error.message);
                });            
        }
    }

    var createObservation = function (tx, observation) {
        
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
            function () {
                console.log('INSERT observation success');
            },
            function (tx, error) {
                alert('INSERT observation error: ' + error.message);
            });
    }
}