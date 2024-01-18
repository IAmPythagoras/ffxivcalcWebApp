[![Discord](https://img.shields.io/discord/970724799464738977?color=7289da&label=Discord&logo=discord)](https://discord.gg/mZXKUNy2sw)

# ffxivcalc webapp

FFXIVCALC is a web app made with electron/django that enables anyone to use the ffxivcalc python library to simulate combat from the game FFXIV Online. This app also has a gear solver (beta) that could let someone find (possibly) optimal gear composition given a rotation, a gear list, a food list, a materia list and other parameters of interest. You can download this app by going to this link (put link).

This app is aimed at people with no coding knowledge but who still want to simulate combat without the use of spreadsheets. 

Even if this app offers most feature of the python library it looses a lot of the customizability that the code offers. So it is recommend to use the actual python library in the case where
one wants to do more serious simulation work. You can find the original github repository for the ffxivcalc python library here : https://github.com/IAmPythagoras/FFXIV-Combat-Simulator

Join the discord by clicking the above image if you have any questions, wish to participate in this project or want to interact with other people who share a similar interest for FFXIV simulation.


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

6- Revert the changes done in 'index.js' from step 4 above.

7- Follow any guide to package the electron app into an executable.
