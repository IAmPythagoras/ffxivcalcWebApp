var fight = {};
const prompt = require('native-prompt')
var fs = require('fs');
const {app, BrowserWindow,dialog} = require("@electron/remote");
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

function importFFLog(){

    document.getElementById("importButton").innerHTML = "Importing..."
    document.getElementById("importButton").style = "background-color:red;"

    var xhr = new XMLHttpRequest();
    var url = "/simulate/importFFLogs/";
    xhr.open("IMPORT", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.responseText.length == 0){return;}


        if (xhr.responseText.includes("error")){
            alert("An error occured, action aborted. Error message : " + xhr.responseText);
        } else{
            var res = xhr.responseText.replaceAll("'",'"');
            var res = JSON.parse(res);
            alert("Import was succesful. You can now save it.");
            fight = res["data"];
            saveImport();
        }

        document.getElementById("importButton").innerHTML = "Import"
        document.getElementById("importButton").style = ""

        

    }

    const maxTimeValue = document.getElementById("maxTime").value;
    var maxTime = maxTimeValue.length == 0 ? 0 : maxTimeValue
    var data = JSON.stringify({"code" : document.getElementById("code").value, "fightId" : document.getElementById("fightId").value, "max_time" : parseFloat(maxTime)});
    xhr.send(data);
}

function saveImport(){
    var file = dialog.showSaveDialogSync();
    data = {"data" : fight, 
            "mode" : false,
            "TeamCompBonus" : false,
            "MaxPotencyPlentifulHarvest" : false,
            "nRandomIterations" : 0}
    jsonData = JSON.stringify(data, null, 4);

    fs.writeFile(file+".json", jsonData, function (err) { 
        if (err) throw err; 
        console.log('Saved!'); 
    });
}