window.setInterval(function(){
  updateProgressBar();
}, 500);


function updateProgressBar(){
  // This function updates the progress bar shown to the user.
  // It sends a request to the server every 100 ms and the server replies with a text
  // loading bar. This bar is then simply shown to the user.
  // This function also updates the currently displayed search pattern

                             // Updating PB
  xhr2 = new XMLHttpRequest();
  var url2 = "/simulate/solverLoading/";
  xhr2.open("GETPB", url2, true);
  xhr2.setRequestHeader("Content-type", "application/json");
  xhr2.onreadystatechange = function () {
    var pb = xhr2.responseText;
    document.getElementById("progressBar").innerHTML = pb;
  }
  xhr2.send();

                             // Updating search pattern
                             /* This does not work. Leaving commented out here for now
  xhr3 = new XMLHttpRequest();
  var url3 = "/simulate/solverLoading/";
  xhr3.open("GETSP", url3, true);
  xhr3.setRequestHeader("Content-type", "application/json");
  xhr3.onreadystatechange = function () {
    var pb2 = xhr3.responseText;
    document.getElementById("curSearchPattern").innerHTML = pb2;
  }
  xhr3.send();
  */
}

window.onload = function (){
    xhr = new XMLHttpRequest();
    var url = "/simulate/solverLoading/";
    xhr.open("START", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.responseText == "200"){
        // All worked and solver was a success
        window.location.replace("http://127.0.0.1:8000/simulate/solverResult/");
      } else if (xhr.responseText == "ERROR"){
        // ERROR
        window.location.replace("http://127.0.0.1:8000/simulate/Error/");
        return;
      }
        
    }
    xhr.send();
}