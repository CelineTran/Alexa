'use strict';
const Alexa = require('alexa-sdk');
var AWS = require('aws-sdk');

//AWS.config.update({region: 'Region'});

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = 'amzn1.ask.skill.555c3d69-fd22-4c9e-a026-47e614449d84';

const SKILL_NAME = "";
const HELP_MESSAGE = "";
const HELP_REPROMPT = "";
const STOP_MESSAGE = "";

//var dynamodb = new AWS.DynamoDB(); 
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var stars; 


const handlers = {
    'LaunchRequest': function () {
        this.response.speak("Welcome to Celine's Facts").listen(); 
        this.emit(':responseReady');
    },
    'AddNameIntent': function () {
        var name = this.event.request.intent.slots.myName.value; 
        
        var params = {
            TableName: "CelineTable",
            Item : {
                "Name": {S: name},
                "Stars" : {N: "0"}
                } 
        };
        
        dynamodb.putItem(params, function(err,data) {
            if(err){
                console.log("Error", err);  
            }
            else {
                console.log("Success", err);
            }
        });

        var speechOutput = "Hi! " + name;
        
        this.response.speak(speechOutput).listen("");
        this.emit(':responseReady');
    },
    'SetStarsIntent' : function() {
        var userStars = this.event.request.intent.slots.myStars.value; 
        var name = this.event.request.intent.slots.myName.value; 
        
         var params = {
            TableName: "CelineTable",
            Item : {
                "Name": {S: name},
                "Stars": {N: userStars}
            } 
        };
        
        dynamodb.putItem(params, function(err,data) {
            if(err){
                console.log("Error", err);  
            }
            else {
                console.log("Success", err);
            }
        });

        var speechOutput = "Ok " + name + " now has " + userStars + " stars";
        
        this.response.speak(speechOutput).listen("");
        this.emit(':responseReady');
        
    },
    'AddStarsIntent' : function() {
        var userStars = this.event.request.intent.slots.myStars.value; 
        var name = this.event.request.intent.slots.myName.value; 
        var item = 'Stars'; 
        
        getData(name, item)
        .then((stars) => {
            
            var newStars =  (+stars) + (+userStars); 
            
            var params = {
            TableName: "CelineTable",
            Item : {
                "Name": {S: name},
                "Stars": {N: newStars.toString()}
                } 
            };
        
            dynamodb.putItem(params, function(err,data) {
                if(err){
                    console.log("Error", err);  
                }
                else {
                    console.log("Success", err);
                }
            });

            var speechOutput = "Ok " + name + " now has " + newStars + " stars";
        
            this.response.speak(speechOutput).listen("");
            this.emit(':responseReady');
    
        })
        .catch( (error) => { // Handler error gracefully
        console.log(error);
        this.response.speak("Something is wrong. Try later.").listen("");
        this.emit(':responseReady');
        });
        
    },
    'GetStarsIntent': function () {
        
        var name = this.event.request.intent.slots.myName.value; 
        var item = 'Stars';
        
        getData(name, item)
        .then( (stars) => {
        this.response.speak(name + " has " + stars + " stars").listen("");
        this.emit(':responseReady'); 
        })
        .catch( (error) => { // Handler error gracefully
        console.log(error);
        this.response.speak("Something is wrong. Try later.").listen("");
        this.emit(':responseReady');
        });
    }, 
    'RemoveNameIntent': function () {
        var name = this.event.request.intent.slots.myName.value; 
        
        var params = {
            TableName: "CelineTable",
            Key : {
                "Name":{S: name},
            } 
        };
        
        dynamodb.deleteItem(params,function(err,data) {
            if(err){
                console.log("Error", err);  
            }
            else {
                console.log("Success", err);
            }
        });
        
        this.response.speak("Ok bye " + name).listen(""); 
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};


function getData (name, item) {
        var params = {
                TableName: 'CelineTable', 
                    Key:
                        {
                            'Name' : {
                                S: name
                            }
                        },
                    ProjectionExpression : item
        }; 
        
        return new Promise((resolve,reject) => {
            dynamodb.getItem(params, function(err, data) {
            if (err) {
            }else{
                if (item == 'Stars'){
                stars = data.Item.Stars.N;
                resolve(stars);     
                }
            }
        });
    });
}
