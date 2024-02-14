// This files takes care of the logic in 'customizeRecord.html'

// Initializing variables

var startTime = 0;
var endTime = 99999;

var trackAutos = true;
var trackDOTs = true;

var playerTracking = new Object();
                             // playerTracking contains the id of players of the fight
                             // with a boolean value telling if the user wants to track
                             // this player in the record.
var eventId = 0;
//
// INITIALIZE ID LIST
//

function addTrackedPlayer(id){
    playerTracking[id] = true;
}

//
// UPDATE FUNCTIONS
//

function updateStartTime(){
    var tempStartTime = parseInt(document.getElementById("startTime").value);
    if (validateTimeInterval(tempStartTime, endTime)){startTime = tempStartTime;getRecordLength();} // Check valid, if is does the change
    else{document.getElementById("startTime").value = startTime;}

}

function updateEndTime(){
    var tempEndTime = parseInt(document.getElementById("endTime").value);
    if (validateTimeInterval(startTime, tempEndTime)){endTime = tempEndTime;getRecordLength();}
    else{document.getElementById("endTime").value = endTime;}
}

function validateTimeInterval(start, end){
    // This checks that endTime > startTime
    if (start >= end){
        alert("The start time of the record must be higher than its end time.");return false;
    }
    return true;
}

function updateTrackAutos(){
    trackAutos = ! trackAutos;
    getRecordLength();
}

function updateTrackDOTs(){
    trackDOTs = ! trackDOTs;
    getRecordLength();
}

function updateTrackedPlayer(id){
    playerTracking[id] = ! playerTracking[id];
    getRecordLength();
}

//
// Get functions
//

function setEventId(id){
    // This function saves in this page's memory the event id
    eventId = id;
}

function getRecordLength(){
    xhr = new XMLHttpRequest();
    var url = "http://127.0.0.1:8000/simulate/simulationRecordCustomizeView/?id="+eventId;
    xhr.open("GETRECORDLENGTH", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function() {
                                 // When the request has been processed, the user is sent to the SimulationResult page. If there was an error the user is notified and we return.
        var res = JSON.parse(xhr.responseText.replaceAll("'",'"'))
        if (res.length == 0){return;}
        if (res["status"] == "ERROR"){alert("An error happened when retrieving the record's length.");return;}
        else if(res["status"] == "OK"){
            document.getElementById("nRows").innerHTML = res['nRows'];
        }
    }
    var idList = [];
    for (var key in playerTracking){if(playerTracking[key]){idList.push(key);}}

                                 // Sends the request.
    var data = JSON.stringify({"startTime" : startTime, "endTime" : endTime, "trackAutos" : trackAutos,
                               "trackDOTs" : trackDOTs, "trackPlayer" : idList})
    xhr.send(data);
}

function downloadSimulationRecord(){
    const {dialog} = require("@electron/remote");
    xhr2 = new XMLHttpRequest();
    var url = "http://127.0.0.1:8000/simulate/simulationRecordCustomizeView/?id="+eventId;
    xhr2.open("POST", url, true);
    xhr2.setRequestHeader("Content-type", "application/json");
    var file = dialog.showSaveDialogSync();
    xhr2.send(file + ".pdf");
}