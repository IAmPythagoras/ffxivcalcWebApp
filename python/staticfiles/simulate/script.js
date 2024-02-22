/* 
GLOBAL VARIABLE DECLARATION
*/                             
                             // PlayerConfigDict will hold in memory all the information inputted by the user
                             // for the simulation. This will be sent as a POST request to the server
                             // when the player wants to simulate.
var PlayerConfigDict = new Object();   
var NumberOfPlayer = 0;
                             // This represents the next given ID to a new player. Every player has a unique ID.
                             // This value is never decremented and is a unique value for every player, but it will be incremented every time we add a player.
var nextPlayerID = 0;
                             // This represents the ID of the player being currently edited.
var currentEditPlayerID = 0;
                             // This flag lets the code know if there is at least one player in the simulation.
                             // It will block the simulation if there are no players.
var AtLeastOnePlayer = false;
                             // These values corresponds to the checkbox in Fight configuration
var RequirementOn = false;
var IgnoreMana = false;
var DebugMode = false;
var ResultNewTab = true;
var TeamCompBonus = false;
var MaxPotencyPlentifulHarvest = false;
var nRandomIterations = 0;
                             // Flag to know if we sent a simulation
var InQueue = false;
/* 
GLOBAL VARIABLE DECLARATION END
*/     

const prompt = require('native-prompt')
var fs = require('fs');
const {app, BrowserWindow,dialog} = require("@electron/remote");
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();
//const prompt = require('electron-prompt')


/*

OPENING WINDOW

*/

function createWindow(width, height, url) {
    const win = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: true,
        contextIsolation: false
      },
      icon: 'icon.png'
    });
    win.loadURL(url);
  }

/* 

MAIN MENU OPEN LINK

*/

function openGitHub(){
    require('electron').shell.openExternal("https://github.com/IAmPythagoras/FFXIV-Combat-Simulator");
}

function openDiscord(){
    require('electron').shell.openExternal("https://discord.gg/wz2fYhZV");
}

function openMore(){
    createWindow(1050,1000,"http://127.0.0.1:8000/simulate/More/")
}

function openCredit(){
    createWindow(1000,900,"http://127.0.0.1:8000/simulate/credit/")
}

function openCustomizeSimulationRecord(id){
    createWindow(1000,900,"http://127.0.0.1:8000/simulate/simulationRecordCustomizeView/?id="+id)
}

/* 

MORE OPEN LINK

*/

function openColab(){
    require('electron').shell.openExternal("https://colab.research.google.com/drive/15RgXpmIdJnFiY34iqj9WqrnC68Pt1ar8?usp=sharing");
}

function openDocumentation(){
    require('electron').shell.openExternal("https://iampythagoras.github.io/customize_fight.html#");
}

function openMonteCarlo(){
    require('electron').shell.openExternal("https://en.wikipedia.org/wiki/Monte_Carlo_method");
}

function openAmarantineRepo(){
    require('electron').shell.openExternal("https://github.com/Amarantine-xiv/Another-FF14-Combat-Sim");
}

/*
Save/Import functions
*/

function importEtroGearSet(){
    // This function imports what is written in the etro url
    // and sets the fields' value accordingly.

    if (NumberOfPlayer == 0){
        alert("Add a player to import an etro gear set.");return;
    }

    xhr = new XMLHttpRequest();
    var url = "http://127.0.0.1:8000/simulate/SimulationInput/";
    xhr.open("GETETRO", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function() {
                                 // When the request has been processed, the user is sent to the SimulationResult page. If there was an error the user is notified and we return.
    if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == "200") {
        if (xhr.responseText == "ERROR"){
            alert("There was an error when importing the gear set from etro with url '" + document.getElementById("etroURL").value + "' . This could be an issue with etro, with the url or with the application. If this persists please reach out on discord.")
        }
        else {
            var res = JSON.parse(xhr.responseText.replaceAll("'",'"'));

            // Replace the values in the viewer.
            document.getElementById("MainStat").value = res["MainStat"];
            document.getElementById("Crit").value =  res["Crit"];
            document.getElementById("DH").value =  res["DH"];
            document.getElementById("WD").value =  res["WD"];
            document.getElementById("SkS").value =  res["SkS"];
            document.getElementById("SpS").value =  res["SS"];
            document.getElementById("Det").value =  res["Det"];
            document.getElementById("Ten").value =  res["Ten"];
            // Saving values
            SavePlayerConfiguration(currentEditPlayerID);
        }
            // resetting button
        document.getElementById("etroButton").innerHTML="Import";
        document.getElementById("etroButton").style.background = "rgba(65, 65, 65, 0.695)";
    }
    }
                                 // Sends the request.
    var data = document.getElementById("etroURL").value;
    xhr.send(data);
    document.getElementById("etroButton").innerHTML="Importing...";
    document.getElementById("etroButton").style.background = "red";

}

function resetData(){

    // This resets the data

    PlayerConfigDict = new Object();   
    NumberOfPlayer = 0;
    nextPlayerID = 0;
    currentEditPlayerID = 0;
    AtLeastOnePlayer = false;
    RequirementOn = false;
    IgnoreMana = false;
    DebugMode = false;
    ResultNewTab = true;
    TeamCompBonus = false;
    MaxPotencyPlentifulHarvest = false;
    InQueue = false;
}

function resetView(){
    document.getElementById("PlayerRosterViewer").innerHTML = '';
    document.getElementById("ActionListPick").innerHTML = "";
    document.getElementById("PlayerActionListViewer").innerHTML = "";
    document.getElementById("player_counter").innerHTML = "0";

    document.getElementById("PlayerName").value = "SussyPlayer";
    document.getElementById("Job").value = "BlackMage";
    document.getElementById("MainStat").value = "390";
    document.getElementById("Crit").value = "400";
    document.getElementById("DH").value = "400";
    document.getElementById("WD").value = "400";
    document.getElementById("SkS").value = "400";
    document.getElementById("SpS").value = "400";
    document.getElementById("Det").value = "400";
    document.getElementById("Ten").value = "400";
    document.getElementById("weaponDelay").value = "3.00";
    document.getElementById("etroURL").value = "";
}

function resetFile(){
    if (Object.keys(PlayerConfigDict).length !== 0){
        // Window currently has nothing. 
        var uInput = dialog.showMessageBoxSync({
            title: "Confirm choice",
            message: "This fight has (possible) unsaved data. Do you wish to continue?",
            buttons: ["Yes", "No"],
            cancelId: 1
        });
        if (uInput == 1) return; // Abort
    }
    // This resets the view/data.
    resetData();
    resetView();
    UpdatePlayerConfigurationEdit("true");
}

function saveFile(){

    if (Object.keys(PlayerConfigDict).length === 0){
        // Window currently has nothing. 
        var uInput = dialog.showMessageBoxSync({
            title: "Confirm choice",
            message: "This fight has no data. Do you wish to continue?",
            buttons: ["Yes", "No"],
            cancelId: 1
        });
        if (uInput == 1) return; // Abort
    }

    var file = dialog.showSaveDialogSync();

    data = JSON.stringify(exportPlayerConfigDict(), null, 4);

    fs.writeFile(file+".json", data, function (err) { 
        if (err) throw err; 
        console.log('Saved!'); 
    });

}

function importFile() {

    if (Object.keys(PlayerConfigDict).length !== 0){
        // Window currently has possibly unsaved data. Confirms the user's choice
        var uInput = dialog.showMessageBoxSync({
            title: "Confirm choice",
            message: "This fight has (possible) unsaved data. Do you wish to continue?",
            buttons: ["Yes", "No"],
            cancelId: 1
        });
        if (uInput == 1) return; // Abort
    }


    
    var fileName = dialog.showOpenDialogSync({properties: ['openFile']});
    alert(fileName[0]);
    fs.readFile(fileName[0], 'utf-8', (err, data) => {
        if(err){
            alert("An error ocurred reading the file :" + err.message);
            return;
        }
        try{
                                // Will reset and set PlayerConfigDict as needed.
                                // For now assume the file is in the correct
                                // format.

            dataDict = JSON.parse(data)["data"];

            // Clear the view and data
            resetData();
            resetView();

            var RequirementOn = dataDict["fightInfo"]["RequirementOn"];
            var IgnoreMana = dataDict["fightInfo"]["IgnoreMana"];
            //var TeamCompBonus = dataDict["data"]["fightInfo"]["TeamCompBonus"];
            //var MaxPotencyPlentifulHarvest = false;

            for(let i = 0;i< dataDict["PlayerList"].length;i++){
                var player = dataDict["PlayerList"][i];
                var statDict = player["stat"];
                var playerActionList = player["actionList"]
                var id = player["playerID"];
                var playerName = ""
                             // If it is not there the name is set as "undefined". This makes the
                             // data verif fail. So instead of changing the data verif I add a name
                             // in case there is none.
                if (!("PlayerName" in player)){
                    switch (player["JobName"]){
                        case "BlackMage" : playerName = "Leon";
                            break;
                        case "RedMage" : playerName = "Yami";
                            break;
                        case "Summoner" : playerName = "Christian";
                            break;
                        case "DarkKnight" : playerName = "Neo";
                            break;
                        case "Warrior" : playerName = "Luiz";
                            break;
                        case "Paladin" : playerName = "Horseshoe";
                            break;
                        case "Gunbreaker" : playerName = "Sol";
                            break;
                        case "Scholar" : playerName = "Cel";
                            break;
                        case "WhiteMage" : playerName = "Yna";
                            break;
                        case "Sage" : playerName = "Dixy";
                            break;
                        case "Astrologian" : playerName = "Aimi";
                            break;
                        case "Ninja" : playerName = "Narga";
                            break;
                        case "Monk" : playerName = "Dhedge";
                            break;
                        case "Reaper" : playerName = "EdgeLord";
                            break;
                        case "Samurai" : playerName = "Daibumu";
                            break;
                        case "Dragoon" : playerName = "Floortank";
                            break;
                        case "Bard" : playerName = "Lauri";
                            break;
                        case "Machinist" : playerName = "American";
                            break;
                        case "Dancer" : playerName = "Brian";
                    }
                } else {playerName = player["PlayerName"];}

                PlayerConfigDict[id] = {
                    "PlayerName" : playerName,
                    "PlayerID" : id, // This value is non-editable.
                    "NextActionIndex" : 0,
                    "NextActionID" : 0,
                    "Job" : player["JobName"],
                    "etro_gearset_url" : player["etro_gearset_url"],
                    "Stat" : statDict,
                    "ActionList" :[],
                    "weaponDelay" : 3.00
                };

                if ("weaponDelay" in player){PlayerConfigDict[id]['weaponDelay'] = player['weaponDelay'];}

                for(let j = 0;j<playerActionList.length;j++){

                    var curAction = playerActionList[j];

                    Identification = String(id)+String(PlayerConfigDict[id]["NextActionID"]);
                    //PlayerConfigDict[currentEditPlayerID]["NextActionID"]++;
                                            // Action is the action's name
                                            // ActionID is a unique value for the action in the actionlist of the player (it is a concatenation of the player's ID and the NextactionID value of the player)
                                            // Index in list corresponds to the index of the action in the action list of the player.
                                            // target is the target ID if there is any. -1 represents the enemy.
                    var ActionDict = {
                    "Action" : curAction["actionName"],
                    "ActionID" : Identification, 
                    "IndexInList" : PlayerConfigDict[id]["NextActionIndex"],
                    "target" :  -1
                    };

                    if ("targetID" in curAction){
                        ActionDict["target"] = curAction["targetID"];
                    };

                    if ("waitTime" in curAction){
                        ActionDict["WaitTime"] = curAction["waitTime"];
                        ActionDict["Action"] = "wait_ability";
                    }

                    PlayerConfigDict[id]["ActionList"].push(ActionDict);

                                // Incrementing required counters.
                    PlayerConfigDict[id]["NextActionIndex"]++;
                    PlayerConfigDict[id]["NextActionID"]++;
                    
                };
            
                // Adding the new Player division
                const boxWrapper = document.getElementById("PlayerRosterViewer");
                const box = document.createElement("div");
                
                                            // Every div has a unique ID to access it
                box.setAttribute("id", "Edit"+id);
                box.innerHTML = '<p id="Player'+id+'Name">'+PlayerConfigDict[id]["PlayerName"]+' ID - '+id+'</p><button class="basicButton" onclick="LoadPlayerConfiguration('+id+')">Edit</button><button class ="basicButton" style="background-color: red;position:absolute;right:5%;" onclick="DeletePlayer('+id+')">Delete</button></div>';
                box.setAttribute("style","background-color: #333;border-radius: 5px;border: 1px solid #333;");
                boxWrapper.appendChild(box);
                                            // If there is no player, we have to set the currentEditPlayerID as the newly created playerID (nextPlayerID)
                                            // Otherwise it will try to load the currentEditPlayerID (which might be a non existing player) in the LoadPlayerConfiguration
                                            // When clicking the Edit button.
                    if (! AtLeastOnePlayer){
                    AtLeastOnePlayer = true;
                    currentEditPlayerID = id;
                    UpdatePlayerConfigurationEdit("false");
                }
                                            // Increment nextPlayerID.
                nextPlayerID++;
                                            // Increment number player
                NumberOfPlayer++;
                UpdateNumberPlayerDisplay();
            };
            LoadPlayerConfiguration(currentEditPlayerID,save=false);
        }    
        catch(err){
            alert("There was an error when reading the file:" + err.message)
        }

    });
};

/*
VALIDATION FUNCTIONS
*/

function validateWaitTime(UserInput){
    return UserInput == null ||     /* User hit cancel */
           UserInput == ""   ||     /* User did not input anything */
           (!onlyNumbers(UserInput) && !onlyFloat(UserInput)); /* User input has letters */
}

function validateTarget(UserInput){
    return UserInput == null ||                 /* User hit cancel */
          !(onlyNumbers(UserInput)) ||          /* User input has letters */
          !(UserInput in PlayerConfigDict) ||   /* User targets a non existing player */
           UserInput == currentEditPlayerID;    /* Player targets itself */
}

/*
FUNCTION INTERACTING WITH WHAT IS DISPLAYED
*/
function addNewPlayer() {
/* 
This function is called when the user wishes the create a new player. It appends to PlayerConfigDict, and adds a new div in the html page.
*/

if (Object.keys(PlayerConfigDict).length >= 8){
    alert("You cannot have more than 8 players.");
    return;
}


PlayerConfigDict[nextPlayerID] = {
    "PlayerName" : "Player" + nextPlayerID,
    "PlayerID" : nextPlayerID, // This value is non-editable.
    "NextActionIndex" : 0,
    "NextActionID" : 0,
    "Job" : "BlackMage", // Defaults to BlackMage
    "etro_gearset_url" : "",
    "weaponDelay" : 3.00,
    "Stat" : {
        "MainStat" : 390,
        "WD" : 400,
        "Det" : 400,
        "Ten" : 400,
        "SS" : 400,
        "SkS" : 400,
        "Crit" : 400,
        "DH" : 400
    },
    "ActionList" :[]
}

                             // Adding the new Player division
const boxWrapper = document.getElementById("PlayerRosterViewer");
const box = document.createElement("div");
                             // Every div has a unique ID to access it
box.setAttribute("id", "Edit"+nextPlayerID);
box.innerHTML = '<p id="Player'+nextPlayerID+'Name">'+PlayerConfigDict[nextPlayerID]["PlayerName"]+' ID - '+nextPlayerID+'</p><button class="basicButton" onclick="LoadPlayerConfiguration('+nextPlayerID+')">Edit</button><button class ="basicButton" style="background-color: red;position:absolute;right:5%;" onclick="DeletePlayer('+nextPlayerID+')">Delete</button></div>';
box.setAttribute("style","background-color: #333;border-radius: 5px;border: 1px solid #333;");
boxWrapper.appendChild(box);
                             // If there is no player, we have to set the currentEditPlayerID as the newly created playerID (nextPlayerID)
                             // Otherwise it will try to load the currentEditPlayerID (which might be a non existing player) in the LoadPlayerConfiguration
                             // When clicking the Edit button.
    if (! AtLeastOnePlayer){
    AtLeastOnePlayer = true;
    currentEditPlayerID = nextPlayerID;
    UpdatePlayerConfigurationEdit("false");
    LoadPlayerConfiguration(nextPlayerID);
}
                             // Increment nextPlayerID.
nextPlayerID++;
                             // Increment number player
NumberOfPlayer++;
UpdateNumberPlayerDisplay();
}

function DeletePlayer(PlayerID){
/*
This function removes a player from the simulation input.
It will ask for a prompt from the user to make sure the action was deliberate.
*/
    const confirmation = confirm("Are you sure you want to delete the player : " + String(PlayerConfigDict[PlayerID]["PlayerName"]) + "? Make sure that there are no actions targetting this player if you delete it.");
    if (! confirmation){return;}
                             // Updating player counter
    NumberOfPlayer--;
    UpdateNumberPlayerDisplay();
                             // Removing the player from the PlayerConfigDict and from the roster viewer
    document.getElementById("Edit"+String(PlayerID)).remove()
    delete PlayerConfigDict[PlayerID];
                             // If the deleted player was not the one being edited. We do nothing.
    if (PlayerID != currentEditPlayerID){return;}
                             // If the deleted player was the one being edited, we update so the user is editing the first player
    for (let id in PlayerConfigDict){
                             // If there is at least one player, we now select the first player in the list.
        currentEditPlayerID = id;
        LoadPlayerConfiguration(id, save=false);
        return;
    }
                             // If we're here there were no other players. So we will clear the screen.
    AtLeastOnePlayer = false;
    UpdatePlayerConfigurationEdit("true");
    document.getElementById("ActionListPick").innerHTML = "";
    document.getElementById("PlayerActionListViewer").innerHTML = "";
}

function DelActionFromList(ActionID){
/*
This function returns a function that will delete an action from the PlayerActionlistViewer.
The returned action is called when the user clicks on the action. It takes an ActionID which
corresponds to the ActionIden of the action.
*/
    function delAction(){
    /*
    Deletes an action from the player's action list.
    If is wait_ability or any targetted action it will ask the user
    if they wish to change the wait_timer or the target. If not it will delete
    the action.
    */  
        var doc = document.getElementById(ActionID);
        var ActionList = PlayerConfigDict[currentEditPlayerID]["ActionList"];
        var action;

                             //Find the Action with the ActionIden
        for (let i = 0;i<ActionList.length;i++){
            if (ActionList[i]["ActionID"] == ActionID)
                {
                action = ActionList[i];
                break;
                }
        }

        if (action["target"] != -1)
            {
                // We will ask the user if they want to simply change the target.
                var TargetID = askTargetID(update=true);
                
                if (TargetID == -1){
                    // The user aborted the action
                    return;
                }

                if (TargetID == null){
                    // User wants to delete
                    updatePlayerActionListViewerAfterDeletion(ActionID, ActionList, action);
                }else{
                    // User wants to change the target
                    // User wants change the target
                    if (validateTarget(TargetID)){
                    alert("The input player ID is unvalid. The operation is cancelled.");
                    return;
                    }
                    action["target"] = TargetID;
                                // Will also change the title value.
                    doc.removeAttribute("title");
                    doc.setAttribute("title", ActionViewerDocTitle(action, true));
                    return;
                }
                return;
            }
        else if (action["Action"] == "wait_ability")
            {
                             // We ask if they want to just change the time.
                (async () => {await prompt("Time Select", "If you want to change the wait time enter a valid input. Otherwise simply click on 'Cancel' with no input to delete the action.", { defaultText: "0" })
                .then(UserInput => {
                    if (UserInput != null && UserInput != ""){
                        // User wants to change the wait time
                    if (validateWaitTime(UserInput)){
                        alert("The wait time is unvalid. The operation is cancelled.");
                        return;
                    }
                    action["WaitTime"] = UserInput;
                                // Change title to reflect new time
                    doc.removeAttribute("title");
                    doc.setAttribute("title", ActionViewerDocTitle(action, false));
                    return;
                    }
                    else{
                            // User wants to delete.
                            // Adjust the IndexInList of the other actions.
                        updatePlayerActionListViewerAfterDeletion(ActionID, ActionList, action)
                    }
            });})();

            return;
            }

                                // Adjust the IndexInList of the other actions.
            updatePlayerActionListViewerAfterDeletion(ActionID, ActionList, action)
            updateTimeEstimate() // Update time estimate
    }

return delAction;

}

function CreateAddAction(ActionID, IsTargetted, IsAdded, ActionIden){
/*
This function returns a function that adds an action to a player's action list. Every button in the ActionlistPicker is generated one such function.
*/

    function AddActionToPlayer(){
    /*
    This function adds an action to a player list
    */
                             // This value will uniquely represent the action in the ActionList.
                             // If IsAdded is true, then it will be created, if it is false the value in ActionIden will 
                             // be used.
    var Identification = Identification = String(currentEditPlayerID)+String(PlayerConfigDict[currentEditPlayerID]["NextActionID"]);;
                             // If the action is added (and not repopulated), we create an entirely new 
                             // entry for it in the actionlist of the player.
    if (IsAdded) {

                             // First check if player has reached action limit
        //if (PlayerConfigDict[currentEditPlayerID]["ActionList"].length>=120){alert("Action limit reached. Cannot add more than 120 actions per player.");return;}
                                // Giving new ActionIdentification since action we are adding
        
        //PlayerConfigDict[currentEditPlayerID]["NextActionID"]++;
                                // Action is the action's name
                                // ActionID is a unique value for the action in the actionlist of the player (it is a concatenation of the player's ID and the NextactionID value of the player)
                                // Index in list corresponds to the index of the action in the action list of the player.
                                // target is the target ID if there is any. -1 represents the enemy.
        ActionDict = {
        "Action" : ActionID,
        "ActionID" : Identification, 
        "IndexInList" : PlayerConfigDict[currentEditPlayerID]["NextActionIndex"],
        "target" :  -1
        };
                                // If the action is waitability, we ask for a duration for it.
        if (ActionID == "wait_ability"){
            //a
            (async () => {await prompt("Time Select", "Input the time in seconds.", { defaultText: "1" }).then(text => {
                if (text) {
                    console.log(text);
                    ActionDict["WaitTime"] = text;
                    if (validateWaitTime(ActionDict["WaitTime"])) 
                    {
                    alert("Invalid input for wait_ability. The action will not be added.");
                    return;
                    }
                    PlayerConfigDict[currentEditPlayerID]["ActionList"].push(ActionDict);
                    addActionToActionListViewer(ActionID,Identification, ActionDict, IsTargetted)
                    updateTimeEstimate(); // Only update here since we only want to update when adding a new action and not when repopulating.
                    // When repopulating the function updateTimeEstimate is called in 'LoadPlayerConfiguration'
                    return;
                } else {
                    return;
                }
            })})();
            return;
        }                    // If there is a player target, we ask for it
        if (IsTargetted){
                            // askTargetID uses async function so we don't have to worry
                            // about waiting or not.
            var TargetID = askTargetID();
            if (TargetID == -1){
                // The user aborted the action
                return;
            }

            if (validateTarget(TargetID))
            {
            alert("Invalid target input. The action will not be added.");
            return;
            }      
            ActionDict["target"] = TargetID;
            PlayerConfigDict[currentEditPlayerID]["ActionList"].push(ActionDict);
            addActionToActionListViewer(ActionID,Identification, ActionDict, IsTargetted)
            updateTimeEstimate(); // Only update here since we only want to update when adding a new action and not when repopulating.
            // When repopulating the function updateTimeEstimate is called in 'LoadPlayerConfiguration'
            return;
        }
        PlayerConfigDict[currentEditPlayerID]["ActionList"].push(ActionDict);
        updateTimeEstimate(); // Only update here since we only want to update when adding a new action and not when repopulating.
        // When repopulating the function updateTimeEstimate is called in 'LoadPlayerConfiguration'
    }
    else {
                             // Repopulating the ActionListViewer. So the Identification is simply the one given
        
        Identification = ActionIden;
                             // Finding the action dictionnary
        for (let i = 0;i<PlayerConfigDict[currentEditPlayerID]["ActionList"].length;i++){
            if (PlayerConfigDict[currentEditPlayerID]["ActionList"][i]["ActionID"] == Identification){
                ActionDict = PlayerConfigDict[currentEditPlayerID]["ActionList"][i];
            }
        }
    }
    // Get the ActionListViewer to add the div and adding to action list.
    addActionToActionListViewer(ActionID,Identification, ActionDict, IsTargetted,isNew=IsAdded)
    }
return AddActionToPlayer;
}

/*
UPDATE FUNCTIONS
*/

function updateTimeEstimate(reset = false){
    // If reset is set to true, this function only resets the timer at 0 (visually only)
    if (reset){
        document.getElementById("timeStampEstimate").innerHTML = "0.00";
        document.getElementById("gcdTimerEstimate").innerHTML = "0.00";
        document.getElementById("dotTimerEstimate").innerHTML = "0.00";
        document.getElementById("buffTimerEstimate").innerHTML = "0.00";
        return;
    }
    // This function asks the server to compute a time estimate for the currently edited player.
    // This function also displays them on the appropriate id.
    
    var xhr5 = new XMLHttpRequest();
    var url = "/simulate/SimulationInput/";
    xhr5.open("GETESTIMATE", url, true);
    xhr5.setRequestHeader("Content-type", "application/json");
    xhr5.onreadystatechange = function() {
                                // When the request has been processed, the user is sent to the SimulationResult page. If there was an error the user is notified and we return.
    if (xhr5.readyState == XMLHttpRequest.DONE && xhr5.status == 200) {
        var strRes = xhr5.responseText.replaceAll("'",'"');
        var res = JSON.parse(strRes);
        document.getElementById("timeStampEstimate").innerHTML = String(res['currentTimeStamp']);
        document.getElementById("gcdTimerEstimate").innerHTML = String(res['untilNextGCD']);
        document.getElementById("dotTimerEstimate").innerHTML = String(res['dotTimer']);
        document.getElementById("buffTimerEstimate").innerHTML = String(res['buffTimer']);
        return;
    }
    }
                                // Exports current fight data for the player being edited
    var dataDict = exportPlayerConfigDict(updateTime = true);
                                // Sends the request.
    var data = JSON.stringify(dataDict);
    xhr5.send(data);
}

function UpdatePlayerConfigurationEdit(NewValue){
/*
This function updates the inputs in the player configuration division.
NewValue = true means we are disabling, and NewValue = false means we are enabling them.
*/
                                // Warning the player that they must add 1 player at least if NewValue is true.
return;
//if (NewValue == "true"){     
if (false){        
    // Was having issues here with weird moment where it would lock. For now Ill leave it unlocked all time.              
    document.getElementById("PlayerIDField").innerHTML = "You must add at least one player to edit those fields.";
    document.getElementById("PlayerIDField").style = "color:red;";
                                // If there are no players, we lock the edit of the
                                // Player Configuration division and inform the user
                                // that they must add 1 player to be able to edit.
                                // Disable the inputs
    document.getElementById("MainStat").setAttribute("readonly", "true");
    document.getElementById("Crit").setAttribute("readonly", "true");
    document.getElementById("DH").setAttribute("readonly", "true");
    document.getElementById("WD").setAttribute("readonly", "true");
    document.getElementById("SkS").setAttribute("readonly", "true");
    document.getElementById("SpS").setAttribute("readonly", "true");
    document.getElementById("Ten").setAttribute("readonly", "true");
    document.getElementById("weaponDelay").setAttribute("readonly", "true");
    document.getElementById("etroURL").setAttribute("readonly", "true");
    document.getElementById("PlayerName").setAttribute("readonly", "true");
    }
else if(NewValue == "false"){
    document.getElementById("PlayerIDField").style = "";
    document.getElementById("MainStat").removeAttribute("readonly");
    document.getElementById("Crit").removeAttribute("readonly");
    document.getElementById("DH").removeAttribute("readonly");
    document.getElementById("WD").removeAttribute("readonly");
    document.getElementById("SkS").removeAttribute("readonly");
    document.getElementById("SpS").removeAttribute("readonly");
    document.getElementById("Ten").removeAttribute("readonly");
    document.getElementById("weaponDelay").removeAttribute("readonly");
    document.getElementById("etroURL").removeAttribute("readonly");
    document.getElementById("PlayerName").removeAttribute("readonly");
}
}
function UpdateRequirement(){RequirementOn=document.getElementById("RequirementOnCheckBox").checked;}
function UpdateManaCheck(){IgnoreMana=!IgnoreMana;}
function UpdateDebugMode(){DebugMode=!DebugMode;}
function UpdateTeamCompBonus(){TeamCompBonus=!TeamCompBonus;}
function UpdateMaxPotencyPlentifulHarvest(){MaxPotencyPlentifulHarvest=!MaxPotencyPlentifulHarvest;}
function UpdateResultNewTab(){
    ResultNewTab=!ResultNewTab;
    if (ResultNewTab)
        document.getElementById("NewTabAlert").innerHTML= "The simulation's result will open in a new tab so make sure your browser is not blocking it";
    else
    document.getElementById("NewTabAlert").innerHTML= "Careful! You will loose the Simulation's input when simulating if you do not open in a new tab!"; // Wiping
}
function UpdateName(){
    /*
    This function is called when a Player's name is updated in order to also update the name in the Roster Viewer.
    */
    document.getElementById('Player'+currentEditPlayerID+'Name').innerHTML = document.getElementById("PlayerName").value + " ID - " + currentEditPlayerID;
    }
function UpdateNumberPlayerDisplay(){
    document.getElementById("player_counter").innerHTML = String(NumberOfPlayer);
}
/*
HTTP REQUEST RELATED FUNCTIONS
*/
function Submit(){
    /* 
    This function is called when Submitting a SimulationInput. It will make sure it is valid 
    and will put the information in a suitable way for the library to use it.
    */

    if (NumberOfPlayer == 0){
        alert("The simulation must have at least one player!");return;
    }

    if (InQueue){
        var UserInput = confirm("Your simulation is in queue. Are you sure you want to leave the queue?");
        if (UserInput){
            InQueue = false;
            document.getElementById("ProcessingDiv").setAttribute("hidden", "true");
            document.getElementById("ButtonText").innerHTML = "Simulate"
            return;
        }
        else{return;}
    }

                                 // We check if there is at least one player. If not we exit and alert the user.
    //if (! AtLeastOnePlayer){alert("The simulation needs at least one player.");return;}
    //var FightDuration = document.getElementById("FightDuration").value;
    //if (FightDuration <= 0 || FightDuration > 150){alert("The fight's duration must be between 0 and 150 secconds.");return;}

                                 // We save the currently edited player's input.
    var dataDict = exportPlayerConfigDict();
                                 // POST request Logic
    xhr = new XMLHttpRequest();
    var url = "/simulate/SimulationInput/";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function() {
                                 // When the request has been processed, the user is sent to the SimulationResult page. If there was an error the user is notified and we return.
    if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200 && InQueue) {
            createWindow(1100,1000,'http://127.0.0.1:8000/simulate/simulationLoading/');
            InQueue = false;
            document.getElementById("ProcessingDiv").setAttribute("hidden", "true");
            document.getElementById("ButtonText").innerHTML = "Simulate"
            return;
    }
    }
                                 // Sends the request.
    var data = JSON.stringify(dataDict);
    InQueue = true;
    document.getElementById("ButtonText").innerHTML = "Leave Queue"
    xhr.send(data);
    document.getElementById("ProcessingDiv").removeAttribute("hidden"); 
    //window.location.href = '/simulate/WaitingQueue/';
    }

/*
HELPER FUNCTIONS
*/

function downloadSimulationRecord(){
    const {dialog} = require("@electron/remote");
    xhr = new XMLHttpRequest();
    var url = "http://127.0.0.1:8000/simulate/SimulationResult/";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    var file = dialog.showSaveDialogSync();
    xhr.send(file + ".pdf");
}

function exportPlayerConfigDict(updateTime = false){
    // if updateTimeEstimate is set to true this function will only return the fight's info of the currently loaded player
    // since we only want this one in the time estimate.
    if (!updateTime){SavePlayerConfiguration(currentEditPlayerID);}
    
                                 // This dict represents the fight's parameter's value selected by the user.
    var FightInfo = {
        "RequirementOn": RequirementOn,
        "IgnoreMana": IgnoreMana,
        "fightDuration" : document.getElementById("FightDuration").value
    }
    
                                 // This dict will hold a list of all players.
    var PlayerList = []
                                 // We will go through every player currently inputted and add them to PlayerList
    for (let key in PlayerConfigDict){

                                 // If only want to update time estimate then we skip all those that aren't the presently edited player.
        if (updateTime && PlayerConfigDict[key]["PlayerID"] != currentEditPlayerID){continue;}

        PlayerDict = PlayerConfigDict[key];
                                 // Validating the values of the stats
        for (let i in PlayerDict["Stat"]){
            if(!onlyNumbers(PlayerDict["Stat"][i])){
                alert("Invalid stat "+ i +" for player"+ PlayerDict["PlayerName"]);
                return;
            }
        }
        var actionList = [];
    
        for (let i in PlayerDict["ActionList"]){
            var action = PlayerDict["ActionList"][i];
            if (action["Action"] == 'wait_ability'){
                var nextAction = {
                    "actionName" : "WaitAbility",
                    "waitTime" : action["WaitTime"]
                };
            } else {
                var nextAction = {
                    "actionName" : action["Action"],
                }
            }
    
            if (action["target"] != -1){
                // Of only for time update we only take the player of interest. To remove any
                // issue due to targetted players not being there we make the player always target itself
                if (updateTime){nextAction["targetID"] = PlayerDict["PlayerID"];}
                else{nextAction["targetID"] = action["target"];}
                }
            actionList.push(nextAction);
        }
                                     // We make sure that every player has at least one action. If not, we return and alert the user.
        //if (actionList.length == 0){alert("Every player must have at least one action. Currently the player " + PlayerDict["PlayerName"] + " has no actions.");return;}
    
                                     // PlayerConfig is a dictionnary that parses the data in a way that the library can use.
        var PlayerConfig = {
            "JobName" : PlayerDict["Job"],
            "PlayerName" : PlayerDict["PlayerName"],
            "playerID" : key,
            "weaponDelay" : PlayerDict["weaponDelay"],
            "stat" : PlayerDict["Stat"],
            "actionList" : actionList,
            "etro_gearset_url" : "",//PlayerDict["etro_gearset_url"], -> Keeping it empty for now.
            "Auras": []
        }
        PlayerList.push(PlayerConfig);
    
    }
                                 // dataDict is what will be sent in the POST request.
    var dataDict = {
        "data" : {
            "fightInfo" : FightInfo,
            "PlayerList" : PlayerList
        },
        "mode" : DebugMode,
        "TeamCompBonus" : TeamCompBonus,
        "MaxPotencyPlentifulHarvest" : MaxPotencyPlentifulHarvest,
        "nRandomIterations" : parseInt(document.getElementById("nRandomIterations").value)
    };
    return dataDict
}

function ActionViewerDocTitle(Action, IsTargetted){
    return Action["Action"] + (IsTargetted ? " targetID : " + Action["target"] : "") + (Action["Action"] == "wait_ability" ? " time : " + Action["WaitTime"] : "")
}

function onlyFloat(str) {
	return /^\d*[.]\d*$/.test(str);
}

function onlyNumbers(str) {
	return /^\d*$/.test(str);
}

function getFormatActionName(str){
    var nameParsedArray = []
    var currSubString = ""
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) == str.charAt(i).toUpperCase() && (str.length - i ) > 3 && str.charAt(i) != "_"){
                             // We will check if the next work is "The" in which case we will just add a space.
            var x = str.substring(i,i+2);
            nameParsedArray.push(currSubString);
            currSubString = str.charAt(i);
        } else{
            currSubString+=str.charAt(i);
        }
      }
    nameParsedArray.push(currSubString);
    var innerHTML = '<div class="topOfEachOther"><p>'
    for (var i = 0; i < nameParsedArray.length; i++){
        word = nameParsedArray[i];
        innerHTML += " " + word;
    }
    innerHTML += "</p></div>";
    return innerHTML;
}

function ValidPlayerID(id){
    for (let i = 0; i< PlayerConfigDict["PlayerList"].length;i++){
        if (PlayerConfigDict["PlayerList"][i]["PlayerID"] == String(id)){return true;}
    }
    return false;
}

function updatePlayerActionListViewerAfterDeletion(ActionID, ActionList, action){
    // Adjust the IndexInList of the other actions.
    for(let i = action["IndexInList"]+1;i<ActionList.length;i++){
        ActionList[i]["IndexInList"]--;
    }
                            // Removes the division from the viewer
    document.getElementById(ActionID).remove();
                            // Remove the action from the player's actionlist
    PlayerConfigDict[currentEditPlayerID]["ActionList"].splice(action["IndexInList"],1);
    PlayerConfigDict[currentEditPlayerID]["NextActionIndex"]--;
};

function askTargetID(update=false,ignoreSelf=true){
    // This functions makes a dialog asking for a target.
    // update=false means we are selecting a target for a newly added action.
    // update=true means we are attempting to change the target.
    // This only affects the displayed text
    // ignoreSelf=True means we are ignoring the currentEditPlayer

    // Will generate all buttons
    const buttonArray = []
    const buttonToID = new Object(); // This dict is a correspondance from button selected to player ID
    var buttonIDCounter = 0;//Counter
    for (let key in PlayerConfigDict){
                // Only add if not the current player (if ignoreSelf is true)
        if (ignoreSelf && key != currentEditPlayerID){
            buttonArray.push(PlayerConfigDict[key]["PlayerName"] + " - ID " + PlayerConfigDict[key]["PlayerID"]);
            buttonToID[buttonIDCounter] = key; // Maps a button to a PlayerID
            buttonIDCounter++;
        }
    }

    if (! update) {
        var dialogTitle = "Target";
        var dialogText = "Select a target from the option(s) below.";
    }
    else 
    {
        var dialogTitle = "New target?";
        var dialogText = "Select a new target from the option(s) below or confirm the removal of that action.";
                             // Adding option to confirm the removal.
        buttonArray.push("Confirm the removal");
        buttonToID[buttonIDCounter+1] = null;
    }


    var buttonID = dialog.showMessageBoxSync({
        message : dialogText,
        type : 'question',
        title : dialogTitle,
        buttons : buttonArray,
        cancelId : -1
    });
    console.log("Selected : " + buttonID + " -> " + buttonToID[buttonID]);
    if (buttonToID[buttonID] == null) return null;
    return parseInt(buttonToID[buttonID]);
    //return buttonToID[buttonID];
}
function addActionToActionListViewer(ActionID,Identification, ActionDict, IsTargetted,isNew=true){
    // Check if player actions is above base limit of 232 = 29*8
    //if (PlayerConfigDict[currentEditPlayerID]["ActionList"].length>=1){
        // If above we must add a new line
    //    document.getElementById("PlayerActionListViewer").style="grid-template-rows: repeat(9, 50px);"
    //}

    // Get the ActionListViewer to add the div.
    const ActionListViewer = document.getElementById("PlayerActionListViewer");
    PlayerJob = PlayerConfigDict[currentEditPlayerID]["Job"];
                                // Adding the new division in the ActionListViewer
    const newAction = document.createElement('div');
    newAction.setAttribute("title", ActionViewerDocTitle(ActionDict, IsTargetted));
    newAction.innerHTML = '<img src="/static/simulate/PVEIcons/'+PlayerJob+'/'+ActionID+'.png" width="40px" height="40px" class="Icon">';
    newAction.onclick = DelActionFromList(Identification);
    newAction.setAttribute("id", Identification);
    ActionListViewer.appendChild(newAction);
                                // Incrementing the ID and index
    PlayerConfigDict[currentEditPlayerID]["NextActionIndex"]++;
    if (isNew){PlayerConfigDict[currentEditPlayerID]["NextActionID"]++;}
    
}
/*
USER INPUT FUNCTIONS
*/

/*
LOADING DATA INTO VIEWER FUNCTIONS OR SAVING DATA
*/
function LoadPlayerActionsPick(ChangingJob){
/*
This function Load a player's action's on the ActionPick viewer
*/
                                // Wiping the action pick viewer from previous player.
document.getElementById("ActionListPick").innerHTML = "";

PlayerConfigDict[currentEditPlayerID]["Job"] = document.getElementById("Job").value;
var PlayerJob = PlayerConfigDict[currentEditPlayerID]["Job"];
                                // If the loading is from the action of changing the player's job, we also wipe the 
                                // actionlist of the player and the actionlist viewer.
if (ChangingJob){
    PlayerConfigDict[currentEditPlayerID]['ActionList'] = [];
    PlayerConfigDict[currentEditPlayerID]['NextActionIndex'] = 0;
    PlayerConfigDict[currentEditPlayerID]['NextActionID'] = 0;
    document.getElementById("PlayerActionListViewer").innerHTML = "";
}

var IconNameList = IconDict[PlayerJob];
const box = document.getElementById("ActionListPick");

                                // Will now Populate the ActionPicker
for (var i = 0;i<IconNameList.length;i++){
    const newBox = document.createElement("div");
    newBox.setAttribute("class", "ActionPicker");
    newBox.innerHTML = '<img src="/static/simulate/PVEIcons/'+PlayerJob+'/'+IconNameList[i]+'.png" title="'+IconNameList[i]+'" width="60px" height="60px" class="Icon" role="button">'+getFormatActionName(IconNameList[i]);
    newBox.onclick = CreateAddAction(IconNameList[i] /*ActionID*/, TargetActionList.includes(IconNameList[i]) /*IsTargetted*/, true /*IsAdded*/, -1 /*ActionIden*/);
    box.appendChild(newBox);
    }
    }
function LoadPlayerConfiguration(PlayerID, save=true){
/*
This function loads a player's data in the Player Configuration and ActionListViewer division.
*/
                                // If we want to save the currentEditPlayer's configuration, save=true (by default)
if (save){SavePlayerConfiguration(currentEditPlayerID);}
updateTimeEstimate(reset = true); // Reseting timer estimate viewer

                                // This puts a white border around the player we want to edit.
const box = document.getElementById('Player'+currentEditPlayerID+'Name');
box.innerHTML = PlayerConfigDict[currentEditPlayerID]["PlayerName"] + " ID - "+currentEditPlayerID;
document.getElementById("Edit"+PlayerID).setAttribute("style","background-color: #333;border-radius: 5px;border: 3px solid white;");
                                // If a new player was created and there was no previous players, then currentEditPlayerID == PlayerID. So we skip this part.
if (PlayerID != currentEditPlayerID){document.getElementById("Edit"+currentEditPlayerID).setAttribute("style","background-color: #333;border-radius: 5px;border: 1px solid #333;");}
                                // Changing the currentEditPlayerID value.
currentEditPlayerID = PlayerID;
                                // We put back all the saved value of the player we want to edit.
document.getElementById("PlayerName").value = PlayerConfigDict[PlayerID]["PlayerName"];
document.getElementById("Job").value = PlayerConfigDict[PlayerID]["Job"];
document.getElementById("MainStat").value = PlayerConfigDict[PlayerID]["Stat"]["MainStat"];
document.getElementById("Crit").value = PlayerConfigDict[PlayerID]["Stat"]["Crit"];
document.getElementById("DH").value = PlayerConfigDict[PlayerID]["Stat"]["DH"];
document.getElementById("WD").value = PlayerConfigDict[PlayerID]["Stat"]["WD"];
document.getElementById("SkS").value = PlayerConfigDict[PlayerID]["Stat"]["SkS"];
document.getElementById("SpS").value = PlayerConfigDict[PlayerID]["Stat"]["SS"];
document.getElementById("Det").value = PlayerConfigDict[PlayerID]["Stat"]["Det"];
document.getElementById("Ten").value = PlayerConfigDict[PlayerID]["Stat"]["Ten"];
document.getElementById("weaponDelay").value = PlayerConfigDict[PlayerID]["weaponDelay"];
document.getElementById("etroURL").value = PlayerConfigDict[PlayerID]["etro_gearset_url"];
document.getElementById("PlayerIDField").innerHTML = "PlayerID : " + PlayerConfigDict[currentEditPlayerID]["PlayerID"];
                                // We wipe the ActionList and ActionlistViewer and the NextActionID. 
                                // These will be refilled in LoadPlayerActionsPick and LoadPlayerActionList
document.getElementById("ActionListPick").innerHTML = "";
document.getElementById("PlayerActionListViewer").innerHTML = "";
//PlayerConfigDict[currentEditPlayerID]["NextActionID"] = 0;
PlayerConfigDict[currentEditPlayerID]["NextActionIndex"] = 0;

LoadPlayerActionsPick(false /* ChangingJob */);
LoadPlayerActionList();
updateTimeEstimate(); // Update time estimate
    }
function LoadPlayerActionList(){
/*
This function loads all a player's action in the ActionListViewer.
*/
var ActionList = PlayerConfigDict[currentEditPlayerID]["ActionList"];

for (let i = 0;i<ActionList.length;i++){
    var Action = ActionList[i]
    CreateAddAction(Action["Action"] /*ActionID*/, Action["target"]!= -1 /*IsTargetted*/, false /*IsAdded*/, Action["ActionID"]/*ActionIdentification*/)();
}
}
function SavePlayerConfiguration(PlayerID){
/*
This function saves a player configuration to the PlayerConfigDict
*/
PlayerConfigDict[PlayerID]["PlayerName"] = document.getElementById("PlayerName").value;
PlayerConfigDict[PlayerID]["Job"] = document.getElementById("Job").value;
PlayerConfigDict[PlayerID]["Stat"]["MainStat"] = document.getElementById("MainStat").value;
PlayerConfigDict[PlayerID]["Stat"]["Crit"] = document.getElementById("Crit").value;
PlayerConfigDict[PlayerID]["Stat"]["DH"] = document.getElementById("DH").value;
PlayerConfigDict[PlayerID]["Stat"]["WD"] = document.getElementById("WD").value;
PlayerConfigDict[PlayerID]["Stat"]["SkS"] = document.getElementById("SkS").value;
PlayerConfigDict[PlayerID]["Stat"]["SS"] = document.getElementById("SpS").value;
PlayerConfigDict[PlayerID]["Stat"]["Det"] = document.getElementById("Det").value;
PlayerConfigDict[PlayerID]["Stat"]["Ten"] = document.getElementById("Ten").value;
PlayerConfigDict[PlayerID]["weaponDelay"] = document.getElementById("weaponDelay").value;
PlayerConfigDict[PlayerID]["etro_gearset_url"] = document.getElementById("etroURL").value;
    }

// Main menu function

function openSimulation(){
    createWindow(2000,1500,'http://127.0.0.1:8000/simulate/SimulationInput/')
}

function openSolver(){
    createWindow(700,1000,'http://127.0.0.1:8000/simulate/bisRotationSolver/')
}

/*
OPENING WINDOW FUNCTIONS
*/

function seeJSONFileViewer(){
    createWindow(1000,1000,'http://127.0.0.1:8000/simulate/JSONFileViewer/')
}

function getHelp(){
    createWindow(1000,1000,'http://127.0.0.1:8000/simulate/help/')
}

/*
CODE TO EXECUTE WHEN OPENING SimulationInput
*/
window.onload = function (){UpdatePlayerConfigurationEdit("true");}
/*
END
*/