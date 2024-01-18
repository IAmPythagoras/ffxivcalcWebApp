window.setInterval(function(){
updateProgressBar();
}, 500);


function updateProgressBar(){
  // This function updates the progress bar shown to the user.
  // It sends a request to the server every 100 ms and the server replies with a text
  // loading bar. This bar is then simply shown to the user.

  xhr2 = new XMLHttpRequest();
  var url = "/simulate/simulationLoading/";
  xhr2.open("GETPB", url, true);
  xhr2.setRequestHeader("Content-type", "application/json");
  xhr2.onreadystatechange = function () {
    var pb = xhr2.responseText;
    document.getElementById("progressBar").innerHTML = pb;
  }
  xhr2.send();
}

window.onload = function (){
    xhr = new XMLHttpRequest();
    var url = "/simulate/simulationLoading/";
    xhr.open("START", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {

      if (xhr.responseText == "200"){
        // All worked and simulation was a success
        window.location.replace("http://127.0.0.1:8000/simulate/SimulationResult/");
      } else if (xhr.responseText == "ERROR"){
        // ERROR
        window.location.replace("http://127.0.0.1:8000/simulate/Error/");
      }
    }
    xhr.send();
}