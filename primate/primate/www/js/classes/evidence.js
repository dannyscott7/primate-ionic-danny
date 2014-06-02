function Evidence () 
{
    this.mobileUserID = 0;
	this.onlineEvidenceID = 0;
	this.mobileEvidenceID = 0;
	this.description = undefined;
	this.extension = undefined;
	this.size = 0;
	this.dateCreated = undefined;
	this.dateModified = undefined;
	this.settingID = 0;
	this.url = undefined;
}

window.capturePhoto = function() 
{	
   //success_callback = typeof success_callback !== 'undefined' ? success_callback : onPhotoSuccess;
   //error_callback = typeof error_callback !== 'undefined' ? error_callback : captureError;

  	navigator.camera.getPicture(onPhotoSuccess, captureError, { quality: 50, destinationType: Camera.DestinationType.FILE_URI }); 
}

window.captureAudio = function() 
{
	//success_callback = typeof success_callback !== 'undefined' ? success_callback : audio_captureSuccess;
    //error_callback = typeof error_callback !== 'undefined' ? error_callback : captureError;
   
  	navigator.device.capture.captureAudio(audio_captureSuccess, captureError, {limit: 1}); // limit 1 audio clip
}

window.captureVideo = function() 
{
	//success_callback = typeof success_callback !== 'undefined' ? success_callback : video_captureSuccess;
    //error_callback = typeof error_callback !== 'undefined' ? error_callback : captureError;
   
  	navigator.device.capture.captureVideo(video_captureSuccess, captureError, {limit: 1}); // limit 1 video clip
}

function captureError(error) 
{
    var msg = 'Error: ' + error.code;
    console.error(msg);
	alert(msg);
}

function video_captureSuccess(mediaFiles) {
    var i, len;
    var name, path;

    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        mediaFile = mediaFiles[i];
        path = mediaFile.fullPath,
        name = mediaFile.name;
    }    

    if(path.length > 0)
    {
    	window.location.href = "saveevidence.html?evidenceURL="+path+"&evidenceType=video&name=" + name;
    }  
}

function audio_captureSuccess(mediaFiles) {
    var i, len;
    var name, path;

    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        mediaFile = mediaFiles[i];
        path = mediaFile.fullPath,
        name = mediaFile.name;
    }    

    if(path.length > 0)
    {
    	window.location.href = "saveevidence.html?evidenceURL="+path+"&evidenceType=audio&name=" + name;
    }  
}

function onPhotoSuccess(imageURI) 
{
	window.location.href = "saveevidence.html?evidenceURL="+imageURI;
}