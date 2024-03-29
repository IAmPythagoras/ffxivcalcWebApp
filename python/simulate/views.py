from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
import io
import matplotlib.pyplot as plt
import json
from copy import deepcopy
import base64, urllib
from .Validation import attachmentValidation
import logging
from ffxivcalc.helperCode import helper_backend
from ffxivcalc.helperCode.exceptions import *
from ffxivcalc.GearSolver.Gear import Food, translateGear, StatType
from ffxivcalc.GearSolver.Solver import BiSSolver, getBaseStat, getGearDPSValue
from ffxivcalc.Request.FFLogs_api import getSingleFightData
from ffxivcalc.Request.etro_request import get_gearset_data
from ffxivcalc.helperCode.exceptions import InvalidTarget
from ffxivcalc.Jobs.PlayerEnum import JobEnum
from ffxivcalc.helperCode.helper_backend import RestoreFightObject, SaveFight
from ffxivcalc import __version__
from .Stream import LogStream
import os
from tempfile import gettempdir

# environ var
# Please don't copy it will make me cry): 
# I'm just stupid and don't knnow how to do it otherwise
# Go get your own if you need any.
os.environ["FFLOGS_CLIENT_ID"] = "9b8e6c18-39d6-4ae0-91c7-e9221e699769"
os.environ["FFLOGS_CLIENT_SECRET"] = "u0j8e1aIygCejB6HiBJFJcr0RB1MSIkVkLdgxDox"

# Local information saved
buff = {'pb' : ""}
buffSimulation = {'pb' : ""}
searchPatternBuffer = {'curSearch' : [0,0,False]}


                             # simulationRecordSave contains the simulation record of all session. Each session is given a
                             # simulation record id which it can use to access its simulation record in 'simulationRecordSave'
                             # The id is simply the last key + 1 (and 0 if there is no key).
                             # This dictionnary is never reset and only resets once the app is relaunched (server closed and restarted)
eventSave = {}

fightSimulationSaveId = {}


log_stream = LogStream()
logging.basicConfig(stream=log_stream)
logging.getLogger("ffxivcalc").setLevel(level=logging.WARNING)


def prepareData(data):
    data["data"]["fightInfo"]["fightDuration"] = float(data["data"]["fightInfo"]["fightDuration"])
    for player in data["data"]["PlayerList"]:

        player["playerID"] = int(player["playerID"])
        player["weaponDelay"] = float(player["weaponDelay"])
        for key in player["stat"]:
            player["stat"][key] = int(player["stat"][key])
        for action in player["actionList"]:
            if action["actionName"] == "WaitAbility":
                action["waitTime"] = float(action["waitTime"])
            if "targetID" in action.keys():
                action["targetID"] = int(action["targetID"])
        
                                # We check if the player is a ninja. In which case we will have to 
                                # change TenChiJin mudra's
            if player["JobName"] == "Ninja":
                for index in range(len(player["actionList"])):
                    action = player["actionList"][index]
                    if action["actionName"] == "TenChiJin":
                                # Then we have to change the next Ten, Chi or Jin to Ten2, Chi2, Jin2
                                # We just check the next 3 abilities and will add 2 if ten,chi or jin
                            for i in range(index+1,index+4):
                                if (player["actionList"][i]["actionName"] == "Ten" or
                                    player["actionList"][i]["actionName"] == "Chi" or 
                                    player["actionList"][i]["actionName"] == "Jin"):
                                    player["actionList"][i]["actionName"] += "2" 

                            # We are adding data that is willingly not editable by the user
    data["data"]["fightInfo"]["time_unit"] = 0.01
    data["data"]["fightInfo"]["ShowGraph"] = False

@csrf_exempt
def index(request):
    """
    This view is the homepage of the website.
    """

    if request != None and request.method == "OPENEDITOR":
        # Generate id for SimulationInput view.
        curId = list(fightSimulationSaveId.keys())
        newId = max(curId) + 1 if len(curId) > 0 else 1

        fightSimulationSaveId[newId] = None

        print(f'Generated id {newId}')
        return HttpResponse(str({'id' : newId}), status=200)

    return render(request, 'simulate/index.html', {"ffxivcalcVersion" : str(__version__)})

@csrf_exempt
def SyncPlayerView(request):

    return render(request, 'simulate/syncPlayer.html', {})

@csrf_exempt                 # Will but csrf_exempt for now, since was causing issues. We are doing validations on the request anyway.
def SimulationInput(request):
    """
    This view lets the user setup the simulation for what they want. It only sends the data and does not simulate.
    """

    id = request.GET.get("id")
    print(f"Retrieved id from simulationInput : {id}")

    if request.method == "CHECKSTART":
        # This gets pinged to know if server is up
        return HttpResponse('OK', status=200)
    
    if request.method == "SYNCPLAYER":
                # This sends the time estimate of a player.
        simulationData = json.loads(request.body) # simulation data is in this. This should only contain the player in question.
        try:
            prepareData(simulationData)
            fight = helper_backend.RestoreFightObject(simulationData)
            timeChange = fight.syncPlayerPrePull(editActionSet=False)
            rDict = {str(key) : timeChange[key] for key in timeChange}
            return HttpResponse(str(rDict), status=200)
        except:
            return HttpResponse(str({"status" : "ERROR"}))

    if request.method == "GETETRO":
        try:
            etroStatDict = get_gearset_data(request.body.decode("utf-8"))
            etroStatDict["status"] = "OK"
            return HttpResponse(str(etroStatDict))
        except:
            return HttpResponse(str({"status" : "ERROR"}))
    
    if request.method == "GETESTIMATE":
        # This sends the time estimate of a player.
        simulationData = json.loads(request.body) # simulation data is in this. This should only contain the player in question.
        try:
            prepareData(simulationData)

            fight = helper_backend.RestoreFightObject(simulationData)

            timeEstimate = fight.PlayerList[0].computeTimeStamp()
                                # For unclear reason I have to do it like that otherwise it refuses to convert back into a dict in JS
            return HttpResponse(str({"status" : "OK", "currentTimeStamp" : timeEstimate["currentTimeStamp"], "untilNextGCD" : timeEstimate["untilNextGCD"], 
                                    "dotTimer" : timeEstimate["dotTimer"], "buffTimer" : timeEstimate["buffTimer"]}))
        except:
            return HttpResponse(str({"status" : "ERROR"}))


    if request.method == "POST":
                             # Reset session
        if "SimulationData" in request.session.keys(): del request.session['SimulationData']
                             # The SimulationInput page will make a POST HTTP request to itself. This will be catched here.
        request.session['SimulationData'] = json.loads(request.body)
                             # The simulation data is saved in the session. The user will now be redirected to the SimulationResult page
        return HttpResponse('200', status=200)
    return render(request, 'simulate/input.html', {})

@csrf_exempt
def importFFLogs(request):

    if request.method == "IMPORT":
        # Import from fflogs
        try:
            importData = json.loads(request.body)
            data = getSingleFightData("","", importData['code'], importData['fightId'], max_time=importData["max_time"])
            data['status'] = "ok"

            for player in data["data"]["PlayerList"]:
                if "'" in player["PlayerName"]:
                    player["PlayerName"] = player["PlayerName"].replace("'", " ")
                    
            strData = json.dumps(data)
            return HttpResponse(strData, status=200)
        except Exception as Error:
            from traceback import format_exc
            Msg = ("An unknown error happened and "+Error.__class__.__name__+" was raised. If this persists reach out on discord.\n" +
                " Error message : " + str(Error) + ". Please verify the given record code and fightId or reach out on discord if this persists.")
            return HttpResponse(Msg, status=200) 

    return render(request, 'simulate/importFFLogs.html', {})

@csrf_exempt
def WaitingQueue(request):
    """
    This view is a waiting queue for the simulation to run. After clicking "Simulate" in SimulationInput. Users are brought
    here. The page will send a POST request every 1 seconds. If the FIGHT_ID_PROCESS corresponds to the user, it will be process 
    and the user is brought to Simulation Result.
    """
    return render(request, 'simulate/Waiting.html', {})

@csrf_exempt
def simulationLoading(request):
    """This view does the actual simulation. It also can be requested the progress bar to show the user.
    """

    if request.method == "GETPB":
        return HttpResponse(buffSimulation['pb'], status=200)

    if request.method == "START":
                             # Reseting session data if already written
        
        if 'result_arr' in request.session.keys(): del request.session['result_arr']
        if 'uri' in request.session.keys(): del request.session['uri']
        if 'uri2' in request.session.keys(): del request.session['uri2']
        if 'mode' in request.session.keys(): del request.session['mode']
        if 'ReturnCode' in request.session.keys(): del request.session['ReturnCode']
        if 'nRandomIterations' in request.session.keys(): del request.session['nRandomIterations']
        
        try:
                                # We are recuperating the simulation data, and deleting it.
                                # Deleting it will make sure the data is not reused in the same session
                                # if the user goes back to SimulationInput. We first check if it is a key,
                                # if it is not we redirect to the error page. This error could happen
                                # If there was an error when putting the data in the session, or if
                                # SimulationResult was accessed without first going to SimulationInput.
            if (not "SimulationData" in request.session.keys()):
                Msg = ("The session does not have a 'SimulationData' key, make sure you access this page by first going to 'SimulationInput'. If this issues persists contact me on discord.")
                request.session["ErrorMessage"] = Msg
                return HttpResponse('ERROR', status=200)

            data = deepcopy(request.session['SimulationData'])
            del request.session['SimulationData']
                                    # We check if the DEBUG mode is true or not.
            mode = data["mode"]  
            request.session['mode'] = mode    
                                    # We check if the TeamCompBonus is true or not.
            TeamBonusComp = data["TeamCompBonus"]
                                    # We check if MaxPotencyPlentifulHarvest is true or not
            MaxPotencyPlentifulHarvest = data["MaxPotencyPlentifulHarvest"]
            nRandomIterations = data["nRandomIterations"]
            request.session['nRandomIterations'] = nRandomIterations

            del data["mode"]  
            del data["TeamCompBonus"]  
            del data["MaxPotencyPlentifulHarvest"]
            del data["nRandomIterations"]
                                    # We remove it so it doesn't interfere with validation.

                                    # Since some fields from the data were not of the right type, 
                                    # we are casting them into the expected type, as they will otherwise
                                    # fail the validation.
            prepareData(data)
                                    # We will validate the final dictionnary before reading anything from it.
                                    # If it fails, the user is redirected to an Error view with a failed validation message.
            #print(data)
            # Removed validation attached to the json file. Leaving code here in case.
            if False:#not attachmentValidation(data):
                Msg = ("There was an error when validating the given data. Either there was a corruption of the data "+
                    "or something else happened. If this error persists please let me know through discord.")
                request.session["ErrorMessage"] = Msg
                return HttpResponse('ERROR', status=200)
            
                                    # We are making a string that represents the whole JSON saved file
                                    # since the user can request to see it. Saving it in the session.
            request.session["JSONFileViewer"] = json.dumps(data, indent=2) # Leaving the data in the session if the user wants to see it.

                                    # Restoring the fight object from the data
            Event = helper_backend.RestoreFightObject(data)
                                    # Configuring the Event object according to the parameters in data
            Event.ShowGraph = data["data"]["fightInfo"]["ShowGraph"] # Set to false
            Event.RequirementOn = data["data"]["fightInfo"]["RequirementOn"]
            Event.IgnoreMana = data["data"]["fightInfo"]["IgnoreMana"]
                                        # Simulating the fight and logging if DEBUG mode
            if mode: logging.getLogger("ffxivcalc").setLevel(level=logging.DEBUG)
                                        # result_str is the result in text
                                        # fig is the graph of DPS
                                        # fig2 is the graph of DPS distribution
            
            result_str, fig, fig2 = Event.SimulateFight(0.01,data["data"]["fightInfo"]["fightDuration"], vocal=False, PPSGraph=False, MaxTeamBonus=TeamBonusComp, MaxPotencyPlentifulHarvest=MaxPotencyPlentifulHarvest,n=nRandomIterations, loadingBarBuffer=buffSimulation, showProgress=False)
            
            if mode: 
                                    # Reverting changes
                logging.getLogger("ffxivcalc").setLevel(level=logging.WARNING)
                                    # result_str contains the result of the simulation.
                                    # We will parse it by line in order to show it clearly to the user.
            result_arr = []
            for line in result_str.split("\n"):
                result_arr.append(line)
            request.session['result_arr'] = result_arr
                                    # We will save the generated matplotlib figure
                                    # in order to show it to the user.

                                    # DPS Vs.Time
            buf = io.BytesIO()
            fig.savefig(buf, format='png', dpi=200)
            buf.seek(0)
            string = base64.b64encode(buf.read())
            uri = urllib.parse.quote(string)
            request.session['uri'] = uri

                                            # DPS Distribution
            if nRandomIterations > 0 :
                buf2 = io.BytesIO()
                fig2.savefig(buf2, format='png', dpi=200)
                buf2.seek(0)
                string2 = base64.b64encode(buf2.read())
                uri2 = urllib.parse.quote(string2)
                request.session['uri2'] = uri2
            else : uri2 = None
                                # Requestion simulationRecord
            #fig3 = Event.simulationRecord.saveRecord(saveAsPDF=False)
            #buf3 = io.BytesIO()
            #fig3.savefig(buf3, format='pdf', dpi=200)
            #buf3.seek(0)
            #string3 = base64.b64encode(buf3.read())
            #uri3 = urllib.parse.quote(string3)
            #request.session["buf3"] = uri3

                                    # We will take the logs if any and check what the ReturnCode value is.
            ReturnCode = log_stream.ReturnCode
            request.session['ReturnCode'] = ReturnCode
            log_str = log_stream.to_str()
            request.session['log_str'] = log_str

                             # Will add the event record to eventSave
                             # and create an access id. This id will be sent back to the webpage that will remember it
            eventRecordId = 0
            curId = list(eventSave.keys())
            if len(curId) != 0:
                             # It has other ids so give last + 1
                eventRecordId = int(curId[-1]) + 1
            eventSave[eventRecordId] = Event

            return HttpResponse(str({"status" : "200", "saveId" : eventRecordId}), status=200)
        except InvalidTarget as Error:
            from traceback import format_exc
            request.session['errorLog'] = format_exc()
            Msg = ("An action had an invalid target and the simulation was not able to continue.\n" +
            " Error message : " + str(Error) + ". If this persists reach out on discord.\n")
            request.session["ErrorMessage"] = Msg
            return HttpResponse("ERROR", status=200) 
        except Exception as Error:
            from traceback import format_exc
            request.session['errorLog'] = format_exc()
            Msg = ("An unknown error happened and '"+Error.__class__.__name__+"' was raised. If this persists reach out on discord.\n" +
                " Error message : " + str(Error))
            request.session["ErrorMessage"] = Msg
            return HttpResponse("ERROR", status=200) 
    return render(request, 'simulate/simulatorLoading.html',{})

@csrf_exempt
def SimulationResult(request):
    """
    This view will retrieve the data from the session and simulate the fight. It validates the file before simulating it.
    It then displays the result to the user.
    """

    id = request.GET.get("id")

    if 'uri2' in request.session.keys() : uri2 = request.session['uri2']
    else : uri2 = ""
                                                                    


    return render(request, 'simulate/SimulatingResult.html', {"result_str" : request.session['result_arr'], "graph" : request.session['uri'],"graph_dist" : uri2,"has_dist" : request.session['nRandomIterations'] > 0, 
                                                              "WARNING" : request.session['ReturnCode'] == 1 or request.session['mode'], "CRITICAL" : request.session['ReturnCode'] == 2, 
                                                              "log_str" : request.session['log_str'], "mode" : request.session['mode'], 'saveId' : id})

@csrf_exempt
def simulationRecordCustomizeView(request):
    """This view lets the user customize the output of the simulation record and lets the user download it (or the text version)
    """

    eventId = int(request.GET.get("id")) # Id of the associated event is stored in the url

    if request.method == "GETTXT":
        try:
            rawData = json.loads(request.body)
            data = rawData['scope']
            startTime = float(data["startTime"])
            endTime = float(data["endTime"])
            trackAutos = bool(data["trackAutos"])
            trackDOTs = bool(data["trackDOTs"])
            idList = data["trackPlayer"]
            for index in range(len(idList)):
                idList[index] = int(idList[index])
            pathToSave = str(rawData['path'])
            #print("path : " + pathToSave)
            # Getting simulation record and saving at specified url.
            eventSave[eventId].simulationRecord.saveRecordText(path=pathToSave,customizeRecord=True,startTime=startTime,endTime=endTime,trackAutos=trackAutos,trackDOTs=trackDOTs, idList=idList)
            return HttpResponse('200', status=200)
        except:
            HttpResponse('ERROR', status=200)

    if request.method == "GETPDF":
        try:
            rawData = json.loads(request.body)
            data = rawData['scope']
            startTime = float(data["startTime"])
            endTime = float(data["endTime"])
            trackAutos = bool(data["trackAutos"])
            trackDOTs = bool(data["trackDOTs"])
            idList = data["trackPlayer"]
            for index in range(len(idList)):
                idList[index] = int(idList[index])
            pathToSave = str(rawData['path'])
            #print("path : " + pathToSave)
            # Getting simulation record and saving at specified url.
            eventSave[eventId].simulationRecord.saveRecord(customizeRecord=True,saveAsPDF=False,startTime=startTime,endTime=endTime,trackAutos=trackAutos,trackDOTs=trackDOTs, idList=idList).savefig(
                    pathToSave,
                    dpi=200,
                    format='pdf',
                    bbox_inches='tight'
                    )
            return HttpResponse('200', status=200)
        except:
            HttpResponse('ERROR', status=200)

    if request.method == "GETRECORDLENGTH":
        # This method returns the length in rows of the record under the current restriction
        try:
            data = json.loads(request.body)
            startTime = float(data["startTime"])
            endTime = float(data["endTime"])
            trackAutos = bool(data["trackAutos"])
            trackDOTs = bool(data["trackDOTs"])
            idList = data["trackPlayer"]
            for index in range(len(idList)):
                idList[index] = int(idList[index])
            #print(idList)
            nRows = eventSave[eventId].simulationRecord.getRecordLength(startTime, endTime, trackAutos, trackDOTs, idList)
            #print(nRows)
            return HttpResponse(str({'nRows' : nRows, 'status' : 'OK'}))
        except:
            return HttpResponse(str({'status' : 'ERROR'}))

                             # Generating player name and id tuple list
    nameIdList = []
    for player in eventSave[int(eventId)].PlayerList:
        name = str(JobEnum.name_for_id(player.JobEnum)) + ("" if player.PlayerName == "" else " " + player.PlayerName) + " ID - " + str(player.playerID)
        id = player.playerID
        nameIdList.append((name,id))

    return render(request, 'simulate/customizeRecord.html', {"playerList": nameIdList, "eventId" : eventId})
    

def helpSolver(request):
    """
    This view is the helper for the solver
    """
    return render(request, 'simulate/helpSolver.html', {})

def credit(request):
    """
    This view is the credits view.
    """
    return render(request, 'simulate/credit.html', {})

@csrf_exempt
def bisRotationSolver(request):
    """
    This is the rotation solver view
    """
    if "gearSpace" in request.session.keys(): del request.session['gearSpace']
    if request.method == "POST":
        # User wants to create/edit a gear space
        # So save current gear space into the session for createGearSearchSpace view to use.
        request.session['gearSpace'] = {"data":json.loads(request.body)}
        return HttpResponse('200', status=200)
    
    if request.method == "SUBMIT":
        # User wants to submit. 
        # We write the information to the session and the user will be redirected to
        # the loading page.
        request.session['solverData'] = json.loads(request.body)
        return HttpResponse('200', status=200)

    return render(request, 'simulate/bisRotationSolver.html', {})

@csrf_exempt
def solverLoading(request):
    """
    This view is a loading of the solver. This view does the request
    to start the solver.
    """

    if request.method == "GETPB":
                             # Get current progress bar
        return HttpResponse(buff['pb'], status=200)
    
    if request.method == "GETSP":
                             # Get search pattern
        # This doesn't work, not sure why. Will leave the code here but do not call it
        rString = f'pre oversaturations : {searchPatternBuffer["curSearch"][0]} | post oversaturations : {searchPatternBuffer["curSearch"][1]} | Swap DH/Det before speed : {searchPatternBuffer["curSearch"][2]}'
        return HttpResponse(rString, status=200)

    if request.method == "START":
        try:
            # reseting pb buffer and result text/solverParam in session
            buff['pb'] = ""
            searchPatternBuffer = {'curSearch' : [0,0,False]}
            if 'text' in request.session.keys(): del request.session['text']
            if 'solverParam' in request.session.keys(): del request.session['solverParam']
            if 'curSearch' in request.session.keys(): del request.session['curSearch']

            # Start the solver.
            # by reading the data saved in the session.

            data = request.session['solverData']
            del request.session['solverData']
                                # Generating fight object
            Event = helper_backend.RestoreFightObject(data['fight'])
                                    # Configuring the Event object according to the parameters in data
            Event.ShowGraph = False # Set to false
            Event.RequirementOn = False
            Event.IgnoreMana = True
                                # Generate food space
            HD = Food({"DH" : [103, 0.1], "Det" : [62, 0.1]}, "Honeyed Dragonfruit")
            DB = Food({"SkS" : [103, 0.1], "DH" : [62, 0.1]}, "Dragonfruit Blend")
            BG = Food({"Crit" : [103, 0.1], "SkS" : [62, 0.1]}, "Baba Ghanoush")
            BE = Food({"Det" : [103, 0.1], "Crit" : [62, 0.1]}, "Baked Eggplant")
            CW = Food({"SS" : [103, 0.1], "DH" : [62, 0.1]}, "Caviar Sandwich")
            CC = Food({"Crit" : [103, 0.1], "SS" : [62, 0.1]}, "Caviar Canapes")
            MB = Food({"Ten" : [103, 0.1], "Det" : [62, 0.1]}, "Marinated Broccoflower")
            BS =  Food({"Det" : [103, 0.1], "Ten" : [62, 0.1]}, "Broccoflower Stew")
            foodnameToObj = {"Honeyed Dragonfruit (DH/Det)" : HD,
                            "Dragonfruit Blend (SkS/DH)" : DB, 
                            "Baba Ghanoush (Crit/SkS)" : BG, 
                            "Baked Eggplant (Det/Crit)" : BE,
                            "Caviar Sandwich (SpS/DH)" : CW, 
                            "Caviar Canapes (Crit/SpS)" : CC, 
                            "Marinated Broccoflower (Ten/Det)" : MB, 
                            "Broccoflower Stew (Det/Ten)" : BS}
            
            foodSpace = []
            for food in data['foodSpace']:
                foodSpace.append(foodnameToObj[food])

            optimal, random, text = None, None, ""
                                # Extracting info
            gearSpace = translateGear(data['gearSpace'])
            playerIndex = int(data['playerIndex'])
            matSpace = data['matSpace']
            minPiety = int(data['minPiety'])
            minSPD = max(400,int(data['minSPD']))
            maxSPD = int(data['maxSPD'])
            useSS = bool(data['useSS'])
            if 'defaultSearchPattern' in data.keys():
                             # If want a defaultSearchPattern
                curBest = 0
                curBestText = ""
                curBestPattern = None

                             # A search pattern reads (pre, post, swapBefore)
                searchPattern = [(1,0,True), (0,1,True), (1,1, True),(1,0,False), (0,1,False), (1,1, False)]

                for pattern in searchPattern:
                    searchPatternBuffer = pattern
                    #print("LOOKING FOR PATTERN : " + str(pattern))
                    opt, t = BiSSolver(Event.deepCopy(), gearSpace,matSpace, foodSpace,PercentileToOpt=["exp"], randomIteration=100, mendSpellSpeed=useSS,minSPDValue=minSPD,maxSPDValue=maxSPD, useNewAlgo=True, PlayerIndex=playerIndex,PlayerID=Event.PlayerList[playerIndex].playerID,
                                    oversaturationIterationsPreGear=pattern[0], oversaturationIterationsPostGear=pattern[1],findOptMateriaGearBF=True,swapDHDetBeforeSpeed=pattern[2], minPiety=minPiety, saveAsFile=False,
                                    showBar=False, loadingBarBuffer=buff,returnGearSet=False)
                    buff['pb'] = "" # reseting buffer

                    if opt > curBest:
                        #print("FOUND NEW BEST")
                        #print(curBest)
                        #print(opt)
                        curBest = opt
                        curBestText = t
                        curBestPattern = pattern
                             # Save text result in session   
                request.session['text'] = curBestText.split('\n')
                             # Saving param in session to display to the user in results
                request.session['solverParam'] = {
                    "matSpace" : [StatType.name_for_id(int(mat)) for mat in matSpace],
                    "foodSpace" : data['foodSpace'],
                    "useSS" : useSS,
                    "minSPD" : minSPD,
                    "maxSPD" : maxSPD,
                    "oversaturationPre" : curBestPattern[0],
                    "oversaturationPost" : curBestPattern[1],
                    "swapBefore" : curBestPattern[2],
                    "playerName" : Event.PlayerList[playerIndex].PlayerName,
                    "playerJob" : JobEnum.name_for_id(Event.PlayerList[playerIndex].JobEnum)
                }
            else:
                oversaturationPre = int(data['oversaturationPre'])
                oversaturationPost = int(data['oversaturationPost'])
                swapBefore = bool(data['swapBefore'])
                expectedDPS, text = BiSSolver(Event, gearSpace,matSpace, foodSpace,PercentileToOpt=["exp"], randomIteration=100, mendSpellSpeed=useSS,minSPDValue=minSPD,maxSPDValue=maxSPD, useNewAlgo=True, PlayerIndex=playerIndex,PlayerID=Event.PlayerList[playerIndex].playerID,
                                    oversaturationIterationsPreGear=oversaturationPre, oversaturationIterationsPostGear=oversaturationPost,findOptMateriaGearBF=True,swapDHDetBeforeSpeed=swapBefore, minPiety=minPiety, saveAsFile=False,
                                    showBar=False, loadingBarBuffer=buff,returnGearSet=False)

                             # Save text result in session    
                request.session['text'] = text.split('\n')
                request.session['solverParam'] = {
                    "matSpace" : [StatType.name_for_id(int(mat)) for mat in matSpace],
                    "foodSpace" : data['foodSpace'],
                    "useSS" : useSS,
                    "minSPD" : minSPD,
                    "maxSPD" : maxSPD,
                    "oversaturationPre" : oversaturationPre,
                    "oversaturationPost" : oversaturationPost,
                    "swapBefore" : swapBefore,
                    "playerName" : Event.PlayerList[playerIndex].PlayerName,
                    "playerJob" : JobEnum.name_for_id(Event.PlayerList[playerIndex].JobEnum)
                }

            # Once the solver is done we return a result page.
            buff['pb'] = "" # reseting buffer
            searchPatternBuffer = {'curSearch' : [0,0,False]}
            return HttpResponse('200', status=200)
        except Exception as Error:
            from traceback import format_exc
            request.session["errorLog"] = format_exc()
            Msg = ("An unknown error happened and '"+Error.__class__.__name__+"' was raised. If this persists reach out on discord.\n" +
                   " Error message : " + str(Error))
            request.session["ErrorMessage"] = Msg
            return HttpResponse('ERROR', status=200) 
        
    if 'solverData' in request.session.keys():
        return render(request, 'simulate/solverLoading.html', {"isSearchPattern" : 'defaultSearchPattern' in request.session['solverData'].keys()})
    return render(request, 'simulate/solverLoading.html', {"isSearchPattern" : False})

@csrf_exempt
def solverResult(request):
    """
    This view shows the solver's result
    """
    if 'text' in request.session.keys(): t = request.session['text']
    else : t = ""

    if 'solverParam' in request.session.keys():
        matSpace = str(request.session['solverParam']["matSpace"])
        foodSpace = str(request.session['solverParam']["foodSpace"])
        useSS = str(request.session['solverParam']["useSS"])
        minSPD = str(request.session['solverParam']["minSPD"])
        maxSPD = str(request.session['solverParam']["maxSPD"])
        oversaturationPre = str(request.session['solverParam']["oversaturationPre"])
        oversaturationPost = str(request.session['solverParam']["oversaturationPost"])
        swapBefore = str(request.session['solverParam']["swapBefore"])
        playerName = str(request.session['solverParam']["playerName"])
        playerJob = str(request.session['solverParam']["playerJob"])
    else:
        matSpace = ""
        foodSpace = ""
        useSS = ""
        minSPD = ""
        maxSPD = ""
        oversaturationPre = ""
        oversaturationPost = ""
        swapBefore = ""
        playerName = ""
        playerJob = ""

    return render(request,'simulate/solverResult.html', {"text" : t, "matSpace" : matSpace, "foodSpace" : foodSpace, "useSS" : useSS, 
                                                         "minSPD" : minSPD, "maxSPD" : maxSPD, "oversaturationPre" : oversaturationPre, "oversaturationPost" : oversaturationPost,"swapBefore" : swapBefore, "playerName" : playerName, "playerJob" : playerJob})


@csrf_exempt
def createGearSearchSpace(request):
    """
    This view lets the user create/edit a gear search space
    """

    if request.method == "POST":
            # This asks for the gearSpace in session
            # If not in session returns empty list
        if 'gearSpace' in request.session :
            data = request.session['gearSpace']
            del request.session['gearSpace']
            return HttpResponse(str(data), status=200)
        else : return HttpResponse(str({"data" : []}), status=200)

    return render(request, 'simulate/createGearSearchSpace.html', {})

@csrf_exempt
def solverWaiting(request):
    """
    This view is a waiting view for the solver to run. It displays input and informs
    the user that it might take a while.
    """
    return render(request, 'simulate/solverWaiting.html', {})

def JSONFileViewer(request):
    """
    This view shows the raw JSON data of the simulation. The string to show is in the JSONFileViewer key
    in the session.
    """
    if (not "JSONFileViewer" in request.session.keys()):
        Msg = ("The session does not have a 'JSONFileViewer' key, make sure you access this page by first going to 'SimulationResult'. If this issues persists contact me on discord.")
        request.session["ErrorMessage"] = Msg
        return redirect('Error')
    return render(request, 'simulate/JSONFileViewer.html', {'JSONFileStr' : request.session["JSONFileViewer"]})

def Error(request):
    """
    This view is any error message. It displays the ErrorMessage given to the user. It will display the message
    saved at the key "ErrorMessage" in the session
    """
                             # Check if the session has an error message. If it doesn't
                             # we simply display Error Message. Otherwise we take the message
                             # and remove it from the session.
    ErrorMessage = "Unknown Error Message."
    errorLog = "Unknown error log"
    if ("ErrorMessage" in request.session.keys()):
        ErrorMessage = request.session["ErrorMessage"]
        del request.session["ErrorMessage"]
    if ("errorLog" in request.session.keys()):
        errorLog = request.session["errorLog"]
        del request.session["errorLog"]

    return render(request, 'simulate/Error.html', {"ErrorMessage" : ErrorMessage, "errorLog" : errorLog})

def help(request):
    """
    Help page.
    """
    return render(request, 'simulate/help.html', {})


def NotFoundError(request, exp):
    """
    Adress not found. HTTP 404
    """
    Msg = ("The requested page does not exist. Please validate the url.")
    request.session["ErrorMessage"] = Msg
    return redirect('Error') 

def ServerDiedMoment(request):
    """
    HTTP 500
    """
    Msg = ("There either was an error with the server or the specified URL does not exist. Reach out on discord if this persists")
    request.session["ErrorMessage"] = Msg
    return redirect('Error') 

def More(request):
    """
    This view will contain more information on how the simulator works and also on other ressources that I find interesting.
    """
    return render(request, 'simulate/More.html', {})

index(None)