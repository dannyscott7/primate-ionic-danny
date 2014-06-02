angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope) {
})

.controller('ObservationsCtrl', function($scope, Observations) {
	Observations.initialize();
	//alert("outside: "+$stateParams.mobileObservationID);

	$scope.observations = new Array();
	$scope.leftButtons = [{
	    type: 'button-icon button-clear ion-navicon',
	    tap: function(e) {
	      $ionicSideMenuDelegate.toggleLeft($scope.$$childHead);
	    }
  	}];

  	$scope.newObservation = function() {
  		window.location = "#/tab/observation/0";
  	};

   	Observations.all(window.user.mobileUserID).then(function (observations) {
   		 $scope.$apply(function () {
            $scope.observations = observations;
	   	  	console.log("Finsihed getting all observations:" + $scope.observations.length);
        });	
   	}, function () {
	    alert('something went wrong');
   	});
})

.controller('ObservationCtrl', function($scope, $stateParams, Observations) 
{ 
	if($stateParams.mobileObservationID == 0/* && $scope.observation == null*/){
		console.log("uno");
		//$scope.$apply(function () {
			$scope.observation = new Observation();
			$scope.observation.mobileObservationID = 0;
			$scope.observation.title = "New observation";
			$scope.observation.dateObservation = new Date().getDefaultDate();
			$scope.observation.mobileUserID = window.user.mobileUserID;
			//window.dump($scope.observation);
		//}); 
	} else if($scope.observation == null/* && (Observations.getCurrentObservation() != undefined && Observations.getCurrentObservation().mobileObservationID != $stateParams.mobileObservationID)*/){
		console.log("dos");
		Observations.findById($stateParams.mobileObservationID).then(function (observation) {
	   		$scope.$apply(function () {
		   		$scope.observation = observation;
	        });   	  	
	   	}, function () {
		    alert('something went wrong gettibg observation');
	   	});
	}else{
		console.log("tres");
		$scope.observation = Observations.getCurrentObservation();  
	}

	$scope.selectChildren = function() {
		Observations.setCurrentObservation($scope.observation);
		console.log("mobileObservation: " + $scope.observation);
		window.location = "#/tab/selectchildren/" + $scope.observation.mobileObservationID;
	};

	$scope.saveObservation = function() {
		//console.log("saving observation with mobileID: " + $stateParams.mobileObservationID);
		//console.log("abc: "+$scope.observation);

		if($stateParams.mobileObservationID == 0){
			Observations.createObservation($scope.observation).then(function (mobileObservationID) {
				$scope.observation.mobileObservationID = mobileObservationID;
				console.log("Observation saved, returned mobileID:" + mobileObservationID);
				window.history.back();
		   	}, function () {
			    alert('Something went wrong when creating observation.');
		   	});
		}else if($stateParams.mobileObservationID > 0){
			Observations.updateObservation($scope.observation).then(function (mobileObservationID) {
				$scope.observation.mobileObservationID = mobileObservationID;
				window.history.back();
		   	}, function () {
			    alert('Something went wrong when retrieving observation.');
		   	});
		}
	};
})

.controller('ChildrenCtrl', function($scope, $stateParams, Children, Observations) {

	this.isHidden = false;
	$scope.children = Children.all();
	
	$scope.$watch('children', function(nv, ov) {
      console.log("scope watch triggered");
    },true);

    $scope.selection = [];

	if($stateParams.mobileObservationID != undefined && $stateParams.mobileObservationID > 0){
		$scope.title = "Select Children";
		this.isHidden = true;
		$scope.observation = Observations.getCurrentObservation();  

		$scope.$watch('selection', function () {
			console.log('change', $scope.selection);

		    $scope.observation.children = [];
		    angular.forEach($scope.selection, function (value, index) 
		    {
		    	console.log("for each child at " + index);
		      if (value) $scope.observation.children.push($scope.children[index]);
		    });

    		Observations.setCurrentObservation($scope.observation);

		}, true);
	}else{
		$scope.title = "My Children";
		this.isHidden = false;
	}

	$scope.selectChildren = function() {
		console.log("Updating children for observation: " + $stateParams.mobileObservationID);
		window.history.back();
	};
})

.controller('EvidenceCtrl', function($scope, Evidences) {
	$scope.leftButtons = [{
	    type: 'button-icon button-clear ion-navicon',
	    tap: function(e) {
	      $ionicSideMenuDelegate.toggleLeft($scope.$$childHead);
	    }
	  }];

	  $scope.newEvidence = function() {
	  		window.location = "#/tab/evidence/0";
	  };

  $scope.evidences = Evidences.all();
})

.controller('LoginCtrl', function($scope) {

	$scope.signIn = function(user) {
    	console.log('Sign-In', user);
	    var username = user.username.trim();
	    var password = user.password.trim();

	    var iuser = new User();

	    iuser.username = username;
	    iuser.password = password;

	    console.log("Starting login call for " + username);
	    
	    //var spinner = new Spinner().spin(document.getElementById('img-preview'));
	    //$(document.getElementById('img-preview')).data('spinner', spinner);

	    $('#btnLogin').html('Connecting...');
	    
	    window.webservice.updateAuth(user, authSuccess, authError);
	};

	function authSuccess(user)
	{
		console.log("authSuccess:");
		window.dump(user);

	    window.user = user;
	    //$("#img-preview").data('spinner').stop();
	    $('#btnLogin').html('Log in');
	    
	    window.dbConnection.getUserUsingOnlineID(user, offlineUserCheck);
	}

	function offlineUserCheck(offlineUser, user)
	{    
	    window.dump(offlineUser);

	    if(offlineUser == undefined || offlineUser.mobileUserID == 0)
	    {
	        console.log("Inserting new user details.");
	        window.dbConnection.createUser(window.user, insertUserSuccess);
	    }else{
	        window.user.mobileUserID = user.mobileUserID;
	        console.log("Updating existing user details.");
	        window.dbConnection.updateUser(window.user, insertUserSuccess);
	    }
	}

	function authError(user, message)
	{
	    console.error("webservice auth error: " + message);
	    //$("#img-preview").data('spinner').stop();
	    $('#btnLogin').html('Log in');
	    
	    if(message.length > 0)
	    {
	    	alert(message);
	    }else{
	    	alert("Sorry there was a problem connecting to PriMate. " + message);
		}
	}

	function insertUserSuccess(user)
	{   
		console.log("insertUserSuccess:");
		window.dump(user);

	    window.user = user;
	    localStorage.setItem("user", JSON.stringify(user));
	    console.log("user ("+user.username+":"+user.mobileUserID+") successfully inserted or updated.");
	    window.location = "#/tab/home";
	}
});
