def attachmentValidation(data : dict) -> bool:
    """This function validates the JSON file given.

    Args:
        data (dict): Data received.

    Returns:
        bool: True if the validation is succesful.
    """

    if not(checkNameAndType(data, ["data"], [dict])):
        return False

    if not(checkNameAndType(data["data"], ["PlayerList","fightInfo"], [list, dict])):
        return False

    if not(checkNameAndType(data["data"]["fightInfo"], ["IgnoreMana", "RequirementOn", "ShowGraph","fightDuration",  "time_unit"], 
                                                       [bool, bool, bool, float, float])):
        return False

    for player in data["data"]["PlayerList"]:
        if type(player) != dict:
            return False
        
        if not(checkNameAndType(player, ["Auras", "JobName","PlayerName","actionList",  "etro_gearset_url", "playerID", "stat", "weaponDelay"],
                                        [list, str, str, list, str, int, dict, float])):
            return False

        if not(checkNameAndType(player["stat"], ["Crit", "DH", "Det", "MainStat", "SS", "SkS", "Ten", "WD"],
                                                [int, int, int, int, int, int, int, int])):
            return False
        
        for action in player["actionList"]:
            if not(checkNameAndType(action, ["actionName"], [str]) or 
                   checkNameAndType(action, ["actionName", "waitTime"], [str, float]) or
                   checkNameAndType(action, ["actionName", "targetID"], [str, int]) or
                   checkNameAndType(action, ["actionName", "waitTime"], [str, int])):
                return False
    return True

def checkNameAndType(dict : dict, ExpectedKeyName : list, ExpectedType : list) -> bool:
    """This function checks the dictionnary and valditates the key's name and their types. It returns
    True if the dictionnary is validated and false otherwise

    dict : The dictionnary to verify.
    ExpectedKeyName : The expected name of the dictionnary's keys. Must be sorted in alphabetical order.
    ExpectedType : The expected type of the dictionnary's entry. In the same order as ExpectedKeyName.
    """

    # Check Key's name
    nameList = list(dict.keys())
    nameList.sort()
    if nameList != ExpectedKeyName:
        return False
    
    # Will check the type
    index = 0
    for name in ExpectedKeyName:
        if type(dict[name]) != ExpectedType[index]:
            return False
        index +=1

    return True