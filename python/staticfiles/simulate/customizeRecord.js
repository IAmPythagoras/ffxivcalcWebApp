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
var nRows = 0;
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
            nRows = parseInt(res['nRows']);
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

                             // Check nRows
    if (nRows == 0) {alert("The current record has no row. It must have at least 1.");return;}
    else if (nRows >= 256){alert("The record has too many rows to safely export in PDF format (must be less than 256). Either reduce the number of rows or export in text format.");return;}

    const {dialog} = require("@electron/remote");
    xhr2 = new XMLHttpRequest();
    var url = "http://127.0.0.1:8000/simulate/simulationRecordCustomizeView/?id="+eventId;
    xhr2.open("GETPDF", url, true);
    xhr2.setRequestHeader("Content-type", "application/json");
    xhr2.onreadystatechange = function() { 
        if (xhr.responseText == 'ERROR'){alert("An unknown error happened while trying to save the record. Try to reduce the number of rows or reach out on discord of this issue persists.");}
    };
    var file = dialog.showSaveDialogSync();
    var idList = [];
    for (var key in playerTracking){if(playerTracking[key]){idList.push(key);}}
    var data=JSON.stringify({"scope" : {"startTime" : startTime, "endTime" : endTime, "trackAutos" : trackAutos,
                                    "trackDOTs" : trackDOTs, "trackPlayer" : idList},
                         "path" : file + ".pdf"})
    xhr2.send(data);
}

function downloadSimulationRecordTxt(){
    if (nRows == 0) {alert("The current record has no row. It must have at least 1.");return;}
    const {dialog} = require("@electron/remote");
    xhr3 = new XMLHttpRequest();
    var url = "http://127.0.0.1:8000/simulate/simulationRecordCustomizeView/?id="+eventId;
    xhr3.open("GETTXT", url, true);
    xhr3.setRequestHeader("Content-type", "application/json");
    xhr3.onreadystatechange = function() { 
        if (xhr.responseText == 'ERROR'){alert("An unknown error happened while trying to save the record. Try to reduce the number of rows or reach out on discord of this issue persists.");}
    };
    var file = dialog.showSaveDialogSync();
    var idList = [];
    for (var key in playerTracking){if(playerTracking[key]){idList.push(key);}}
    var data=JSON.stringify({"scope" : {"startTime" : startTime, "endTime" : endTime, "trackAutos" : trackAutos,
                                    "trackDOTs" : trackDOTs, "trackPlayer" : idList},
                         "path" : file + ".txt"})
    xhr3.send(data);
}