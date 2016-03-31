var arrpairwords = new Array();
var arrpairptwords = new Array();
//var arrpairprio = "";
// Executing the changecolor.js in a tab and calling a method
function injectedMethod (tab, method, callback) { 
  console.log(method.status);
  if(method.status == "complete"){
    chrome.storage.local.get(["power", "authentication", "subuserid"], function(items){
      if(localStorage['power'] != 0){
        chrome.tabs.sendMessage(tab, {status: 'check'}, function(receive){
          if (receive){
            console.log("Already injected");
          }
          else{
            if(localStorage['authentication'] == "none"){
              //localStorage.removeItem("subuserid");
              localStorage["subuserid"] = "";
              localStorage["subpriority"] = -1;
            }
            else{
              var xhr = new XMLHttpRequest();
              xhr.open("GET", "http://evora.m-iti.org/Subly/TStudy/getpriority.php?email=" + localStorage["subuserid"], true);
              xhr.onreadystatechange = function() {
                if (xhr.readyState == this.DONE) {
                  xhr.onreadystatechange = null;
                  localStorage["subpriority"] = xhr.responseText;
                }
              }
              xhr.send();             
            }
            chrome.tabs.executeScript(tab, { file: 'changecolor.js' }, function(){
            });
          }
        });
      }
    });
  }
}

function iniVariables(){
  localStorage['power'] = 1;
  localStorage['authentication'] = "none";
  localStorage['subject'] = "";
  resetVariables();
}

function resetVariables(){
  chrome.storage.local.set({"subliminalt" : "perm", "flashfreq" : 5000, "flashdur" : 10, "cuetype" : "opacity", "cueval" : 75, "wordlist" : "", "affectlist" : ""}, function(){
    console.log("Values reset");
  });
}


function createUserId(){
  var xmlhttp = new XMLHttpRequest();
  var retry = true;
  var access_token;
  var interactive = true;
  getToken();

  
  function getToken()
  {     
      chrome.identity.getAuthToken( { 'interactive': interactive }, function (token) {
          if ( chrome.runtime.lastError )
          {
              console.log( "ERROR! " + chrome.runtime.lastError.message );
              chrome.storage.local.set({"authentication": "none", "subuserid": ""}, function(items){
                console.log("Authentication changed");
              });
              localStorage['authentication'] = "none";
              localStorage['subuserid'] = "";
              document.getElementById('authtype').value = "none";
              return;
          }
          if ( typeof token != 'undefined ')
          {
            console.log(token);
            access_token = token;
            sendRequest();
          }
      });

  }

  function sendRequest()
  {       
      xmlhttp.open('GET', 'https://www.googleapis.com/userinfo/v2/me' );
      xmlhttp.setRequestHeader('Authorization', 'Bearer ' + access_token );
      xmlhttp.onload = requestComplete;
      xmlhttp.send();
  }

  function requestComplete()
  {
      if ( this.status == 401 && retry )
      {
          retry = false; // only retry once
          console.log( "Request failed, retrying... " + this.response );
          chrome.identity.removeCachedAuthToken({"token":access_token}, function() {
            console.log("Cached token has been removed")
            getToken();
          });
      }
      else
      {
          console.log( "Request completed. ID: " + this.response );
          //callback(null, this.status, this.response );
          var userInfo = JSON.parse( this.response );
          storeUniqueKey( userInfo );


      }
  }
}

function storeUniqueKey( info )
{
    var key;

    key = info.email;
    console.log(info.email);

    chrome.storage.local.set({'subuserid':  key, "authentication": "oauth" }, function(){
      console.log("Settings saved");
    });
    localStorage['subuserid'] = key;
    localStorage['authentication'] = "oauth";
     var conid = new XMLHttpRequest();

     conid.open("GET", "http://evora.m-iti.org/Subly/TStudy/sendchromedata.php?email=" + key, true);
     conid.onreadystatechange = function() {
          if (conid.readyState == 4 && conid.status == 200) {
            console.log(conid.responseText);
          }
        }
     conid.send();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.subject === 'page_data'){
    var pageinfs = request.page_data;
    var pageinf = JSON.parse(pageinfs);
    var datebegin = new Date(pageinf[3]).toISOString().slice(0, 19).replace('T', ' ');
    var dateend = new Date(pageinf[4]).toISOString().slice(0, 19).replace('T', ' ');
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://evora.m-iti.org/Subly/TStudy/sendchromedata.php?id=" + localStorage["subuserid"] + "&twords=" + 
                    pageinf[0] + "&rwords=" + pageinf[1] + "&tactive=" + pageinf[2] + "&opentime=" + datebegin + "&closetime=" + 
                    dateend + "&priority=" + pageinf[5] + "&affectprimed=" + pageinf[6] + "&affectseen=" + pageinf[7] + "&worddata=" + 
                    request.word_data + "&paffectdata=" + request.paffect_data, true);
    xhr.onreadystatechange=function(){
      if (xhr.readyState==4 && xhr.status==200){
        console.log(xhr.responseText);
      }
    }
    xhr.send();
  }
  else if(request.subject === 'words_found'){
    localStorage["words_found"] = request.words_found;
  }
  else if(request.subject === 'words_seen'){
    localStorage["words_seen"] = request.words_seen;
  }
  else if(request.subject === 'change_id'){
    getPopupID();
  }
  else if(request.subject === 'create_user'){
    createUserId();
  }
  if(request.greeting === 'hello'){
    sendResponse( { stage:  localStorage["subpriority"] } );
  }
});

chrome.runtime.onInstalled.addListener(iniVariables);

chrome.tabs.onUpdated.addListener(injectedMethod);
