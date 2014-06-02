function User (onlineUserID, localUserID) 
{
    this.onlineUserID = 0;
    this.mobileUserID = 0;
    this.settingID = 0;
    this.username = undefined;
    this.firstname = undefined;
    this.lastname = undefined;
    this.email = undefined;
    this.address = undefined;
    this.telephone = undefined;
    this.telephoneMobile = undefined;
    this.password = undefined;
    this.ticket = undefined;
    this.dateOfBirth = undefined;
    this.dateCreated = undefined;
    this.dateModified = undefined;
    this.dateStarted = undefined;
    this.roleID = 0;
}
 
User.prototype = {
    getFullname : function(){
        return this.firsname + ' ' + this.lastname;
    }
}


function OneFileWebService(host)
{
	this.host = host;
}

OneFileWebService.prototype = 
{
    getHost : function()
    {
        return this.host;
    },
    updateAuth : function(user, successFunction, errorFunction)
    {
    	var postBody= {'username': user.username, 'password' : user.password};

    	alert(postBody);
        $.ajax({
	        url:'http://'+this.host+'/api/login.php',
	        type:'POST',
	        data:postBody,
	        dataType:'json',
	        error:function(jqXHR,text_status,strError)
	            {
	            	alert("e1");
	                if(offlineLogin(user))
	                {
	                	return true;
	                }
	                else{
	                	errorFunction(user, "message");
	                }
	            },
	        timeout:60000,
	        success:function(data)
	            {
	            	//alert('data: '+ data[0]['ticket'])
	                user.ticket = data[0]['ticket'];
	                successFunction(user);
	            }
        });
    },
    offlineLogin : function(user)
    {
        user.ticket = 'offline login not implemented yet';
        return true;
    }
}