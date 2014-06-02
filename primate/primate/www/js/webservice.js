function OneFileWebService(host)
{
	$.support.cors = true;
	this.host = host;
}

JSON.stringify = JSON.stringify || function (obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"'+obj+'"';
        return String(obj);
    }
    else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n]; t = typeof(v);
            if (t == "string") v = '"'+v+'"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};

OneFileWebService.prototype = 
{
    getHost : function()
    {
        return this.host;
    },
    updateAuth : function(user, successFunction, errorFunction)
    {
    	var postBody= {'username': user.username, 'password' : user.password};
	
		$.getJSON( 'https://'+this.host+'/api/v1/Account', postBody )
		  	.done(function( json ) 
		  	{
				console.log('Response Data:' + JSON.stringify(json));
				
				/*
				{"Result":"Success",
				 "Login":{"UserID":32,"SettingID":14,"UserN
                                  ame":"omahoney2","FirstName":"Oliver","LastName":"Mahoney","Email":"pweston@onefile.co.uk",
                                  "PasswordHash":null,"Ticket":"69652cc3-7105-4b5
                                  e-ad35-3015480cbb5f","Locked":false,"LockedReason":null,
                                  "Name":"Oliver Mahoney","Claims":null,"RoleID":2,"Role":2,"BreadcrumbTrail":null},
                                  "Errors":null}
				*/
				
				var result = json['Result'];
				var errors = json['Errors'];
				
				if(errors != null || result != "Success")
				{
					errorFunction(user, errors);
					return;
				}

				user.onlineUserID = json['Login']['UserID'];
				user.settingID = json['Login']['SettingID'];
				user.ticket = json['Login']['Ticket'];
				user.firstname = json['Login']['FirstName'];
				user.lastname = json['Login']['LastName'];
				user.email = json['Login']['Email'];
				
				successFunction(user);	
		  	})
		  	.fail(function( jqxhr, textStatus, error ) 
		  	{
				var err = textStatus + ", " + error + "message: " + error.message + "; code: " + error.code;
				console.log("Login Request Failed: " + err );
				
				if(offlineLogin(user))
				{
					return true;
				}
				else{
					errorFunction(user, "Could not connect to PriMate. Please check your interent connection.");
				}
			});
    },
	downloadChildren : function(user, successFunction, errorFunction)
    {
    	console.log("Downloading children...");

    	var postBody= {'username': user.username, 'password' : user.password};
		var rURL = 'https://'+this.host+'/api/v1/Observations/0/?settingId='+user.settingID+'&loginId='+user.onlineUserID+'&token='+user.ticket;

		console.log("Children download URL:" + rURL);

		$.getJSON( rURL, postBody )
		  	.done(function( json ) 
		  	{
				console.log('Children Response Data:' + JSON.stringify(json));
				
				var errors = json['Errors'];
				
				//if(errors != null || result != "Success")
				//{
				//	errorFunction(user, "errors");
				//}
				//else
				//{
					successFunction(user);
				//}
				
				var children = json['Observation']['Children'];
				var setting = json['Setting'];
				
				parseSettingElement(setting);
				parseChildren(children, user);

		  	})
		  	.fail(function( jqxhr, textStatus, error ) 
		  	{
				var err = textStatus + ", " + error + "message: " + error.message + "; code: " + error.code;
				console.log("Children request failed: " + err );
				
				errorFunction(user, "Please check your internet connection");
			});
    },
    uploadObservation : function(observation, user, successFunction, errorFunction)
    {
    	console.log("Uploading observation...");

    	var obs = {};

    	obs.ObservationID = observation.onlineObservationID;
    	obs.Title = observation.title + ' Olis second test';
    	obs.ObserverID = user.onlineUserID;
    	obs.ObserverName = user.firstname + ' ' + user.lastname;
    	obs.DateObservation = '2014-04-07T00:00:00';//observation.dateCreated;
    	obs.Comments = observation.comments;
    	obs.WhatNext = '';
    	obs.Children = new Array();
    	obs.Contexts = new Array();
    	obs.DevelopmentMatters = new Array();
    	obs.Evidence = new Array();
    	obs.ChildrenCount = observation.children.length;
    	obs.RootFolderID = 0;
    	obs.RequestedChildID = 0;
    	obs.RequestedChildName = '';

    	for (var i = 0; i < observation.children.length; i++) 
    	{    
		    var child = observation.children[i];
		    var jChild = {};

		    jChild.UserID = child.onlineUserID;
		    jChild.SettingID = child.settingID;
		    jChild.FirstName = child.firstname;
		    jChild.LastName = child.LastName;
		    jChild.MugShotUrl = '';
		    jChild.Included = true;

		    obs.Children.push(jChild);
		} 


		var uploadingCount = 0;

		for (var i = 0; i < observation.evidence.length; i++) 
    	{    
    		/*
			[{\"id\":33,\"contentType\":\"image/jpeg\",\"name\":\"Paul Weston.jpg\",
			\"nameAbbreviated\":null,\"extension\":null,\"deletable\":false,\"imageUrl\":null,
			\"path\":null,\"location\":null,\"included\":true,\"owned\":true}
    		*/

		    var evidence = observation.evidence[i];
		    var isBlocking = false;

		    var fileExtension = (/[.]/.exec(evidence.url)) ? /[^.]+$/.exec(evidence.url) : undefined;

		    if(evidence.onlineEvidenceID == 0)
		    {
		    	isBlocking = true;
		    	uploadingCount ++;

		    	window.webservice.uploadEvidence(evidence, user, function success(evi)
											    	{
											    		console.log("Observation evidence has been uploaded");
											    		evidence.onlineEvidenceID = evi.onlineEvidenceID;
											    		var jEvidence = {};

												    	jEvidence.id = evidence.onlineEvidenceID;
													    jEvidence.contentType = "";
													    jEvidence.name = evidence.description;
													    jEvidence.nameAbbreviated = "";
													    jEvidence.extension = fileExtension;
													    jEvidence.deletable = false;
													    jEvidence.imageUrl = "";
													    jEvidence.path = "";
													    jEvidence.location = "";
													    jEvidence.included = false;
													    jEvidence.owned = false;

													    obs.Evidence.push(jEvidence);
													    
									  				    isBlocking = false;
									  				    uploadingCount--;

											    	}, 
											    	function failed(evi, message){
											    		console.log("Observation evidence upload error:" + message);
											    		window.toast("Evidence upload failure. " + message);
											    		return;
											    	});
		    }
		    else
		    {
		    	var jEvidence = {};

		    	jEvidence.id = evidence.onlineEvidenceID;
			    jEvidence.contentType = "";
			    jEvidence.name = evidence.description;
			    jEvidence.nameAbbreviated = "";
			    jEvidence.extension = fileExtension;
			    jEvidence.deletable = false;
			    jEvidence.imageUrl = "";
			    jEvidence.path = "";
			    jEvidence.location = "";
			    jEvidence.included = false;
			    jEvidence.owned = false;

			    obs.Evidence.push(jEvidence);
		    }
		    //while(isBlocking);
		}

		var uploadingInverval = setInterval(function()
	    {
	    	if(uploadingCount == 0)
	    	{
	    		$.ajax({
				  url:rURL,
				  type:"POST",
				  data:JSON.stringify(obs),
				  contentType:"application/json; charset=utf-8",
				  dataType:"json",
				  success: function(json)
				  {
				  	// {"Result":"Success","Data":"13","Errors":null} 
				  	console.log("Obs upload done:");
				  	console.log(JSON.stringify(json));

				  	var errors = json['Errors'];
				  	var result = json['Result'];
				  	var data = json['Data'];

				  	if((errors != null && errors.length > 0) || result != "Success")
					{
						errorFunction(observation, errors);
					}
					else if(data > 0)
					{
						console.log("Delete observation");
						successFunction(observation);
					}
					else
					{
						errorFunction(observation, "An unexpected response response was recieved from the server.");
					}
				  }
				})
	    		clearInterval(uploadingInverval);
	    	}
	    	else{
	    		console.log("Waiting for " + uploadingCount + " file(s) to upload");
	    	}

	    },1000)

		var rURL = 'https://'+this.host+'/api/v1/Observations?settingId='+user.settingID+'&loginId='+user.onlineUserID+'&token='+user.ticket+'&observationId='+observation.onlineObservationID+'';
	
		console.log("Observation upload URL:" + rURL);
		console.log(JSON.stringify(obs));
    },
    uploadEvidence : function(evidence, user, successFunction, errorFunction)
    {
		console.log("Converting to correct file name format:");
    	// new: /storage/emulated/0/.onefile/assessor.OneFile_Photo_64.0.png
		// old: file:///storage/emulated/0/Android/data/com.phonegap.helloworld/cache/1398765752436.jpg
		console.log("Before:" + evidence.url);
		var diskURI = evidence.url.substring(7, evidence.url.length);

		diskURI = evidence.url.replace("file://", "");
		diskURI = diskURI.replace("file:", "");

		console.log("After:" + diskURI);
		
		var options = new FileUploadOptions();
		
		options.fileKey=evidence.description;
		options.fileName=diskURI.substr(diskURI.lastIndexOf('/')+1);

		console.log("upload filename " + options.fileName);
		console.log("friendly filename " + options.fileKey);
		
		/*
		var params = new Object();
		params.settingId  = user.settingID;
		params.loginId  = user.onlineUserID;
		params.ticket  = user.ticket;
		options.params = params;
		*/
		
		var win = function(r) 
		{
			//  {"Result":"Success","Errors":[],"Evidence":{"5":"1398772032106.jpg"}}
			//  {"Result":"Success","Errors":["A file with this name 1398772342278.jpg already exists."],"Evidence":{}}
			
			var response = $.parseJSON(r.response);

			console.log("response:" + response);
			
			var result = response['Result'];
			var errors = response['Errors'];
			
			if(errors != undefined && errors.length > 0)
			{
				alert("Upload error: " + errors[0]);
			}
			else if(result != "Success")
			{
				alert("Sorry, the server replied with an unexpected response:" + result);
			}
			else if(result == "Success")
			{
				console.log("Searching resposne for online evidence ID for file:" + options.fileName);
				
				var onlineEvidenceID = response['Evidence'][options.fileName]
				
				if(onlineEvidenceID > 0)
				{
					console.log("Found online ID: " + onlineEvidenceID);
					evidence.onlineEvidenceID = onlineEvidenceID;
					successFunction(evidence);
					return;
				}
				else
				{
					alert("Unexpected evidence ID recieved from server:" + onlineEvidenceID);
				}
			}
			
			console.log("Code = " + r.responseCode);
			console.log("Response = " + r.response);
			console.log("Sent = " + r.bytesSent);

			errorFunction(evidence, r.resposne);
		}

		var fail = function(error) 
		{
			alert("Your session as expired, please re-authenticate with PriMate.");	
			window.location = "login.html";
			
			//alert("An error has occurred: Code = " + error.code);
			console.log("upload error source " + error.source);
			console.log("upload error target " + error.target);
			console.log("upload error message " + error.message);
		}
		
		var rURL = 'https://'+this.host+'/api/v1/Upload?settingId='+user.settingID+'&loginId='+user.onlineUserID+'&token='+user.ticket;
		
		console.log('UPLOAD FILE URL:' + rURL);
		console.log('UPLOAD FILE diskURI:' + diskURI);

		var ft = new FileTransfer();
		ft.upload(diskURI, rURL, win, fail, options);	// encodeURI(string)
    }
}

function parseChildren(children, teacher)
{
	for(var i = 0; i < children.length; i++) 
	{
		var jchild = children[i];
		var child = new User();
		
		child.onlineUserID = jchild['UserID'];
		child.settingID  = jchild['SettingID'];
		child.firstname  = jchild['FirstName'];
		child.lastname  = jchild['LastName'];
		child.mobileTeacherID = teacher.mobileUserID;
		
		console.log("child.onlineUserID: " + child.onlineUserID);

		window.dbConnection.getUserUsingOnlineID(child, function(offlineChild, onlineChild) 
		{ 
			if(offlineChild == undefined || offlineChild.mobileUserID == 0)
			{
				console.log("Inserting child:" + onlineChild.firstname + " " + onlineChild.lastname);
				window.dbConnection.createUser(onlineChild, childInserted);
			}
			else{
				onlineChild.mobileUserID = offlineChild.mobileUserID;
				
				console.log("Updating child:" + onlineChild.firstname + " " + onlineChild.lastname);
				window.dbConnection.updateUser(onlineChild, childInserted);
			}
		});
	}
}

function finishedOfflineChildCheck(child)
{
	console.log("Error parsing:" + error.message);
	//window.dump(error);
}

function childInserted(child)
{
	console.log("Child ("+child.firstname+" " + child.lastname+ ":"+child.mobileUserID+") has been inserted or updated. Now inserting child x teacher("+child.mobileTeacherID+")... ");
	try
	{
		window.dbConnection.createChildxTeacher(child, function insertCompleted(child)
		{
			console.log("Child x teacher record inserted");
		});
	}
	catch(err)
	{
		console.log("Child already taught by teacher");
	}
}

function parseSettingElement(JSONSetting)
{
	var settingID = JSONSetting['SettingID'];
	var settingName = JSONSetting['Name'];
	var settingTypeID  = JSONSetting['SettingTypeID '];

	var terms = JSONSetting['CustomTerms'];
	
	for(var i = 0; i < terms.length; i++) {
		var term = terms[i];
		
		var TermID  = term['TermID'];
		

	}
	
}

function offlineLogin(user)
{
	console.log('offline login not implemented yet');
    return false;
}

window.webservice = new OneFileWebService("ws-primateuat.onefile.co.uk");