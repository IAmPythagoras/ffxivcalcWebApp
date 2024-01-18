window.setInterval(function(){
  updateProgressBar();
}, 200);


function updateProgressBar(){
  // This function updates the progress bar shown to the user.
  // It sends a request to the server every 100 ms and the server replies with a text
  // loading bar. This bar is then simply shown to the user.

  xhr = new XMLHttpRequest();
  var url = "/simulate/simulatorLoading/";
  xhr.open("GETPB", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function () {
    var pb = xhr.responseText;
    document.getElementById("progressBar").innerHTML = pb;
  }
  xhr.send();
}

window.onload = function (){
    alert("hello");
    xhr = new XMLHttpRequest();
    var url = "/simulate/simulatorLoading/";
    xhr.open("START", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.responseText == "200"){
        // All worked and solver was a success
        window.location.replace("http://127.0.0.1:8000/simulate/solverResult/");
      } else if (xhr.responseText == "ERROR"){
        // ERROR
        //window.location.replace("http://127.0.0.1:8000/simulate/Error/");
        return;
      }
        
    }
    xhr.send();
}