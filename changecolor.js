
var injected = injected || (function(){
  var textsub;
  var word;
  var affectword;
  var priority = 0;
  var title = document.getElementsByTagName("title");
  var lock = 0;
  var boolnoafk = 1;
  var visible = 1;
  var timeoutafk;
  var inicialtime = 0;
  var tsbegin=0;
  var tsend = 0;
  var timestart = Date.now();
  var timeend = 0;
  var timefinal = 0;
  var timesread = 0;
  var timesreadaff = 0;
  var tempwords = "";
  var tempwordslength = 0;
  var tempaffect = "";
  var tempaffectlength = 0;
  var options = new Array();
  var primedwords = new Array();
  var primedpaffect = new Array();
  var gpvals = 0;
  var flashdur = 5;
  var flashcount = 0;
  var permcount = 0;
  var permopacity = 1.00;
  var changehtml = 0;
  var gcnonblink = 0;
  var uinonblink = new Array();
  var gcblink = 0;
  var uiblink = new Array();
  var cicleinter;
  var intertime;
  var intertime2;
  var cicletime;
  var timecicle = 800;
  var cicletime2;
  var hidden = "hidden";

  var subliminalt;

  

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
      if(request.status == "check"){
        sendResponse({status: "alive"});
          changehtml = 0;
          timefinal = timeend + Date.now() - timestart;

          if(timefinal >= 5000){
            sendData();
            timeend = timefinal = 0;
            timestart = Date.now();
          }

          clearInterval(cicleinter);

          getStage(timestarted);
      } 
    }
  );

  chrome.runtime.sendMessage({
      subject: "words_seen",
      words_seen: timesread
  });
    
  function addvisibilityevents(){
    // Standards:
    if (hidden in document)
      document.addEventListener("visibilitychange", onvisibilitychange);
    else if ((hidden = "mozHidden") in document)
      document.addEventListener("mozvisibilitychange", onvisibilitychange);
    else if ((hidden = "webkitHidden") in document)
      document.addEventListener("webkitvisibilitychange", onvisibilitychange);
    else if ((hidden = "msHidden") in document)
      document.addEventListener("msvisibilitychange", onvisibilitychange);
    
    else if ("onfocusin" in document)
      document.onfocusin = document.onfocusout = onvisibilitychange;
    
    else
      window.onpageshow = window.onpagehide
      = window.onfocus = window.onblur = onvisibilitychange;
  }

  function onvisibilitychange (e) {
    var v = 1, h = 0,
        eMap = {
          focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
        };

    e = e || window.event;
    if (e.type in eMap){
      visible = eMap[e.type];
      //if(visible == 0)
    }
    else
      if(this[hidden] == true){
        visible = 0;
        timeend += Date.now() - timestart;
        sendData();
        boolnoafk = 0;
        clearTimeout(timeoutafk);
      }
      else if(this[hidden] == false){
        visible = 1;
        boolnoafk = 1;
        timestart = Date.now();
        tsbegin = timestart;
      }
  }

   function speedreading(){
    var tempname = this.getAttribute("name").toLowerCase();
    var j = 0;
    timesread = timesread + 1;

    while(j < primedwords.length){
      if(primedwords[j][0] == tempname){
        primedwords[j][2] += 1;
        break;
      }
      j++;
    }

    chrome.runtime.sendMessage({
      subject: "words_seen",
      words_seen: timesread
    });
   }

    function speedreadingaff(){
    var tempname = this.getAttribute("name").toLowerCase();
    var j = 0;
    timesreadaff = timesreadaff + 1;

    while(j < primedpaffect.length){
      if(primedpaffect[j][0] == tempname){
        primedpaffect[j][2] += 1;
        break;
      }
      j++;
    }
   }

  function recursiveFindNReplace(tables){ //Recursive function to that gets an HTML element and checks if there is any target word amongst the element's children (starts on <body> element)
    var tables2 = tables.childNodes; //tables2 will get all children of the provided HTML element
    

    for(var i = 0; i < tables2.length; i++) { //Cicle to go through all the children
      if(tables2[i].nodeType == 3 && tables2[i].textContent != ""){ //The child needs to be of the text type in order to format the words
        newNode = document.createElement("subly"); //Creates a new element
        newNode.name = "sublychange";
        var s = tables2[i].textContent; //Grabs the text of the current child
        var sant = s; //Backup of variable s for later comparison
        //Use of this regular expression (regex) to maintain the capital letters of the words 
        //The variable word contains all the words (of a specific priority, if applied)
        var regex = new RegExp( '(' + '(?![^<>]*>)' + word + ')', 'gi' ); 
        if(reverse == 1){ //Checks if the reverse mode is enabled (by default it's not)
          s = s.replace(regex, '</subly><subly class="sublychangeword" name="$1" style="opacity: 1">'+ "$1" + '</subly><subly name="sublychange" style="opacity: ' + options[0][1] + '">');
          s = '<subly name="sublychange" style="' + cssstyle + '">' + s + '</subly>';
        }
        else{
          s = s.replace(regex, '<subly class="sublychangeword" name="$1" style="' + cssstyle + '">'+ "$1" + '</subly>'); 
          //Using the above regular expression it will find all words in the text node that are the same as the provided words
          //Note that it can find words inside other words (e.g. sea in season)
        }
        
        if(sant == s){ //Checks if it didn't found any word on the text node
          if(/\S/.test(sant) && reverse == 1){ //Checks if there is anything but whitespaces on the text node and if the reverse mode is enabled
            newNode.style.cssText = cssstyle; 
            newNode.textContent = sant;
            tables.replaceChild(newNode, tables2[i]); //Replaces the text node with the element created
          }
        }

        else if(affectword != ""){ //If a word was found
          //Use of this regular expression to maintain the capital letters of the words
          //The variable affectword contains all the positive affect words
          var regex2 = new RegExp( '(' + '(?![^<>]*>)' + affectword + ')', 'gi' ); 
          if(reverse == 1){ //Checks if the reverse mode is enabled (by default it's not)
            s = s.replace(regex2, '</subly><subly class="sublychangeaffect" name="$1" style="opacity: 1">'+ "$1" + '</subly><subly name="sublychange" style="opacity: ' + options[0][1] + '">');
          }
          else{
            s = s.replace(regex2, '<subly class="sublychangeaffect" name="$1" style="' + cssstyle + '">'+ "$1" + '</subly>');
          }

          newNode.innerHTML = s;
          if(/\S/.test(sant)) //Checks if there is anything but whitespaces on the text node
            tables.replaceChild(newNode, tables2[i]);
        }
      }
      else if(tables2[i].nodeType == 1){ //If the child is of the type element
        //Checks if the element wasn't been checked before or if it doesn't contain any scripting statements or style information
        if(tables2[i].name != "sublychange" && tables2[i].nodeName != 'SCRIPT' && tables2[i].nodeName != 'STYLE' && tables2[i].nodeName != "NOSCRIPT"){
          recursiveFindNReplace(tables2[i]); //The function calls itself again but using the child element as instead
        }
      }
    }
  }



   function flashBlink(blinkfreq, blinkdur){ //Function that changes all the cueing in the target words to a blinking state
    clearInterval(cicletime); //Clears the interval in the case of receiving new information
    for(var i = 0; i < tempwords.length; i++){
          tempwords[i].style.cssText = ""; //[Stage 1] Sets the found words back to normal 
    }
    cicletime = setInterval(function(){ //cicletime will set the interval of time between the blinks by using the blink frequency provided
      for(var i = 0; i < tempwords.length; i++){ //Will go through all the found words
        tempwords[i].style.cssText = cssstyle; //[Stage 2] Sets the found words with the type and value of change provided (e.g. opacity: 0.75)
      }
      intertime2 = setTimeout(function(){ //Waits a period of time given by the blink duration
        for(var i = 0; i < tempwords.length; i++){
          tempwords[i].style.cssText = ""; //[Stage 1] Sets the found words back to normal 
        }
      }, blinkdur);

    }, blinkfreq);
   }

   function noafk(e){
    if(boolnoafk == 0 && visible == 1){
      timestart = Date.now();
      tsbegin = timestart;
      boolnoafk = 1;
    }
    clearTimeout(timeoutafk);
    timeoutafk = setTimeout(function(){
      if(visible == 1){
        boolnoafk = 0;
        sendData();
      }
    }, 60000);
   }

  function addtimeevents(){
    timestart = Date.now();
    addEventListener("mousemove", noafk);
    addEventListener("keydown", noafk);
  }

  function addevents(){
    var tempname;
    tempwords = document.getElementsByClassName("sublychangeword");
    tempaffect = document.getElementsByClassName("sublychangeaffect");
    tempwordslength = tempwords.length;
    tempaffectlength = tempaffect.length;
    for(var i = 0; i < tempwordslength; i++){
      var j = 0;
      tempwords[i].addEventListener("mouseover", speedreading);

      

      tempname = tempwords[i].getAttribute("name").toLowerCase();
      while(j < primedwords.length){
        if(primedwords[j][0] == tempname){
          primedwords[j][1] += 1;
          break;
        }
        j++;
      }
      if(j == primedwords.length){
        primedwords[j] = new Array(3);
        primedwords[j][0] = tempname;
        primedwords[j][1] = 1;
        primedwords[j][2] = 0;
      }
      
    }
    
    for(var i=0; i<tempaffectlength; i++){
      var j = 0;
      tempaffect[i].addEventListener("mouseover", speedreadingaff);

      tempname = tempaffect[i].getAttribute("name").toLowerCase();

      while(j < primedpaffect.length){
        if(primedpaffect[j][0] == tempname){
          primedpaffect[j][1] += 1;
          break;
        }
        j++;
      }
      if(j == primedpaffect.length){
        primedpaffect[j] = new Array(3);
        primedpaffect[j][0] = tempname;
        primedpaffect[j][1] = 1;
        primedpaffect[j][2] = 0;
      }

    }


    
    chrome.runtime.sendMessage({
      subject: "words_found",
      words_found: tempwords.length
    });
   }
  
  
   

   function waitForStart(e){
    if(e.which == 83 || e.keyCode == 83){
      recursiveFindNReplace(tables1[0]);      
    }
   }

   function sendData(){
    var tsend = Date.now();
    
    if(visible == 1 && lock == 0){
      timeend += tsend - timestart;
    }
    timefinal = timeend / 1000 | 0;
    if(timefinal >= 5 && lock == 0){
      lock = 1;
      setTimeout(function(){
          lock = 0;
      }, 500);
      
      var pageinf = [tempwordslength, timesread, timefinal, tsbegin, tsend, priority, tempaffectlength, timesreadaff];
      var pageinfs = JSON.stringify(pageinf);
      
      chrome.runtime.sendMessage({
        subject: "page_data",
        page_data: pageinfs,
        word_data: JSON.stringify(primedwords),
        paffect_data: JSON.stringify(primedpaffect)
      });


      timesread = 0;
      timesreadaff = 0;
      if(visible == 1 && boolnoafk == 1){
        tempwordslength = 0;
        tempaffectlength = 0;
        
      }
      else{
        timeend = 0;
      }
      for(var i = 0; i < primedwords.length; i++){
        primedwords[i][2] = 0;
      }
      for(var i = 0; i < primedpaffect.length; i++){
        primedpaffect[i][2] = 0;
      }

    }
   }
   

   function timestarted(pvals){
    addvisibilityevents();
    priority = pvals;
    console.log(priority);
    chrome.storage.local.get(["subliminalt", "flashfreq", "flashdur", "cuetype", "cueval", "wordlist", "affectlist"], function(items){
      var wordlist = items.wordlist;
      var affectlist = items.affectlist;
      subliminalt = items.subliminalt;

      if(items.cuetype == "other"){
        cssstyle = items.cueval;
      }
      else{
        var tempcueval = items.cueval;
        if(items.cuetype == "opacity"){
          tempcueval = tempcueval / 100;
        }
        else if(items.cuetype == "font-size"){
          tempcueval = tempcueval + "%";
        }
        cssstyle = items.cuetype + ": " + tempcueval;
      }

      word = "";
      for(var i = 0; i < wordlist.length; i++){
        if(priority < 0 || wordlist[i][1] <= priority){
          if(word == ""){
            word = wordlist[i][0];
          }
          else{
            word += "|" + wordlist[i][0];
          }
        }
      }
      console.log(word);
      affectword = "";
      for(var i = 0; i < affectlist.length; i++){
        if(affectword == ""){
          affectword = affectlist[i];
        }
        else{
          affectword += "|" + affectlist[i];
        }
      }
      console.log(affectword);
    

      primedwords = [];
      paffectwords = [];
      
      tsbegin = Date.now();
      timesread = 0;
      timesreadaff = 0;
      boolnoafk = 1;
      tables3 = document.getElementsByTagName("body");
                 
      reverse = 0;
      if(word != ""){
        recursiveFindNReplace(tables3[0]);
        addevents();
        addtimeevents();
        if(subliminalt == "flash"){
          flashBlink(items.flashfreq, items.flashdur);
        }
        else if(subliminalt == "perm"){
          clearInterval(cicletime);
        }


        // select the target node
        var documento = document.getElementsByTagName('body');
        var target = documento[0];
         
        // create an observer instance
        var observer = new MutationObserver(function(mutations) {
          setTimeout(function(){ 
          mutations.forEach(function(mutation) {
            if(mutation.addedNodes.length > 0 && mutation.target != null && mutation.target.tagName != "SPAN" && mutation.target.tagName != "subly" && mutation.target.tagName != "SCRIPT" && mutation.target.tagName != "NOSCRIPT" && mutation.target.tagName != "Style"){
              OnSubtreeModified(mutation.target)
            }

          }); 
          }, 1);   
        });
         
        // configuration of the observer:
        var config = { childList: true, subtree: true};

        observer.observe(target, config);

      }
     
      window.onbeforeunload = function(){
        sendData();
      }
    });
  }

  function getStage(callback){
    chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
      callback(response.stage);
    });
  }

  function OnSubtreeModified(e){
    recursiveFindNReplace(e);
  }

  getStage(timestarted);


})();