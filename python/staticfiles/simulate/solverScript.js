/* 
GLOBAL VARIABLE DECLARATION
*/                             
                             // This holds the currently loaded fight
                             // This is not the same format as in input
                             // and is exactly as it would be saved.
var PlayerConfigDict = new Object();   
                             // playerOptIndex is the index in the fight's player list of the player
                             // we want to find a BiS on.
var gearSpaceDict = new Object();
                             // This contains the gearSpace dictionary 
var foodSearchSpace = [];
var fullFoodSearchSpace = ["Honeyed Dragonfruit (DH/Det)", "Dragonfruit Blend (SkS/DH)", "Baba Ghanoush (Crit/SkS)", "Baked Eggplant (Det/Crit)",
                           "Caviar Sandwich (SpS/DH)", "Caviar Canapes (Crit/SpS)", "Marinated Broccoflower (Ten/Det)", "Broccoflower Stew (Det/Ten)"];
                             // Empty list that will hold the name of the food to use
var playerOptIndex = 0;
var selectedPlayerJob = ""

var useCritMat = true;
var useDHMat = true;
var useDetMat = true;
var useTenMat = false;
var useSpS = false; // This value will be set automatically one a player is chosen according to its job.
                    // It can still be edited by the user for whatever reason they might have.
var swapDHDetBeforeSpeed = true;

var minSPDValue = 0; // SPD range
var maxSPDValue = 4000;

var minPietyValue = 0;

/* 
GLOBAL VARIABLE DECLARATION END
*/     

var fs = require('fs');
const {app, BrowserWindow,dialog} = require("@electron/remote");

/* 
Boolean variable update functions
*/     

function updateUseCritMat(){useCritMat=!useCritMat;}
function updateUseDHMat(){useDHMat=!useDHMat;}
function updateUseDetMat(){useDetMat=!useDetMat;}
function updateUseTenMat(){useTenMat=!useTenMat;}
function updateUseSpS(){useSpS=!useSpS;}
function updateSwapDHDetBeforeSpeed(){swapDHDetBeforeSpeed=!swapDHDetBeforeSpeed;}

function updateMinPiety(){minPietyValue=document.getElementById("minPietVal").value;};
function updateMinSPD(){minSPDValue=document.getElementById("minSPDValue").value;updateGCDTimerViewer(false);}
function updateMaxSPD(){maxSPDValue=document.getElementById("maxSPDValue").value;updateGCDTimerViewer(true);};

/* 
Boolean variable update functions END
*/     

/*
Opening window
*/

function createWindow(width, height,url) {
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

function getHelp(){
    createWindow(1000,1000,"http://127.0.0.1:8000/simulate/helpSolver/");
}

function openPremadeGearSpace(){
    require('electron').shell.openExternal("https://github.com/IAmPythagoras/gearSearchSpace");   
}

/* 
Computing values functions
*/     

function getGCDTimer(spdValue){

    var reduction = (1000 - Math.floor(130 * (spdValue - 400) / 1900))/1000;
    var haste = 0;

    switch (selectedPlayerJob){
        case "BlackMage" : haste = 15;
        break;
        case "WhiteMage" : haste = 20;
        break;
        case "Samurai" : haste = 13;
        break;
        case "Monk" : haste = 20;
        break;
        case "Bard" : haste = 20;
        break;
        case "Astrologian" : haste = 10;
        break;
        case "Ninja" : haste = 15;
        break;
    }
    return [computeGCDTimer(reduction, 0), computeGCDTimer(reduction, haste)];
}

function computeGCDTimer(reduction, haste){
    return (
        Math.floor(
            Math.floor(
                Math.floor(
                    2500 * reduction
                ) * (100-haste)/100
            )/10
        )/100
    )
}

/* 
Computing values functions END
*/     


/* 
UI related function and user input related functions
*/ 

function setSpSCheckbox(checked){
    if(checked){
        document.getElementById("spdTypeSelector").innerHTML = '<input type="checkbox" id="SpSCheckbox" onchange="updateUseSpS()" checked>';
    } else{
        document.getElementById("spdTypeSelector").innerHTML = '<input type="checkbox" id="SpSCheckbox" onchange="updateUseSpS()">';
    }
}

function resetSPDRange(){
    document.getElementById("minSPDValue").value = 400;
    document.getElementById("maxSPDValue").value = 4000;
    editSPDField(false);
    updateGCDTimerViewer(false);
    updateGCDTimerViewer(true);
}

function resetPlayerOpt(){
    playerOptIndex = 0;
    selectedPlayerJob = "";
    document.getElementById("selectedPlayerDiv").innerHTML = "";
}

function resetGearSpace(){
    document.getElementById("gearSpaceFileDiv").innerHTML = "";
    document.getElementById("editCreateButton").innerHTML = "Create";
    gearSpaceDict = new Object();
}

function updateGCDTimerViewer(max){
    if (max){
        var gcdTimer = getGCDTimer(document.getElementById("maxSPDValue").value);

        if (gcdTimer[0] == gcdTimer[1]){document.getElementById("maxGCDTimerViewer").innerHTML = "<p class='underText'>GCD timer : " + gcdTimer[0] + "</p>";}
        else {document.getElementById("maxGCDTimerViewer").innerHTML = "<p class='underText'>GCD timer : " + gcdTimer[0] + " / GCD timer (haste) : " + gcdTimer[1]+ "</p>";}
    } else{
        var gcdTimer = getGCDTimer(document.getElementById("minSPDValue").value);

        if (gcdTimer[0] == gcdTimer[1]){document.getElementById("minGCDTimerViewer").innerHTML = "<p class='underText'>GCD timer : " + gcdTimer[0]+ "</p>";}
        else {document.getElementById("minGCDTimerViewer").innerHTML = "<p class='underText'>GCD timer : " + gcdTimer[0] + " / GCD timer (haste) : " + gcdTimer[1]+ "</p>";}
    }
    return;
}

function resetPlayerSensibleInput(){
    setSpSCheckbox(false);
    resetPlayerOpt();
    document.getElementById("pietyRangeSelection").innerHTML = ""; // Removing piety selection
    resetGearSpace();
    resetSPDRange();
}



function importFightLayout(){

    if (Object.keys(PlayerConfigDict).length !== 0){
        // Window currently has possibly unsaved data. Confirms the user's choice
        var uInput = dialog.showMessageBoxSync({
            title: "Confirm choice",
            message: "Importing a new fight layout will reset some of the current input. Do you want to continue?",
            buttons: ["Yes", "No"],
            cancelId: 1
        });
        if (uInput == 1) return; // Abort
    }


    var fileName = dialog.showOpenDialogSync();
    if (fileName == undefined) return;
        // Reseting stuff once confirmation we do not abort.
    PlayerConfigDict = new Object();
    resetPlayerSensibleInput();

    fs.readFile(fileName[0], 'utf-8', (err, data) => {
        if(err){
            alert("An error ocurred reading the file :" + err.message);
            return;
        }
        try{
            PlayerConfigDict = JSON.parse(data)["data"];

                             // Makes sure all players have a name.
            for (let i = 0; i < PlayerConfigDict["PlayerList"].length;i++){
                var player = PlayerConfigDict["PlayerList"][i];
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
                PlayerConfigDict["PlayerList"][i]["PlayerName"] = playerName;
            }
        }
        document.getElementById("loadedFileDiv").innerHTML = '<p>Loaded file : </p><p class="underText">' + fileName[0] + '</p>';
        }    
        catch(err){
            alert("There was an error when reading the file:" + err.message)
            return;
        }

    });
}

function selectPlayerToOptOn(){

    if (Object.keys(PlayerConfigDict).length === 0){
        alert("There is no fight layout currently loaded");return;
    }

    if (PlayerConfigDict["PlayerList"].length == 0){
        alert("There is no player to select in the currently loaded fight layout.");return;
    }

    const buttonArray = []
    for (let i = 0;i<PlayerConfigDict["PlayerList"].length;i++){
        buttonArray.push(PlayerConfigDict["PlayerList"][i]["PlayerName"] + " - ID " + PlayerConfigDict["PlayerList"][i]["playerID"]);
    }

    var dialogTitle = "Select a player";
    var dialogText = "Select a player to optimize on";

    var buttonID = dialog.showMessageBoxSync({
        message : dialogText,
        type : 'question',
        title : dialogTitle,
        buttons : buttonArray,
        cancelId : -1
    });

    if (buttonID == -1) return;//aborted

    playerOptIndex = buttonID;
    selectedPlayerJob = PlayerConfigDict["PlayerList"][buttonID]["JobName"];
    document.getElementById("selectedPlayerDiv").innerHTML = '<p>Currently selected player : </p><p class="underText">' + buttonArray[buttonID] + ' (' + PlayerConfigDict["PlayerList"][buttonID]["JobName"] + ')</p>';

    // If player is a healer will add Piety selection field

    if (selectedPlayerJob == "WhiteMage" || selectedPlayerJob == "Scholar"  || selectedPlayerJob == "Sage" || selectedPlayerJob == "Astrologian" ){
        document.getElementById("pietyRangeSelection").innerHTML = ('<p>Other solver parameters </p>'
                                                +'<p class="underText">Minimum piety amount :</p>'
                                                +'<input id="minPietVal" type="number" maxlength="4" value="390">');
    } else{ // else remove or leave empty
        document.getElementById("pietyRangeSelection").innerHTML = "";
    }   
        // Check job to set the spd selection
    if (selectedPlayerJob == "WhiteMage" ||
        selectedPlayerJob == "Scholar" || 
        selectedPlayerJob == "Astrologian" ||
        selectedPlayerJob == "Sage" ||
        selectedPlayerJob == "BlackMage" ||
        selectedPlayerJob == "Summoner" ||
        selectedPlayerJob == "RedMage"){
            setSpSCheckbox(true);
            useSpS = true;
        } else{
            setSpSCheckbox(false);
            useSpS = false;
        }
    editSPDField(true);
    // Putting GCD timer
    updateGCDTimerViewer(false);
    updateGCDTimerViewer(true);
}

function importGearSpace(){

    var fileName = dialog.showOpenDialogSync();
    if (fileName == undefined) return;

    fs.readFile(fileName[0], 'utf-8', (err, data) => {
        if(err){
            alert("An error ocurred reading the file :" + err.message);
            return;
        }
        try{
            gearSpaceDict = JSON.parse(data);
        }    
        catch(err){
            alert("There was an error when reading the file:" + err.message)
            return;
        }
    });
    document.getElementById("gearSpaceFileDiv").innerHTML = '<p>Loaded file : </p><p class="underText">' + fileName[0] + '</p><button class="basicButton bigbutton" onclick="createGearSpace(false)">Edit space</button>;<p class="underText">If you edit make sure to reimport the file to apply the change(s).</p>';
                                                            
}

function appendFood(){

    if (foodSearchSpace.length == fullFoodSearchSpace.length){
        alert("All the food has already been added.");return;
    }

    if (foodSearchSpace.length == 0){
        // If is empty and adding new food we remove error
        document.getElementById("foodSearchSpaceViewer").innerHTML = ""; // Clearing red text
    }

    const buttonArray = [];
                             // Since buttonID and the index in fullFoodSearchSpace will get disjointed
                             // we create a list that maps a button to an index. buttonIDToListIndex is that list
    const buttonIDToListIndex = [];
    for (let i = 0;i<fullFoodSearchSpace.length;i++){
        if (!(foodSearchSpace.includes(fullFoodSearchSpace[i]))){
        buttonArray.push(fullFoodSearchSpace[i]);
        buttonIDToListIndex.push(i);
        }
    }
    var dialogTitle = "Select food";
    var dialogText = "Select a food to add to the search space";

    var buttonID = dialog.showMessageBoxSync({
        message : dialogText,
        type : 'question',
        title : dialogTitle,
        buttons : buttonArray,
        cancelId : -1
    });

    if (buttonID == -1) return;//aborted

    foodSearchSpace.push(fullFoodSearchSpace[buttonIDToListIndex[buttonID]]);
    
    document.getElementById("foodSearchSpaceViewer").innerHTML += '<div id="'+fullFoodSearchSpace[buttonIDToListIndex[buttonID]]+'"><p class="underText">' + fullFoodSearchSpace[buttonIDToListIndex[buttonID]]+'</p></div>';
}

function removeFood(){

    if (foodSearchSpace.length == 0){
        alert("The food seach space is empty");return;
    }

    const buttonArray = [];
    for (let i = 0;i<foodSearchSpace.length;i++){
        buttonArray.push(foodSearchSpace[i]);
    }

    var dialogTitle = "Select food";
    var dialogText = "Select a food to remove from the search space";

    var buttonID = dialog.showMessageBoxSync({
        message : dialogText,
        type : 'question',
        title : dialogTitle,
        buttons : buttonArray,
        cancelId : -1
    });

    if (buttonID == -1) return;//aborted
                             // Removing at index buttonID
                             // and removing <div> that holds the food in text
    document.getElementById(foodSearchSpace[buttonID]).remove();
    foodSearchSpace.splice(buttonID, 1);

    // checking if now empty. In which case we add error text
    if (foodSearchSpace.length == 0){
        document.getElementById("foodSearchSpaceViewer").innerHTML = '<p style="color:red">Must have at least one food selected.</p>';
    }
}


/*
Code to execute on load
*/

function editSPDField(letEdit){
    // This function locks or unlocks the speed range selection until a player is selected.

    if (letEdit){
        document.getElementById("spdSelecWarning").innerHTML = "";
        document.getElementById("minSPDValue").removeAttribute("readonly");
        document.getElementById("maxSPDValue").removeAttribute("readonly");
        document.getElementById("SpSCheckbox").removeAttribute("readonly");
    } else{
        document.getElementById("spdSelecWarning").innerHTML = "Select a player to edit these fields.";
        document.getElementById("minSPDValue").setAttribute("readonly", "true");
        document.getElementById("maxSPDValue").setAttribute("readonly", "true");
        document.getElementById("SpSCheckbox").setAttribute("readonly", "true");
    }
}

/*
NEW WINDOW
*/

function createGearSpace(isCreate){

    // Sends the currently loaded file so the server puts it into the session
    // so we can transfer the data to createGearSearchSpace

    if (isCreate){
        createWindow(1000,1000,'http://127.0.0.1:8000/simulate/createGearSearchSpace/');
        return;
    }
    // If only creating new set only create window and then return;
    // Else we send current data to be put in session to be used in the new window.

    xhr = new XMLHttpRequest();
    var url = "http://127.0.0.1:8000/simulate/bisRotationSolver/";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function() {
                                 // When the request has been processed, the user is sent to the SimulationResult page. If there was an error the user is notified and we return.
    if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == "200") {
        createWindow(1000,1000,'http://127.0.0.1:8000/simulate/createGearSearchSpace/');
        return;
    }
    }



                                 // Sends the request.
    var data = JSON.stringify(gearSpaceDict);
    xhr.send(data);
}


/*
SUBMIT REQUEST
*/

function submit(){
    // This function sends the information to be written in the session.
    // It will then open a new window that is a loading screen. This window
    // will be the one to start the solver and it will then open a result window.



                             // generating matSpace and checking for valid number
    var matSpace = [];
    if (useCritMat) matSpace.push(0);
    if (useDHMat) matSpace.push(1);
    if (useDetMat) matSpace.push(2);
    if (useTenMat) matSpace.push(5);

    if (matSpace.length<3) {alert("You need to select at least 3 different types of materia.");return;}

    xhr = new XMLHttpRequest();
    var url = "http://127.0.0.1:8000/simulate/bisRotationSolver/";
    xhr.open("SUBMIT", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function() {
                                 // When the request has been processed, the user is sent to the SimulationResult page. If there was an error the user is notified and we return.
    if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == "200") {
        createWindow(1000,1000,'http://127.0.0.1:8000/simulate/solverLoading/');
        //return
    }
    }
                             // Sends the request.
    var data = {
        "fight" : {"data" : PlayerConfigDict},
        "gearSpace" : gearSpaceDict,
        "playerIndex" : playerOptIndex,
        "foodSpace" : foodSearchSpace,
        "matSpace" : matSpace,
        "minPiety" : minPietyValue,
        "minSPD" : minSPDValue,
        "maxSPD" : maxSPDValue,
        "useSS" : useSpS,
        "oversaturationPre":  document.getElementById("oversaturationIterationsPreGear").value,
        "oversaturationPost" : document.getElementById("oversaturationIterationsPostGear").value,
        "swapBefore" : swapDHDetBeforeSpeed
    }
    xhr.send(JSON.stringify(data));

    


}

/* 
EXECUTE ON LOAD
*/

window.onload = function (){editSPDField(false);updateGCDTimerViewer(false);updateGCDTimerViewer(true);}