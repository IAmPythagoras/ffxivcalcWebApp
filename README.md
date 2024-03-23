[![Discord](https://img.shields.io/discord/970724799464738977?color=7289da&label=Discord&logo=discord)](https://discord.gg/mZXKUNy2sw)

(If you are updating you might have to restart your computer or kill the process 'manage' which is the local server hosting the site to have the new versions once you download it).

Download v1.3.0 (zip) : [https://drive.google.com/file/d/1MFltOFjhKUclhWDjCz7ktuXpYKy2JDZd/view?usp=sharing](https://drive.google.com/file/d/1pzinOe1fCeXtUdHyn9kfO-sDoaPJTSzH/view?usp=sharing)

Download v1.3.0 (7z) : [https://drive.google.com/file/d/1ZAe2CptVSQ2EbMz6rREzh8a8Nl3kF4XB/view?usp=sharing](https://drive.google.com/file/d/1ZXNDPy5hV6klmuqU92uI2U_QSWTFtVkD/view?usp=sharing)
(Both download versions are the same but 7z will extract faster, but it requires 7-zip to be installed while the zip will work natively on windows)

(This app is still in active development. Please report any issues to the discord so it can be fixed.)

# ffxivcalc webapp

FFXIVCALC is a web app made with electron/django that enables anyone to use the ffxivcalc python library to simulate combat from the game FFXIV Online. This app also has a gear solver (beta) that could let someone find (possibly) optimal gear composition given a rotation, a gear list, a food list, a materia list and other parameters of interest.

This app is aimed at people with no coding knowledge but who still want to simulate combat without the use of spreadsheets. 

Even if this app offers most feature of the python library it looses a lot of the customizability that the code offers. So it is recommend to use the actual python library in the case where
one wants to do more serious simulation work. You can find the original github repository for the ffxivcalc python library here : https://github.com/IAmPythagoras/FFXIV-Combat-Simulator

Join the discord by clicking the above image if you have any questions, wish to participate in this project or want to interact with other people who share a similar interest for FFXIV simulation.

# Preview of the app

Create a fight with up to 8 players, edit the stats of the player or use an etro gear set link to impor the stats, add actions for the player to perform, etc.

![simuateMainMenu](https://github.com/IAmPythagoras/ffxivcalcWebApp/assets/62820030/317850cc-9799-4a2f-a6b2-248d560d47a4)

Configure the simulation to fit your requirements. 

![simulateMainMenu2](https://github.com/IAmPythagoras/ffxivcalcWebApp/assets/62820030/a5d5ad7f-ea70-4254-be0d-6da7afe7074f)

Get detailed results of the simulation and receive a warning for any action that could not have been done in game (due to failed requirement). Download the 'simulation record' for a complete log of the simulation showing each event and what affected them.

![result1](https://github.com/IAmPythagoras/ffxivcalcWebApp/assets/62820030/ca492dda-4a08-4788-a460-7213bc60e023)

Get a DPS/Time(s) graph like one would expect on websites like fflogs.

![result2](https://github.com/IAmPythagoras/ffxivcalcWebApp/assets/62820030/0ae20a66-40cc-4c1d-8cac-820f4f66b8e7)

Get a DPS distribution graph showing an estimate of the true DPS distribution. The amount of random simulations done for that distribution can be configured before running the simulation.

![result3](https://github.com/IAmPythagoras/ffxivcalcWebApp/assets/62820030/e9cb14b5-e6ac-4aa9-8b85-6ca9dd9b95ea)

Or use the BiS rotation solver (beta) to find a possibly optimal gear set.

![solver1](https://github.com/IAmPythagoras/ffxivcalcWebApp/assets/62820030/08f106d5-82a8-44be-b969-2b43ec8ac9ff)
![solver2](https://github.com/IAmPythagoras/ffxivcalcWebApp/assets/62820030/33fe3704-cf81-4952-9a12-cc07b09ae2ac)

Received result with the different gear piece, the best food and the materias to meld onto the gear pieces.

![solverREsult](https://github.com/IAmPythagoras/ffxivcalcWebApp/assets/62820030/8ad4a5ce-7686-4910-ac06-1e285032ce36)

(Note that the solver is not assured to be optimal and that the result of the solver will change depending on the input. It is always good to compare
the found gear sets using by running a simulation or using another DPS calc tool such as the damage/100p metric found on etro.com)

# Contribution/Making your own version

If you want to make your own version of this web app, you must do the following.

1- You must initialize a node_module in the root of this folder.

2- You must create a python virtual environment in the 'python' folder. The use of 'virtualenv' should be fine.

3- This python virtual environment must have the following libraries installed : ffxivcalc, whitenoise and django

4- Change the code in "index.js" of this repository so it launchs "manage.py" with the "runserver" parameter. You should now be able to launch the electron web app using : 'npm run ffxivcalc' in the
root of this folder.

5- Once you are done with the changes you wanted to do, install 'pyinstaller' in the python virtual environment and run the following command to create an executable of 'manage.py'.

```
pyinstaller manage.py --additional-hooks-dir=extra-hooks --noconfirm --collect-data coreschema --hiddenimport=whitenoise --hiddenimport=whitenoise.middleware --hiddenimport=matplotlib.backends.backend_pdf
```

6- Run 'manage.exe migrate' to do all db migration (the server will still start if this is not done, but the app will not work properly).

7- Revert the changes done in 'index.js' from step 4 above.

8- Follow any guide to package the electron app into an executable.

If any of this is unclear or something doesn't work feel free to reach out on discord using the above discord and asking me (iampythagoras \ Pythagoras).

# Update info :

1.1.1(.1) - Fixed import issues + fixed issue where 0 materia limit was a string + added better error log

1.1.1 - Added a 'loading' page to fix issue where the server would launch after the page was loaded (resulted in blank page not updating).

1.1.0 - Reworked some of the UI
