window.dbBuild = "1.9"; 
window.dbVersion = localStorage.getItem("dbVersion");

function DBConnection () 
{	
	var initDB = false;
	
	if(window.dbVersion == null)
	{
		window.dbVersion = "1.0";
		initDB = true;
	}
	
	console.log("Opening database with version: " + window.dbVersion);
	
	this.db = window.openDatabase("PriMateDB2", "1.0" , "PriMate Development Database", 5*1024*1024); // +window.dbVersion
	
	if(initDB == true)
	{
		this.db.transaction(setupDatabase, transaction_error2, setupDatabase_success);
	}
	else
	{
		console.log("Database already initialised");
	}
};

function migrateDatabase()
{
	if(window.dbVersion != window.dbBuild)
	{		
		window.dbConnection.db.changeVersion(window.dbVersion, window.dbBuild, function(t)
		{
		 	console.log("Migrating from version " + window.dbVersion + " to version " + window.dbBuild);
			
			//for development, update the database structure:
			
			window.dbConnection.db.transaction(setupDatabase, transaction_error2, setupDatabase_success);
			
			console.log("Updating version number:" + window.dbBuild);
			localStorage.setItem("dbVersion", window.dbBuild);
			window.dbVersion = window.dbBuild;
			
		});
	}
	else
	{
		console.log("PriMate database version:" + window.dbVersion);
	}
}

DBConnection.prototype = 
{
    createUser : function(user, insertFinsihedCallback)
    {
    	this.db.transaction(insertuser, transaction_error);

		console.log("Inserting user: " + user.firstname + " " + user.lastname);
    	function insertuser(tx) 
		{		
			tx.executeSql(
							"INSERT INTO " +
							"tbl_user " +
							"(onlineUserID, username, password, ticket, settingID, firstname, lastname, email) " +
							"VALUES " +
							"(?, ?, ?, ?, ?, ?, ?, ?);", 
							
							[user.onlineUserID, 
							user.username, 
							user.password, 
							user.ticket,
							user.settingID,
							user.firstname,
							user.lastname,
							user.email],
							
							function(tx, results)
							{
								console.log('user inserted with mobileID: ' + results.insertId);
								user.mobileUserID = results.insertId;
								
								if(insertFinsihedCallback != undefined) insertFinsihedCallback(user)
							});
		}
    },
    updateUser : function(user,updateFinsihedCallback)
    {
    	this.db.transaction(updateuser, transaction_error);

		console.log("Updating user: " + user.firstname + " " + user.lastname);
    	function updateuser(tx) 
		{		
			tx.executeSql(
							"UPDATE " +
							"tbl_user " +
							"SET " +
							"onlineUserID=?, " +
							"username=?, " +
							"password=?, " +
							"ticket=?, " +
							"settingID=?, " +
							"firstname=?, " +
							"lastname=?, " +
							"email=? " +
							"WHERE " +
							"mobileUserID=?", 
							
							[user.onlineUserID, 
							user.username, 
							user.password, 
							user.ticket,
							user.settingID,
							user.firstname,
							user.lastname,
							user.email,
							user.mobileUserID],
							
							function(tx, results)
							{
								console.log('user updated with mobileID: ' + user.mobileUserID);								
								if(updateFinsihedCallback != undefined) updateFinsihedCallback(user)
							});
		}
    },
    deleteObservationChildren : function(observation, updateFinsihedCallback)
    {
		console.log("Deleting children in mobile observation: " + observation.mobileObservationID);

    	this.db.transaction(deleteObservationChildren, transaction_error);

    	function deleteObservationChildren(tx) 
		{		
			tx.executeSql(  "DELETE FROM tbl_observation_x_user WHERE mobileObservationID=?", 
							
							[observation.mobileObservationID],
							
							function(tx, results)
							{
								console.log('Children deleted for mobile observationID: ' + observation.mobileObservationID);
								updateFinsihedCallback();
							});
		}
    },
    deleteObservation : function(observation, updateFinsihedCallback)
    {
		console.log("Deleting mobile observation: " + observation.mobileObservationID);

    	this.db.transaction(deleteObservationChildren, transaction_error);

    	function deleteObservationChildren(tx) 
		{		
			tx.executeSql(  "DELETE FROM tbl_observation WHERE mobileObservationID=?", 
							
							[observation.mobileObservationID],
							
							function(tx, results)
							{
								console.log('Observation deleted with mobile observationID: ' + observation.mobileObservationID);
								updateFinsihedCallback();
							});
		}
    },
    deleteObservationEvidence : function(observation, updateFinsihedCallback)
    {
		console.log("Deleting evidence in mobile observation: " + observation.mobileObservationID);

    	this.db.transaction(deleteObservationChildren, transaction_error);

    	function deleteObservationChildren(tx) 
		{		
			tx.executeSql(  "DELETE FROM tbl_observation_x_evidence WHERE mobileObservationID=?", 
							
							[observation.mobileObservationID],
							
							function(tx, results)
							{
								console.log('Evidence deleted for mobile observationID: ' + observation.mobileObservationID);
								updateFinsihedCallback();
							});
		}
    },
    deleteEvidence : function(evidence, updateFinsihedCallback)
    {
		console.log("Deleting evidence with mobileID: " + evidence.mobileEvidenceID);

    	this.db.transaction(deleteEvidence, transaction_error);

    	function deleteEvidence(tx) 
		{		
			tx.executeSql(  "DELETE FROM tbl_evidence WHERE mobileEvidenceID=?", 
							
							[evidence.mobileEvidenceID],
							
							function(tx, results)
							{
								console.log('Evidence deleted with mobileEvidenceID: ' + evidence.mobileEvidenceID);
								updateFinsihedCallback();
							});
		}
    },
	createObservation : function(observation, insertFinsihedCallback)
    {
    	this.db.transaction(insertObservation, transaction_error);

    	function insertObservation(tx) 
		{
			tx.executeSql(
							"INSERT INTO " +
							"tbl_observation " +
							"(mobileUserID, onlineObservationID, dateObservation, dateCreated, dateModified, whatnext, comments, title) " +
							"VALUES " +
							"(?, ?,?,?,?,?,?,?);", 
							
							[
							observation.mobileUserID,
							observation.onlineObservationID, 
							observation.dateObservation, 
							observation.dateCreated, 
							observation.dateModified,
							observation.whatnext,
							observation.comments,
							observation.title],
							
							function(tx, results)
							{
								console.log('observation inserted with localID: ' + results.insertId);
								observation.mobileObservationID = results.insertId;

								window.dbConnection.deleteObservationChildren(observation, function deleteFinished()
								{
									console.log("children deleted for observation");

									window.dbConnection.updateObservationChildren(observation, function done(obs)
									{
										console.log("children inserted for obs: " + obs.mobileObservationID);

										window.dbConnection.deleteObservationEvidence(observation, function deleteFinished()
										{
											console.log("evidence deleted for observation");

											window.dbConnection.updateObservationEvidence(observation, function done(obs)
											{
												console.log("evidence inserted for obs: " + obs.mobileObservationID);

												window.dbConnection.deleteObservationAspects(observation, function deleteFinished()
												{
													console.log("aspects deleted for observation");

													window.dbConnection.updateObservationAspects(observation, function done(obs)
													{
														insertFinsihedCallback(observation);
													});
												});												
											});
										});
									});
								});
							});
		}
    },
	updateObservation : function(observation, insertFinsihedCallback)
    {
    	this.db.transaction(insertObservation, transaction_error);

    	function insertObservation(tx) 
		{
			tx.executeSql(
							"UPDATE " +
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
							"mobileObservationID=?;", 
							
							[
							observation.mobileUserID,
							observation.onlineObservationID, 
							observation.dateObservation, 
							observation.dateCreated, 
							observation.dateModified,
							observation.whatnext,
							observation.comments,
							observation.title,
							observation.mobileObservationID],
							
							function(tx, results)
							{
								console.log('observation updated, deleting current children..');

								window.dbConnection.deleteObservationChildren(observation, function deleteFinished()
								{
									console.log("children deleted for observation");

									window.dbConnection.updateObservationChildren(observation, function done(obs)
									{
										console.log("children inserted for obs: " + obs.mobileObservationID);

										window.dbConnection.deleteObservationEvidence(observation, function deleteFinished()
										{
											console.log("evidence deleted for observation");

											window.dbConnection.updateObservationEvidence(observation, function done(obs)
											{
												console.log("evidence inserted for obs: " + obs.mobileObservationID);

												window.dbConnection.deleteObservationAspects(observation, function deleteFinished()
												{
													console.log("aspects deleted for observation");

													window.dbConnection.updateObservationAspects(observation, function done(obs)
													{
														insertFinsihedCallback(observation);
													});
												});												
											});
										});
									});
								});
							});
							
			console.log("TODO: add array data");
		}
    },
    updateObservationChildren : function(observation, insertFinsihedCallback)
    {
    	this.db.transaction(insertObservationChildren, transaction_error);

    	function insertObservationChildren(tx) 
		{
			for (var i = 0; i < observation.children.length; i++) 
			{
				var child = observation.children[i];

				console.log('observation('+observation.mobileObservationID+') x user ('+child.mobileUserID+') inserting...');

				tx.executeSql(  "INSERT INTO tbl_observation_x_user ('mobileObservationID', 'userID') VALUES (?, ?)", 
								
								[
								observation.mobileObservationID,
								child.mobileUserID
								],
								
								function(tx, results)
								{
									console.log('observation('+observation.mobileObservationID+') x user created('+child.mobileUserID+')');
								});		
			}//for each child

			insertFinsihedCallback(observation)
		}
    },
    updateObservationEvidence : function(observation, insertFinsihedCallback)
    {
    	console.log('Updating observaiton evidence length: ' + observation.evidence.length);

    	this.db.transaction(insertObservationEvidence, transaction_error);

    	function insertObservationEvidence(tx) 
		{
			for (var i = 0; i < observation.evidence.length; i++) 
			{
				var evidence = observation.evidence[i];

				console.log('observation('+observation.mobileObservationID+') x evidence ('+evidence.mobileEvidenceID+') inserting...');

				tx.executeSql(  "INSERT INTO tbl_observation_x_evidence ('mobileObservationID', 'mobileEvidenceID') VALUES (?, ?)", 
								
								[observation.mobileObservationID, evidence.mobileEvidenceID],
								
								function(tx, results)
								{
									console.log('observation('+observation.mobileObservationID+') x evidence created('+evidence.mobileEvidenceID+')');
								});		
			}//for each evidence

			insertFinsihedCallback(observation)
		}
    },
    updateObservationAspects : function(observation, insertFinsihedCallback)
    {
    	console.log('Updating observaiton aspects length: ' + observation.evidence.length);

    	this.db.transaction(updateObservationAspects, transaction_error);

    	function updateObservationAspects(tx) 
		{
			for (var i = 0; i < observation.aspects.length; i++) 
			{
				var aspectID = observation.aspects[i];

				console.log('observation('+observation.mobileObservationID+') x aspectID ('+aspectID+') inserting...');

				tx.executeSql(  "INSERT INTO tbl_observation_x_aspect ('mobileObservationID', 'aspectID') VALUES (?, ?)", 
								
								[observation.mobileObservationID, aspectID],
								
								function(tx, results)
								{
									console.log('observation('+observation.mobileObservationID+') x aspect created('+aspectID+')');
								});		
			}//for each aspect

			insertFinsihedCallback(observation)

		}
    },
    deleteObservationChildren : function(observation, deleteFinsihedCallback)
    {
    	this.db.transaction(insertObservationChildren, transaction_error);

    	function insertObservationChildren(tx) 
		{
			tx.executeSql(  "DELETE FROM tbl_observation_x_user WHERE mobileObservationID=?;", 
							
							[observation.mobileObservationID],
							
							function(tx, results)
							{
								console.log("Delete calling callback...");
								deleteFinsihedCallback()
							});		
		}
    },
    deleteObservationAspects : function(observation, deleteFinsihedCallback)
    {
    	this.db.transaction(deleteObservationAspects, transaction_error);

    	function deleteObservationAspects(tx) 
		{
			tx.executeSql(  "DELETE FROM tbl_observation_x_aspect WHERE mobileObservationID=?;", 
							
							[observation.mobileObservationID],
							
							function(tx, results)
							{
								deleteFinsihedCallback()
							});		
		}
    },
	readObservation : function(mobileObservationID, readFinsihedCallback)
    {
    	this.db.transaction(readObservation, transaction_error);

    	function readObservation(tx) 
		{
			tx.executeSql(	"SELECT obs.mobileObservationID, " +
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
							"obs.mobileObservationID=?;", 
							
							[mobileObservationID],
							
							function(tx, results)
							{
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

								window.dbConnection.getChildrenInObservation(observation, function(children)
								{
									observation.children = children;

									window.dbConnection.readEvidenceInObservation(observation, function(evidence)
									{
										observation.evidence = evidence;

										window.dbConnection.readObservationAspects(observation, function(aspects)
										{
											observation.aspects = aspects;
											readFinsihedCallback(observation)
										});
									});
								});
							});
							
			console.log("TODO: read array data");
		}
    },
	readObservations : function(mobileUserID) // readFinsihedCallback
    {
    	this.db.transaction(readObservation, transaction_error);

    	function readObservation(tx) 
		{
			console.log("Reading observations for userID: " + mobileUserID);
			
			tx.executeSql(	"SELECT obs.mobileObservationID, " +
							"obs.onlineObservationID, " +
							"obs.dateObservation, " +
							"obs.dateCreated, " +
							"obs.dateModified, " +
							"obs.whatnext, " +
							"obs.comments, " +
							"obs.title " +
							"FROM " +
							"tbl_observation obs " +
							"WHERE " +
							"obs.mobileUserID=?;", 
							
							[mobileUserID],
							
							function(tx, results)
							{
								console.log('reading observations. Record count: ' + results.rows.length);
								
								observations = new Array();
								
								for (var i=0; i < results.rows.length; i++) 
								{
									dbResult = results.rows.item(i);

									observation = new Observation();									
									observation.mobileObservationID = dbResult.mobileObservationID;	
									observation.onlineObservationID = dbResult.onlineObservationID;	
									observation.dateObservation = dbResult.dateObservation;	
									observation.dateCreated = dbResult.dateCreated;	
									observation.dateModified = dbResult.dateModified;	
									observation.whatnext = dbResult.whatnext;	
									observation.comments = dbResult.comments;	
									observation.title = dbResult.title;	
									
									observations.push(observation);
								}
								
								return observations;
								//readFinsihedCallback(observations);
							});							
		}
    },
	readEvidenceInObservation : function(observation, readFinsihedCallback)
    {
    	this.db.transaction(readEvidenceInObservation, transaction_error);

    	function readEvidenceInObservation(tx) 
		{
			console.log("Reading evidence for mobileObservationID: " + observation.mobileObservationID);
			
			tx.executeSql(	"SELECT ev.onlineEvidenceID, " +
							"ev.mobileEvidenceID, " +
							"ev.description, " +
							"ev.extension, " +
							"ev.size, " +
							"ev.dateCreated, " +
							"ev.dateModified, " +
							"ev.settingID, " +
							"ev.mobileUserID, " +
							"ev.url " +
							"FROM " +
							"tbl_evidence ev " +
							"INNER JOIN tbl_observation_x_evidence OBE ON OBE.mobileEvidenceID=ev.mobileEvidenceID " +
							"WHERE " +
							"OBE.mobileObservationID=?;", 
							
							[observation.mobileObservationID],
							
							function(tx, results)
							{
								console.log('Reading evidence files for observation('+observation.mobileObservationID+'). Record count: ' + results.rows.length);
								
								var evidences = new Array();
								
								for (var i=0; i < results.rows.length; i++) 
								{
									dbResult = results.rows.item(i);

									evidence = new Evidence();									
									evidence.onlineEvidenceID = dbResult.onlineEvidenceID;	
									evidence.mobileEvidenceID = dbResult.mobileEvidenceID;	
									evidence.description = dbResult.description;	
									evidence.extension = dbResult.extension;	
									evidence.size = dbResult.size;	
									evidence.dateCreated = dbResult.dateCreated;	
									evidence.dateModified = dbResult.dateModified;	
									evidence.settingID = dbResult.settingID;	
									evidence.mobileUserID = dbResult.mobileUserID;
									evidence.url = dbResult.url;
									
									evidences.push(evidence);
								}
								
								readFinsihedCallback(evidences);
							});							
		}
    },
    readObservationAspects : function(observation, readFinsihedCallback)
    {
    	this.db.transaction(readObservationAspects, transaction_error);

    	function readObservationAspects(tx) 
		{
			console.log("Reading aspects for mobileObservationID: " + observation.mobileObservationID);
			
			tx.executeSql(	"SELECT aspect.aspectID " +
							"FROM " +
							"tbl_observation_x_aspect aspect " +
							"WHERE " +
							"aspect.mobileObservationID=?;", 
							
							[observation.mobileObservationID],
							
							function(tx, results)
							{
								console.log('Reading aspects for observation('+observation.mobileObservationID+'). Record count: ' + results.rows.length);
								
								var aspects = new Array();
								
								for (var i=0; i < results.rows.length; i++) 
								{
									dbResult = results.rows.item(i);

									var aspectID = dbResult.aspectID;	
									aspects.push(aspectID);
								}
								
								readFinsihedCallback(aspects);
							});							
		}
    },
	readEvidences : function(mobileUserID, readFinsihedCallback)
    {
    	this.db.transaction(readEvidence, transaction_error);

    	function readEvidence(tx) 
		{
			console.log("Reading evidence for userID: " + mobileUserID);
			
			tx.executeSql(	"SELECT ev.onlineEvidenceID, " +
							"ev.mobileEvidenceID, " +
							"ev.description, " +
							"ev.extension, " +
							"ev.size, " +
							"ev.dateCreated, " +
							"ev.dateModified, " +
							"ev.settingID, " +
							"ev.mobileUserID, " +
							"ev.url " +
							"FROM " +
							"tbl_evidence ev " +
							"WHERE " +
							"ev.mobileUserID=?;", 
							
							[mobileUserID],
							
							function(tx, results)
							{
								console.log('Reading evidence files. Record count: ' + results.rows.length);
								
								evidences = new Array();
								
								for (var i=0; i < results.rows.length; i++) 
								{
									dbResult = results.rows.item(i);

									evidence = new Evidence();									
									evidence.onlineEvidenceID = dbResult.onlineEvidenceID;	
									evidence.mobileEvidenceID = dbResult.mobileEvidenceID;	
									evidence.description = dbResult.description;	
									evidence.extension = dbResult.extension;	
									evidence.size = dbResult.size;	
									evidence.dateCreated = dbResult.dateCreated;	
									evidence.dateModified = dbResult.dateModified;	
									evidence.settingID = dbResult.settingID;	
									evidence.mobileUserID = dbResult.mobileUserID;
									evidence.url = dbResult.url;
									
									evidences.push(evidence);
								}
								
								readFinsihedCallback(evidences)
							});							
		}
    },
	readEvidence : function(mobileEvidenceID, readFinsihedCallback)
    {
    	this.db.transaction(readEvidence, transaction_error);

    	function readEvidence(tx) 
		{
			console.log("Reading evidence for mobile evidence ID: " + mobileEvidenceID);
			
			tx.executeSql(	"SELECT ev.onlineEvidenceID, " +
							"ev.mobileEvidenceID, " +
							"ev.description, " +
							"ev.extension, " +
							"ev.size, " +
							"ev.dateCreated, " +
							"ev.dateModified, " +
							"ev.settingID, " +
							"ev.mobileUserID, " +
							"ev.url " +
							"FROM " +
							"tbl_evidence ev " +
							"WHERE " +
							"ev.mobileEvidenceID=?;", 
							
							[mobileEvidenceID],
							
							function(tx, results)
							{
								console.log('Reading evidence files. Record count: ' + results.rows.length);
								
								evidence = new Evidence();
								
								for (var i=0; i < results.rows.length; i++) 
								{
									dbResult = results.rows.item(i);
							
									evidence.onlineEvidenceID = dbResult.onlineEvidenceID;	
									evidence.mobileEvidenceID = dbResult.mobileEvidenceID;	
									evidence.description = dbResult.description;	
									evidence.extension = dbResult.extension;	
									evidence.size = dbResult.size;	
									evidence.dateCreated = dbResult.dateCreated;	
									evidence.dateModified = dbResult.dateModified;	
									evidence.settingID = dbResult.settingID;	
									evidence.mobileUserID = dbResult.mobileUserID;
									evidence.url = dbResult.url;	
								}
								
								readFinsihedCallback(evidence)
							});							
		}
    },
	getChildren : function(teacher, readFinsihedCallback)
    {
    	this.db.transaction(getChildren, transaction_error);

    	function getChildren(tx) 
		{
			console.log("Getting children for mobile teacher ID: " + teacher.mobileUserID);
			
			tx.executeSql(	"SELECT DISTINCT usr.onlineUserID, " +
							"usr.mobileUserID, " +
							"usr.firstname, " +
							"usr.lastname, " +
							"usr.settingID " +
							"FROM " +
							"tbl_user usr " +
							"INNER JOIN tbl_child_x_teacher cxt ON cxt.mobileChildID=usr.mobileUserID " +
							"WHERE " +
							"cxt.mobileTeacherID=?;", 
							
							[teacher.mobileUserID],
							
							function(tx, results)
							{
								console.log('Getting children. Record count: ' + results.rows.length);
								
								var children = new Array();
								
								for (var i=0; i < results.rows.length; i++) 
								{
									dbResult = results.rows.item(i);
									
									var child = new User();
									
									child.onlineUserID = dbResult.onlineUserID;	
									child.mobileUserID = dbResult.mobileUserID;	
									child.firstname = dbResult.firstname;	
									child.lastname = dbResult.lastname;	
									child.settingID = dbResult.settingID;
									
									children.push(child);
								}
								
								readFinsihedCallback(children)
							});							
		}
    },
    getChildrenInObservation : function(observation, readFinsihedCallback)
    {
    	this.db.transaction(getChildrenInObservation, transaction_error);

    	function getChildrenInObservation(tx) 
		{
			console.log("Getting children for mobile observation ID: " + observation.mobileObservationID);
			
			tx.executeSql(	"SELECT DISTINCT " +
							"usr.onlineUserID, " +
							"usr.mobileUserID, " +
							"usr.firstname, " +
							"usr.lastname, " +
							"usr.settingID " +
							"FROM " +
							"tbl_user usr " +
							"INNER JOIN tbl_observation_x_user obu ON obu.userID=usr.mobileUserID " +
							"WHERE " +
							"obu.mobileObservationID=?;", 
							
							[observation.mobileObservationID],
							
							function(tx, results)
							{
								console.log('Getting children for obs. Record count: ' + results.rows.length);
								
								var children = new Array();
								
								for (var i=0; i < results.rows.length; i++) 
								{
									dbResult = results.rows.item(i);
									
									var child = new User();
									
									child.onlineUserID = dbResult.onlineUserID;	
									child.mobileUserID = dbResult.mobileUserID;	
									child.firstname = dbResult.firstname;	
									child.lastname = dbResult.lastname;	
									child.settingID = dbResult.settingID;
									
									children.push(child);
								}
								
								readFinsihedCallback(children)
							});							
		}
    },
	getUserUsingOnlineID : function(user, readFinsihedCallback)
    {
    	this.db.transaction(getUserUsingOnlineID, transaction_error);

    	function getUserUsingOnlineID(tx) 
		{
			console.log("Getting user with online user ID: " + user.onlineUserID);
			
			tx.executeSql(	"SELECT DISTINCT usr.onlineUserID, " +
							"usr.mobileUserID, " +
							"usr.firstname, " +
							"usr.lastname, " +
							"usr.settingID " +
							"FROM " +
							"tbl_user usr " +
							"WHERE " +
							"usr.onlineUserID=?;", 
							
							[user.onlineUserID],
							
							function(tx, results)
							{
								console.log('Getting online user. Record count: ' + results.rows.length);
								
								if(results.rows.length > 0)
								{
									dbResult = results.rows.item(0);

									var foundUser = new User();
																		
									foundUser.onlineUserID = dbResult.onlineUserID;	
									foundUser.mobileUserID = dbResult.mobileUserID;	
									foundUser.firstname = dbResult.firstname;	
									foundUser.lastname = dbResult.lastname;	
									foundUser.settingID = dbResult.settingID;	

									readFinsihedCallback(foundUser, user);
								}
								else
								{
									readFinsihedCallback(undefined, user);
								}
								
							});							
		}
    },
	createEvidence : function(evidence, insertFinsihedCallback)
    {
    	this.db.transaction(insertEvidence, transaction_error);

    	function insertEvidence(tx) 
		{
			tx.executeSql(
							"INSERT INTO " +
							"tbl_evidence " +
							"(mobileUserID, " +
							"onlineEvidenceID, " +
							"dateCreated, " +
							"dateModified, " +
							"description, " +
							"extension, " +
							"settingID, " +
							"size, " +
							"url) " +
							"VALUES " +
							"(?, ?, ?, ?, ?, ?, ?, ?, ?);", 
							
							[
							evidence.mobileUserID,
							evidence.onlineEvidenceID, 
							evidence.dateCreated, 
							evidence.dateModified,
							evidence.description,
							evidence.extension,
							evidence.settingID,
							evidence.size,
							evidence.url
							],
							
							function(tx, results)
							{
								console.log('evidence inserted with localID: ' + results.insertId);
								evidence.mobileEvidenceID = results.insertId;
								insertFinsihedCallback(evidence)
							});							
		}
    },
    updateEvidence : function(evidence, showToast, insertFinsihedCallback)
    {
    	this.db.transaction(insertEvidence, transaction_error);

    	function insertEvidence(tx) 
		{
			tx.executeSql(
							"UPDATE " +
							"tbl_evidence SET " +
							"mobileUserID=?, " +
							"onlineEvidenceID=?, " +
							"dateCreated=?, " +
							"dateModified=?, " +
							"description=?, " +
							"extension=?, " +
							"settingID=?, " +
							"size=?, " +
							"url=? " +
							"WHERE " +
							"mobileEvidenceID=?;", 
							
							[
							evidence.mobileUserID,
							evidence.onlineEvidenceID, 
							evidence.dateCreated, 
							evidence.dateModified,
							evidence.description,
							evidence.extension,
							evidence.settingID,
							evidence.size,
							evidence.url,
							evidence.mobileEvidenceID
							],
							
							function(tx, results)
							{
								console.log('evidence updated with localID: ' + evidence.mobileEvidenceID);
								insertFinsihedCallback(evidence, showToast)
							});							
		}
    },
	createChildxTeacher : function(child, insertFinsihedCallback)
    {
    	this.db.transaction(insertEvidence, transaction_error);

    	function insertEvidence(tx) 
		{
			tx.executeSql(
							"INSERT INTO " +
							"tbl_child_x_teacher " +
							"(mobileTeacherID, " +
							"mobileChildID) " +
							"VALUES " +
							"(?, ?);", 
							
							[
							child.mobileTeacherID, 
							child.mobileUserID
							],
							
							function(tx, results)
							{
								console.log('Child('+child.mobileUserID+') x teacher('+child.mobileTeacherID+') record has been inserted');
								
								if(insertFinsihedCallback != undefined) insertFinsihedCallback(child)
							});
		}
    }
}


window.dbConnection = new DBConnection();

function transaction_error2 (error) 
{
    console.error("OneFile database error2: " + error.message);
}

function transaction_error (error) 
{
	console.error("OneFile database error: " + error.message);

	try
	{
		window.dump(error);
	}
	catch(err)
	{
		console.log("Couldn't dump error");
	}
}

function setupDatabase_success() 
{
	localStorage.setItem("dbVersion", window.dbVersion);
	console.log("database setup successfully");
}

function setupDatabase(tx) 
{	
	console.log("Clearing old tables");

	tx.executeSql('DROP TABLE IF EXISTS tbl_observation');
	tx.executeSql('DROP TABLE IF EXISTS tbl_evidence');

	console.log("Setting up database");

    var tbl_aspect = 

        "CREATE TABLE IF NOT EXISTS tbl_aspect ( "+
        "aspectID INTEGER PRIMARY KEY, " +
        "name VARCHAR(100), " +
        "code VARCHAR(100), " +
        "areaID INTEGER) ";

	var apect1  = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('1', 'Making relationships', 'MR', '1');";
	var apect2  = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('2', 'Self-confidence and self-awareness ', 'SC/SA', '1');";
	var apect3  = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('3', 'Managing feelings and behaviour ', 'MF/B', '1');";
	var apect4  = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('4', 'Moving and handling', 'MH', '2');";
	var apect5  = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('5', 'Health and self-care', 'H/SC', '2');";
	var apect6  = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('6', 'Listening and attention ', 'L/A', '3');";
	var apect7  = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('7', 'Understanding', 'U', '3');";
	var apect8  = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('8', 'Speaking', 'S', '3');";
	var apect9  = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('9', 'Reading', 'R', '4');";
	var apect10 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('10', 'Writing', 'W', '4');";
	var apect11 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('11', 'Numbers', 'N', '5');";
	var apect12 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('12', 'Shape, space and measure ', 'SS/M', '5');";
	var apect13 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('13', 'People and communities', 'P/C', '6');";
	var apect14 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('14', 'The world', 'TW', '6');";
	var apect15 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('15', 'Technology', 'T', '6');";
	var apect16 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('16', 'Exploring and using media and materials', 'E/M/M', '7');";
	var apect17 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('17', 'Being imaginative', 'BI', '7');";
	var apect18 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('18', 'Finding out and exploring  ', 'FO', '8');";
	var apect19 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('19', 'Playing with what they know', 'P', '8');";
	var apect20 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('20', 'Being willing to have a go', 'HAG', '8');";
	var apect21 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('21', 'Being involved and concentrating', 'BI/C', '9');";
	var apect22 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('22', 'Keep trying', 'KT', '9');";
	var apect23 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('23', 'Enjoying achieving what they set out to do ', 'EA', '9');";
	var apect24 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('24', 'Having their own ideas ', 'HOI', '10');";
	var apect25 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('25', 'Making links', 'ML', '10');";
	var apect26 = "INSERT OR REPLACE INTO tbl_aspect ('aspectID', 'name', 'code', 'areaID') VALUES ('26', 'Choosing ways to do things', 'CW', '10');";

    var tbl_class = 

        "CREATE TABLE IF NOT EXISTS tbl_class ( "+
        "classID INTEGER PRIMARY KEY, " +
        "name VARCHAR(100), " +
        "dateCreated TEXT, " +
        "dateModified TEXT, " +
        "settingID INTEGER)";

    var tbl_evidence = 

        "CREATE TABLE IF NOT EXISTS tbl_evidence ( "+
        "onlineEvidenceID INTEGER, " +
        "mobileEvidenceID INTEGER PRIMARY KEY, " +
        "mobileUserID INTEGER, " +
        "description VARCHAR(255), " +
        "extension VARCHAR(5), " +
        "size INTEGER, " +
        "dateCreated TEXT, " +
        "dateModified TEXT, " +
		"url TEXT, " +
        "settingID INTEGER) ";

	var tbl_observation = 

		"CREATE TABLE IF NOT EXISTS tbl_observation ( "+
		"mobileUserID INTEGER, " +
		"onlineObservationID INTEGER, " +
        "mobileObservationID INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "dateObservation TEXT, " +
		"dateCreated TEXT, " +
        "dateModified TEXT, " +
        "whatnext VARCHAR(250), " +
		"title TEXT, " +
		"comments VARCHAR(250)) ";

    var tbl_observation_x_aspect = 

        "CREATE TABLE IF NOT EXISTS tbl_observation_x_aspect ( " +
        "mobileObservationID INTEGER, " +
        "aspectID INTEGER) ";

    var tbl_observation_x_evidence = 

        "CREATE TABLE IF NOT EXISTS tbl_observation_x_evidence ( "+
        "mobileObservationID INTEGER, " +
        "mobileEvidenceID INTEGER) ";

    var tbl_observation_x_user = 

        "CREATE TABLE IF NOT EXISTS tbl_observation_x_user ( "+
        "mobileObservationID INTEGER, " +
        "userID INTEGER) ";

    var tbl_user_x_class = 

        "CREATE TABLE IF NOT EXISTS tbl_user_x_class ( "+
        "mobileUserID INTEGER, " +
        "classID INTEGER) ";

    var tbl_child_x_teacher = 

        "CREATE TABLE IF NOT EXISTS tbl_child_x_teacher ( "+
        "mobileTeacherID INTEGER, " +
        "mobileChildID INTEGER, " +
		"PRIMARY KEY(mobileTeacherID, mobileChildID)) "; // ERROR?
		
    var tbl_role = 

        "CREATE TABLE IF NOT EXISTS tbl_role ( "+
        "roleID INTEGER, " +
        "title TEXT, " +
        "value TEXT) ";

    var tbl_user = 
    
        "CREATE TABLE IF NOT EXISTS tbl_user ( "+
        "onlineUserID INTEGER, " +
        "mobileUserID INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "settingID INTEGER, " +
        "username VARCHAR(20), " +
        "firstname VARCHAR(50), " +
        "lastname VARCHAR(50), " +
        "email VARCHAR(100), " +
        "address VARCHAR(255), " +
        "telephone VARCHAR(50), " +
        "telephoneMobile VARCHAR(50), " +
        "password VARCHAR(100), " +
        "ticket VARCHAR(250), " +
        "dateOfBirth TEXT, " +
        "dateCreated TEXT, " +
        "dateModified TEXT, " +
        "dateStarted TEXT, " +
        "roleID INTEGER)";

    var tbl_setting = 

        "CREATE TABLE IF NOT EXISTS tbl_setting ( "+
        "onlineSettingID INTEGER, " +
        "mobileSettingID INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "name VARCHAR(100), " +
        "settingTypeID INTEGER)";

    var tbl_setting_type = 

        "CREATE TABLE IF NOT EXISTS tbl_setting_type ( "+
        "settingTypeID INTEGER, " +
        "name VARCHAR(100))" ;

     tx.executeSql(tbl_aspect);
     tx.executeSql(tbl_class);
     tx.executeSql(tbl_evidence);
     tx.executeSql(tbl_observation);
     tx.executeSql(tbl_observation_x_aspect);
     tx.executeSql(tbl_observation_x_evidence);
     tx.executeSql(tbl_observation_x_user);
     tx.executeSql(tbl_role);
     tx.executeSql(tbl_user_x_class);
	 tx.executeSql(tbl_child_x_teacher);
     tx.executeSql(tbl_user);
     tx.executeSql(tbl_setting);
     tx.executeSql(tbl_setting_type);

     tx.executeSql(apect1);
     tx.executeSql(apect2);
     tx.executeSql(apect3);
     tx.executeSql(apect4);
     tx.executeSql(apect5);
     tx.executeSql(apect6);
     tx.executeSql(apect7);
     tx.executeSql(apect8);
     tx.executeSql(apect9);
     tx.executeSql(apect10);
     tx.executeSql(apect11);
     tx.executeSql(apect12);
     tx.executeSql(apect13);
     tx.executeSql(apect14);
     tx.executeSql(apect15);
     tx.executeSql(apect16);
     tx.executeSql(apect17);
     tx.executeSql(apect18);
     tx.executeSql(apect19);
     tx.executeSql(apect20);
     tx.executeSql(apect21);
     tx.executeSql(apect22);
     tx.executeSql(apect23);
     tx.executeSql(apect24);
     tx.executeSql(apect25);
     tx.executeSql(apect26);

	console.log("Setup completed");
 }
