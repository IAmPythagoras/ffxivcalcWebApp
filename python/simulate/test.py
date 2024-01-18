from copy import deepcopy
import json
import os

absolute_path = os.path.dirname(__file__)
relative_path = "static/simulate/PVEIcons"
full_path = os.path.join(absolute_path, relative_path)
IconNameDict = {}
for filename in os.listdir(full_path):
    IconNameList = []
    for iconName in os.listdir(full_path +"/" + filename):
        IconNameList.append(iconName.split('.')[0])
    IconNameDict[filename] = deepcopy(IconNameList)

with open(os.path.join(absolute_path, "static/simulate/Icon.json"), 'w') as f:
    json.dump(IconNameDict, f,indent=4)


