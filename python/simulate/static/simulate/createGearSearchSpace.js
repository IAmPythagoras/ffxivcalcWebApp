/*
GLOBAL VAR DECLARATION
*/

var nextGearID = 0;
var indexToID = []
var gearSearchSpace = [];
                             // gearSearchSpace is a list that contains all the current gear in the search space.
                             // Every entry of the list is a dictionnary of the form
                             /*
                             {
                                "GearType" : 0,
                                "MateriaLimit" : 2,
                                "Name" : "Raid",
                                "WD" : 0,          }
                                "WeaponDelay" : 3, } -> If not a Weapon these are still present, but irrelevant.
                                "MainStat" : 0,
                                "Crit" : 0,
                                "DH" : 0,
                                "Det" : 0,
                                "SkS" : 0,
                                "SS" : 0,
                                "Piety" : 0,
                                "Ten"
                            }*/
/*
GLOBAL VAR DECLARATION END
*/

// IMPORT
var fs = require('fs');
const {app, BrowserWindow,dialog} = require("@electron/remote");

/*
FILE RELATED FUNCTIONS
*/

function saveGear(){
    // This function asks for file dir and saves gearSearchSpace as a json file.
    if (Object.keys(gearSearchSpace).length === 0){
        // Window currently has nothing. 
        var uInput = dialog.showMessageBoxSync({
            title: "Confirm choice",
            message: "This space has no data. Do you wish to continue?",
            buttons: ["Yes", "No"],
            cancelId: 1
        });
        if (uInput == 1) return; // Abort
    }

    var file = dialog.showSaveDialogSync();

    data = JSON.stringify(exportGearSearchSpace(), null, 4);

    fs.writeFile(file+".json", data, function (err) { 
        if (err) throw err; 
        console.log('Saved!'); 
    });
}

/*
ONCHANGE FUNCTION
*/

function changeGearType(index){
    var gearID = indexToID[index];
    var prevType =  gearSearchSpace[index]["GearType"];
    var nextType = document.getElementById(gearID+"type").value;;
    // Have to check if changes to weapon or from weapon. If yes we have to remove/add weapon dependant fields.

    if (prevType == "Weapon"){
        // Remove WD/WeaponDelay
        document.getElementById(gearID+'weaponField').innerHTML = "";
    } else if (nextType == "Weapon"){
        // Add WD/WeaponDelay
        document.getElementById(gearID+'weaponField').innerHTML = 
                    '<div class="container">'+
                        '<p class="underText">Weapon Damage :  </p>'+
                        '<input id="'+gearID+'WD"  onchange="changeWD('+index+')">'+
                    '</div>'+
                    '<div class="container">'+
                        '<p class="underText">Weapon Delay (s) :  </p>'+
                        '<input id="'+gearID+'WeaponDelay"  onchange="changeWD('+index+')">'+
                    '</div>';
        document.getElementById(gearID+'WD').value = gearSearchSpace[index]["WD"];
        document.getElementById(gearID+'WeaponDelay').value = gearSearchSpace[index]["WeaponDelay"];
    } // else do nothing and continue

    gearSearchSpace[index]["GearType"]=document.getElementById(gearID+"type").value;

}
function changeMateriaLimit(index){var gearID = indexToID[index];gearSearchSpace[index]["MateriaLimit"]=document.getElementById(gearID+"gearMatLimit").value;}
function changeName(index){var gearID = indexToID[index];gearSearchSpace[index]["Name"]=document.getElementById(gearID+"nameGear").value;}
function changeWD(index){var gearID = indexToID[index];gearSearchSpace[index]["WD"]=document.getElementById(gearID+"WD").value;}
function changeWeaponDelay(index){var gearID = indexToID[index];gearSearchSpace[index]["WeaponDelay"]=document.getElementById(gearID+"WeaponDelay").value;}
function changeMainStat(index){var gearID = indexToID[index];gearSearchSpace[index]["MainStat"]=document.getElementById(gearID+"Main").value;}
function changeCrit(index){var gearID = indexToID[index];gearSearchSpace[index]["Crit"]=document.getElementById(gearID+"Crit").value;}
function changeDH(index){var gearID = indexToID[index];gearSearchSpace[index]["DH"]=document.getElementById(gearID+"DH").value;}
function changeDet(index){var gearID = indexToID[index];gearSearchSpace[index]["Det"]=document.getElementById(gearID+"Det").value;}
function changeSkS(index){var gearID = indexToID[index];gearSearchSpace[index]["SkS"]=document.getElementById(gearID+"SkS").value;}
function changeSS(index){var gearID = indexToID[index];gearSearchSpace[index]["SS"]=document.getElementById(gearID+"SS").value;}
function changePiety(index){var gearID = indexToID[index];gearSearchSpace[index]["Piety"]=document.getElementById(gearID+"Piety").value;}
function changeTen(index){var gearID = indexToID[index];gearSearchSpace[index]["Ten"]=document.getElementById(gearID+"Ten").value;}

/*
ONCHANGE FUNCTION END
*/

/*
FUNCTION DECLERATION
*/

function generateGearViewer(gearID,gearIndex){
    var weaponField = "";

                             // This field is only added if the gear has type weapon
    if (gearSearchSpace[gearIndex]["GearType"] == "Weapon"){
        weaponField =  '<div class="container">'+
                                '<p class="underText">Weapon Damage :  </p>'+
                                '<input id="'+gearID+'WD"  onchange="changeWD('+gearIndex+')">'+
                            '</div>'+
                            '<div class="container">'+
                                '<p class="underText">Weapon Delay (s) :  </p>'+
                                '<input id="'+gearID+'WeaponDelay"  onchange="changeWeaponDelay('+gearIndex+')">'+
                            '</div>';
    }

    var newInnerHTML =  '<div id='+gearID+'>'+
        '<div class="container">'+
            '<p class="underText">Gear type : </p>'+
            '<select name="type" id="'+ gearID +'type" style="margin-right: 10px;margin-left: 10px;" onchange="changeGearType('+gearIndex+')" selected="Weapon">'+
                '<option value="Weapon">Weapon</option>'+
                '<option value="Head">Head</option>'+
                '<option value="Body">Body</option>'+
                '<option value="Hands">Hands</option>'+
                '<option value="Legs">Legs</option>'+
                '<option value="Feet">Feet</option>'+
                '<option value="Earrings">Earrings</option>'+
                '<option value="Necklace">Necklace</option>'+
                '<option value="Bracelets">Bracelets</option>'+
                '<option value="Left Ring">Left Ring</option>'+
                '<option value="Right Ring">Right Ring</option>'+
            '</select>'+
        '</div>'+
        '<div class="container">'+
            '<p class="underText">Materia limit : </p>'+
            '<input id="'+gearID+'gearMatLimit" value="2" maxlength="4" onchange="changeMateriaLimit('+gearIndex+')">'+
        '</div>'+
        '<div class="container">'+
            '<p class="underText">Name : </p>'+
            '<input id="'+gearID+'nameGear" onchange="changeName('+gearIndex+')">'+
        '</div>'+
        '<div>'+
            '<div id="'+gearID+'weaponField">'+ weaponField + 
            '</div>'+ // closes weaponField division
            '<div class="container">'+
                '<p class="underText">Main Stat :  </p>'+
                '<input id="'+gearID+'Main"  onchange="changeMainStat('+gearIndex+')">'+
            '</div>'+
            '<div class="container">'+
                '<p class="underText">Critical hit :  </p>'+
                '<input id="'+gearID+'Crit"  onchange="changeCrit('+gearIndex+')">'+
            '</div>'+
            '<div class="container">'+
                '<p class="underText">Direct Hit :  </p>'+
                '<input id="'+gearID+'DH"  onchange="changeDH('+gearIndex+')">'+
            '</div>'+
            '<div class="container">'+
                '<p class="underText">Determination :  </p>'+
                '<input id="'+gearID+'Det" onchange="changeDet('+gearIndex+')">'+
            '</div>'+  
        '</div>'+
        '<div class="container">'+
            '<p class="underText">Skill Speed :  </p>'+
            '<input id="'+gearID+'SkS"  onchange="changeSkS('+gearIndex+')">'+
        '</div>'+
        '<div class="container">'+
            '<p class="underText">Spell Speed :  </p>'+
            '<input id="'+gearID+'SS"  onchange="changeSS('+gearIndex+')">'+
        '</div>'+
        '<div class="container">'+
            '<p class="underText">Tenacity :  </p>'+
            '<input id="'+gearID+'Ten"  onchange="changeTen('+gearIndex+')">'+
        '</div>'+
        '<div class="container">'+
            '<p class="underText">Piety :  </p>'+
            '<input id="'+gearID+'Piety" onchange="changePiety('+gearIndex+')">'+
        '</div>'+
        '<button class="basicButton bigbutton" onclick="removeGear('+gearID+')">Remove</button>'+
        '<hr>'+
    '</div>';

    document.getElementById("gearViewer").innerHTML += newInnerHTML;

}

function populateGearViewer(){
    // This function populates the viewer with the information in gearSearchSpace
    for (let i = 0;i<gearSearchSpace.length;i++){
                // Setting up values
        var gearID = indexToID[i];
        var curGear = gearSearchSpace[i];
        document.getElementById(gearID+"type").value = curGear["GearType"];
        document.getElementById(gearID+"gearMatLimit").value = curGear["MateriaLimit"];
        document.getElementById(gearID+"nameGear").value = curGear["Name"];
        document.getElementById(gearID+"Main").value = curGear["MainStat"];
        document.getElementById(gearID+"Crit").value = curGear["Crit"];
        document.getElementById(gearID+"DH").value = curGear["DH"];
        document.getElementById(gearID+"Det").value = curGear["Det"];
        document.getElementById(gearID+"SkS").value = curGear["SkS"];
        document.getElementById(gearID+"Det").value = curGear["Det"];
        document.getElementById(gearID+"SS").value = curGear["SS"];
        document.getElementById(gearID+"Ten").value = curGear["Ten"];
        document.getElementById(gearID+"Piety").value = curGear["Piety"];

        // Only if GearType == "Weapon"
        if (curGear["GearType"] == "Weapon"){
            document.getElementById(gearID+"WD").value = curGear["WD"];
            document.getElementById(gearID+"WeaponDelay").value = curGear["WeaponDelay"];
        }

    }
}

function generateViewer(){
    // This function generates the gear viewer based on the current gearSearchSpace
    nextGearID = 0;
    document.getElementById("gearViewer").innerHTML = "";
    indexToID = [];
    // reseting current viewer

    for (let i = 0;i<gearSearchSpace.length;i++){
        var curGear = gearSearchSpace[i];
        var gearID = nextGearID;
        indexToID.push(gearID);
        generateGearViewer(gearID,i);
        nextGearID++;
    }
    populateGearViewer();

}

function removeGear(gearID){
    document.getElementById(gearID).remove();
    var index = -1;
    // finding index of gear in gearSearchSpace
    for (let i = 0;i<indexToID.length;i++){
        if (indexToID[i] == gearID){
            index = i;
            break;
        }
    }

    if (index == -1){alert("An error occured when trying to remove gear. Reach on discord if this persists.");return;}

    gearSearchSpace.splice(index,1);
    //indexToID.splice(index,1); -> This is technically not needed since it is being reseted in generateViewer() under.

        // Regenerating whole viewer. The reason we have to regenerate is beacuse
        // some parts of the viewer use the index of the gear in gearSearchSpace. Even if the gearID hasn't changed
        // its index has. Meaning instead of having to go through the trouble of doing the changes manually
        // we simply update gearSearchSpace, reset everything else and rerender the viewer.
    generateViewer();
}

function addGear(){
    var newGear = {
        "GearType" : "Weapon",
        "MateriaLimit" : 2,
        "Name" : "Unnamed",
        "WD" : 0,
        "WeaponDelay" : 3,
        "MainStat" : 0,
        "Crit" : 0,
        "DH" : 0,
        "Det" : 0,
        "SkS" : 0,
        "SS" : 0,
        "Piety" : 0,
        "Ten" : 0,
    };

    gearSearchSpace.push(newGear);
    indexToID.push(nextGearID);

    generateGearViewer(nextGearID,gearSearchSpace.length-1);
    nextGearID++;
    populateGearViewer();

}

/*
Translating gearSearchSpace dict
*/

function importGearSearchSpace(importSpace){
    // This function translates an imported gearSearchSpace dict (that follows the model the simulator accepts in Python)
    // to the model this code supports. The model is loaded in gearSearchSpace.

    gearSearchSpace = []; // reseting

    for (let i = 0;i<importSpace.length;i++){
        var curGear = importSpace[i];

        // figuring out weapon type:
        var type = "";
        switch (curGear["GearType"]){
            case 0 : type="Weapon";break;
            case 1 : type="Shield";break;
            case 2 : type="Head";break;
            case 3 : type="Body";break;
            case 4 : type="Hands";break;
            case 5 : type="Legs";break;
            case 6 : type="Feet";break;
            case 7 : type="Earrings";break;
            case 8 : type="Necklace";break;
            case 9 : type="Bracelets";break;
            case 10 : type="Left Ring";break;
            case 11 : type="Right Ring";break;
        }
        if (type == ""){alert("There was an error when importing a gear space. Reach out on discord if this persists.");return;}

        var newEntry = {
            "GearType" : type,
            "MateriaLimit" : curGear["MateriaLimit"],
            "Name" : curGear["Name"],
            "WD" : 0,
            "WeaponDelay" : 3,
            "MainStat" : 0,
            "Crit" : 0,
            "DH" : 0,
            "Det" : 0,
            "SkS" : 0,
            "SS" : 0,
            "Piety" : 0,
            "Ten" : 0,
        };

        for(let j = 0;j<curGear["StatList"].length;j++){
            newEntry[curGear["StatList"][j][0]] = curGear["StatList"][j][1];
        }

        if ("WeaponDelay" in curGear){
            newEntry["WeaponDelay"] = curGear["WeaponDelay"]
        }

        gearSearchSpace.push(newEntry);

    }

}

function exportGearSearchSpace(){
    // This function translates the gaerSearchSpace model of this code into the model the python code uses.
    var exportedModel = [];
    for (let i = 0;i<gearSearchSpace.length;i++){
        var curGear = gearSearchSpace[i];

        // Checking gearType
        var gearType = -1;
        switch (curGear["GearType"]){
            case "Weapon" : gearType = 0;break;
            case "Head" : gearType = 2;break;
            case "Body" : gearType = 3;break;
            case "Hands" : gearType = 4;break;
            case "Legs" : gearType = 5;break;
            case "Feet" : gearType = 6;break;
            case "Earrings" : gearType = 7;break;
            case "Necklace" : gearType = 8;break;
            case "Bracelets" : gearType = 9;break;
            case "Left Ring" : gearType = 10;break;
            case "Right Ring" : gearType = 11;break;
        }
        if (gearType == -1){alert("There was an error when exporting the gearSearchSpace. Reach out on discord if this persists");return;}


        // Generating Stat list
        var statList = [];
        if (curGear["MainStat"] != 0) statList.push(["MainStat", curGear["MainStat"]]);
        if (curGear["Crit"] != 0) statList.push(["Crit", curGear["Crit"]]);
        if (curGear["DH"] != 0) statList.push(["DH", curGear["DH"]]);
        if (curGear["Det"] != 0) statList.push(["Det", curGear["Det"]]);
        if (curGear["SkS"] != 0) statList.push(["SkS", curGear["SkS"]]);
        if (curGear["SS"] != 0) statList.push(["SS", curGear["SS"]]);
        if (curGear["Piety"] != 0) statList.push(["Piety", curGear["Piety"]]);
        if (curGear["Ten"] != 0) statList.push(["Ten", curGear["Ten"]]);

        if (gearType == 0 && curGear["WD"] != 0) statList.push(["WD", curGear["WD"]]);

        var newEntry = {
            "GearType" : gearType,
            "MateriaLimit" : curGear["MateriaLimit"],
            "Name" : curGear["Name"],
            "StatList" : statList
        }

        if (gearType == 0){
            newEntry["WeaponDelay"] = curGear["WeaponDelay"];
        }
        exportedModel.push(newEntry);
    }
return exportedModel;
}
/*
Translating gearSearchSpace dict END
*/



/* 
EXECUTE ON LOAD
*/

window.onload = function (){
    
    // loading gear space that is imported. Can be empty
    xhr = new XMLHttpRequest();
    var url = "http://127.0.0.1:8000/simulate/createGearSearchSpace/";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function() {
                                 // When the request has been processed, the user is sent to the SimulationResult page. If there was an error the user is notified and we return.
            
            //import the file
            console.log(xhr.responseText);
            var res = JSON.parse(xhr.responseText.replaceAll("'",'"'));
            console.log(res);
            importGearSearchSpace(res["data"]);

            generateViewer();

            return;
    }
                                 // Sends the request.
    xhr.send();

    

}