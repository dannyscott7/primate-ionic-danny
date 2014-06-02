function Observation () 
{
    this.onlineObservationID = 0;
    this.mobileObservationID = 0;
    this.mobileUserID = 0;
    this.dateObservation = undefined;
    this.dateCreated = undefined;
    this.dateModified = undefined;
    this.whatNext = undefined;
    this.comments = undefined;
    this.title = undefined;
    
    this.evidence = new Array();
    this.children = new Array();
    this.aspects = new Array();
}
 
Observation.prototype = {
    getLocalID : function()
    {
        return this.localObservationID;
    },
    getAmericanDate : function()
    {
        var americanDate = this.dateObservation.split('/')[2] + "-" + this.dateObservation.split('/')[0] + "-" + this.dateObservation.split('/')[1];
        
        if(this.dateObservation.indexOf("/") == -1) // already yyyy-mm-dd
        {
            return this.dateObservation;
        }
        
        return americanDate;
    },
    addChild : function(child)
    {   
        this.children.push(child);
    }
}