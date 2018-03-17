chrome.browserAction.onClicked.addListener(function(tab) { 
	alert();
	//////////////////////////////////////Google Analytics////////////////////////////////////  
});
/////////////////////events///////////////////////////
$(document).ready(function(){
	(function(i,s,o,g,r,a,m)
	{
		i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-97189820-2', 'auto');
	ga('send', 'pageview');
	////////////////////////////////////////////////////////////////////////////////
    var accessToken = "326a6c78dc86439ba21c9cf3cb8a0cf0";
    var timevocal = 0;
    var baseUrl = "https://api.api.ai/v1/";
    var talking = true;
    var nlp = window.nlp_compromise;
    var recognition;
    var txt;
    var voicetrigger;
    startRecognition();
    checkOnline(); 

    //first time when application will be loaded
    chrome.runtime.setUninstallURL("https://goo.gl/forms/7EIjOCgMqZSAsIj92", function(){
    });

    chrome.storage.local.get(/* String or Array */["firsttime"], function(items2){
        if(items2.firsttime === undefined || items2.firsttime === 2){
			chrome.storage.local.set({ "firsttime": 3 }, function(){
				chrome.tabs.create({'url': 'chrome://newtab'});
				chrome.tabs.create({'url': '/man.html#html1-structure'});
			});
        }
	});
/*var tabid=0;
     chrome.tabs.onHighlighted.addListener(function(hi){
      console.log(hi.tabIds[0]);
       tabid=hi.tabIds[0];
       myfun();
     });
     selectionontab="";
   function myfun(){
      if(tabid!=0){
      chrome.tabs.executeScript(tabid,{
          code: "window.getSelection().toString();"
        },function(selection){
          if(selectionontab!=selection[0]){
            console.log(selectionontab);
           // Speech(selection[0]);
            selectionontab=selection[0];
            myfun();
          }
          else
            myfun();
        }
        );
    } 
    }*/

     //function for giving sleep 
    function sleep(milliseconds) {
		var start = new Date().getTime();
		for (var i = 0; i < 1e7; i++) {
			if ((new Date().getTime() - start) > milliseconds){
				break;
			}
		}
	}
// check if browser if online or offline
	var offline = false;
	checkOnline(); 
	function checkOnline() {
		if (!navigator.onLine && !offline) {
			offline = true;
			chrome.storage.local.set({ "onoffswitch": "false"}, function(){});             
		}
		if (navigator.onLine) {
			offline = false;
		}
		setTimeout(checkOnline, 1000);
	}
//function for recognition
    function startRecognition() {
		chrome.storage.local.get(/* String or Array */["onoffswitch"], function(items){
			if(items.onoffswitch === "true"){
				recognition = new webkitSpeechRecognition();
				recognition.onstart = function(event) {
					updateRec();
				};  
				var text = "";
				recognition.onresult = function(event) {
					for (var i = event.resultIndex; i < event.results.length; ++i) {
						text += event.results[i][0].transcript;
					}
					//setInput(text);
					//stopRecognition();
				};
				recognition.onend = function() {
					chrome.storage.local.get(/* String or Array */["trigger"], function(items2){
						if(text.toLowerCase() === items2.trigger.toLowerCase()){
							// alert(text);
							Speech("Yes Sir. How can I help you?");
							sleep(1500);
							/*chrome.storage.local.clear(function() {
							var error = chrome.runtime.lastError;
							if (error) {
							console.error(error);
							}
							});*/
							recognition.stop();
							startRecognitionaftertrigger();
						}
						else
							if(text.toLowerCase().startsWith(items2.trigger.toLowerCase())){
								var str = text.toLowerCase().replace(items2.trigger.toLowerCase()+" ","");
								setInput(str);
								recognition.stop();
								startRecognition();
							}
							else 
							{
								recognition.stop();
								startRecognition();
							}
					});
					// stopRecognition();
				};
				recognition.lang = "en-IN";
				recognition.start();
			} 
			else{ 
				startRecognition();
			}
		});
    }
    //start recognition after trigger
	function startRecognitionaftertrigger(){
		recognition = new webkitSpeechRecognition();
		recognition.onstart = function(event) {
			//updateRec();
		};  
		var text = "";
		recognition.onresult = function(event) {
			for (var i = event.resultIndex; i < event.results.length; ++i) {
				text += event.results[i][0].transcript;
			}
			//setInput(text);
          
			//stopRecognition();
		};
		recognition.onend = function() {
			if(text === ""){
				recognition.stop();
				startRecognition();
			}
			else{
				recognition.stop();
				setInput(text);
				startRecognition();
			}
		};
		recognition.lang = "en-IN";
		recognition.start();
	}
	//to stop recognition
    function stopRecognition() {
		if (recognition) {
			recognition.stop();
			recognition = null;
		}
		// updateRec();
    }
    //to switch 
    function switchRecognition() {
		if (recognition) {
			stopRecognition();
		} 
		else {
			startRecognition();
		}
    }
    //to set input 
    function setInput(text) {
		txt = text;
		send();
    }
    function updateRec() {
		
    }
    //sending the data to server
    function send() {
		
		if((txt.indexOf('.com') == -1) && (txt.indexOf('.in') == -1) && (txt.indexOf('.org') == -1) && (txt.indexOf('.io') == -1) && (txt.indexOf('.io') == -1)){
		$.ajax({
			type: "POST",
			url: baseUrl + "query?v=20150910",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			headers: {
				"Authorization": "Bearer " + accessToken
			},
			data: JSON.stringify({ query: txt, lang: "en", sessionId: "somerandomthing" }),
			success: function(data) {
	
				if(data.result.metadata.intentName === "call me"){
					chrome.storage.local.set({ "username": data.result.parameters.any }, function(){
					//  Data's been saved boys and girls, go on home
					});
				}
				else if(data.result.metadata.intentName === "hello"){
					Speech("Hello "+chrome.storage.local.get(/* String or Array */["username"]));
				}
				else if(data.result.metadata.intentName === "wiki "){
					var item = data.result.parameters.any
					chrome.tabs.create({'url':'https://www.youtube.com/results?search_query='+ data.result.parameters.any });
					/*for (var i=0;i<item.length;i++)
					{
						if(item[i]===' ')
							item[i]='_';
						if(i===0||item[i-1]==='_')
						{			
							if(item[i]===item[i].toLowerCase())
								item[i]=item[i].toUpperCase();		
						}
					}*/
					//chrome.tabs.create({'url':'https://en.wikipedia.org/wiki/'+ searchWiki(item) });
				}
				else if(data.result.metadata.intentName === "youtube search"){
					chrome.tabs.create({'url':'https://www.youtube.com/results?search_query='+ data.result.parameters.any });
				}
				
				if(data.result.fulfillment.speech !== 'i am searching this on google'){
					var speech =  data.result.fulfillment.speech;
					if(data.result.fulfillment.speech === '@time'){
						var now = new Date($.now());
						var ampm = (now.getHours() >= 12) ? "PM" : "AM";
						var time = now.getHours()-12+":"+now.getMinutes()+" "+ampm;
						timevocal = 1;
						Speech(time);
					}
					else{
						if((speech.indexOf('.com') != -1) || (speech.indexOf('.in') != -1) || (speech.indexOf('.org') !== -1) || (speech.indexOf('.io') != -1)){
							Speech("opening. Sir");
							chrome.tabs.create({'url':'http://'+speech});
						}
						else if(data.result.fulfillment.speech === '@close'){
								chrome.tabs.getSelected(null, function(tab) {
									tab = tab.id;
									chrome.tabs.remove(tab,function(){});
									tabUrl = tab.url;
									//alert(tab.url);
								});
								Speech("closing tab. Sir");
						}
						else if (data.result.fulfillment.speech === '@refresh') {
								chrome.tabs.reload();
								Speech("reloading");
						}
						else if(data.result.fulfillment.speech === '@exit'){
								Speech("closing the window. Sir");
								setTimeout(function(){}, 500); 
								chrome.tabs.query({}, function (tabs) {
									for (var i = 0; i < tabs.length; i++) {
										chrome.tabs.remove(tabs[i].id);
									}
								});
						}
						else if (data.result.fulfillment.speech === '@bookmark') {           
							chrome.tabs.getSelected(function(tab) { //<-- "tab" has all the information
								chrome.bookmarks.create({ 'title': tab.title,'url': tab.url});
							});
							Speech("I have added this page to favourites");
						}
						else if(data.result.fulfillment.speech === '@keepthis'){
							Speech("closing , Sir");
							var currenttab;
							chrome.tabs.getSelected(null, function(tab) {
								currenttab = tab.id;
								chrome.tabs.query({}, function (tabs) {
									for (var i = 0; i < tabs.length; i++) {
										if(tabs[i].id == currenttab){
											continue;
										}
										chrome.tabs.remove(tabs[i].id);
									}
								});
							});
						}
						else if(data.result.fulfillment.speech === '@open'){
							Speech("opening");
							chrome.tabs.create({'url': 'chrome://newtab'});
						}
						else if(data.result.fulfillment.speech === "@downloads"){
							chrome.tabs.create({'url': 'chrome://downloads'});
							alert(data.result.fulfillment.speech);
							Speech("opening! Downloads");
						}
						else if(data.result.fulfillment.speech === "@next"){
							var currenttab;
							chrome.tabs.getSelected(null, function(tab) {
								currenttab = tab.id;										
								chrome.tabs.query({}, function (tabs) {
									for (var i = 0; i < tabs.length; i++) {
										if(tabs[i].id == currenttab){
											chrome.tabs.update(tabs[(i+1)%tabs.length].id, { active: true});
										}
									}
								});
							});
							Speech("opening! next");
						}
						else if(data.result.metadata.intentName === "setting")
						{
							chrome.tabs.create({'url': 'chrome://settings/'});
							Speech("opening! Settings.");
						}
						else if(data.result.metadata.intentName === "open history")
						{
							chrome.tabs.create({'url': 'chrome://history/'});
							Speech("opening! History.");
						}
						else if((idx = (txt.toLowerCase()).lastIndexOf("translate".toLowerCase())) !==-1)
					{
						alert(txt);
						var speak=txt.substring(txt.indexOf(" ")+1,txt.length);
						chrome.tabs.create({
                      'url': 'https://translate.google.com/#auto/hi/'+speak
                 		 });
					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("inbox".toLowerCase())) !==-1)
					{
						Speech("Opening your gmail account.");
						chrome.tabs.create({'url':'https://www.gmail.com/'});
					}

						else if(data.result.fulfillment.speech === "@prev"){
							var currenttab;
							chrome.tabs.getSelected(null, function(tab) {
								currenttab = tab.id;
								chrome.tabs.query({}, function (tabs) {
									for (var i = 0; i < tabs.length; i++) {
										if(tabs[i].id == currenttab){
											chrome.tabs.update(tabs[i-1].id, { active: true});
										}
									}
								});
							});
							Speech("opening! prev");
						}
						else {
							if(data.result.metadata.intentName === "users_name"){
								chrome.storage.local.get(/* String or Array */["username"], function(items){
								if(items.username === undefined ){
									Speech("you didn't told me your name Yet . Please Tell me your name . ");
								}
								else
									Speech(speech+" "+items.username);
								});
						
							}
							else{ 
								Speech(speech+" in else");
								alert(data.result.fulfillment.speech+" "+data.result.metadata.intentName);
							}
						}
					}
				}
				else {
					//setResponse(data.result.fulfillment.speech);
					
					var idx;
					if((idx = (txt.toLowerCase()).lastIndexOf("Wikipedia".toLowerCase())) !==-1)
					{
						Speech("I am searching this on wikipedia.");
						var tmp=txt.substring(0,idx-1);
						alert(data.result.metadata.intentName+" "+txt+" "+tmp);
						for (var i=0;i<tmp.length;i++)
						{
							if(tmp[i]===' ')
								tmp[i]='_';
							if(i===0||tmp[i-1]==='_')
							{			
								
								tmp[i]=tmp[i].toUpperCase();		
							}
						}
						chrome.tabs.create({'url': 'https://en.wikipedia.org/wiki/'+tmp});
						
					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("capture screen".toLowerCase())) !==-1)
						{
							alert(txt);
						
						}
					else if((idx = (txt.toLowerCase()).lastIndexOf("change background".toLowerCase())) !==-1)
					{
						var c="document.body.style.background=";
						//var mySplitResult = myString.split(" ");

						var last =  txt.lastIndexOf(" ") ;
						var lastWord = txt.substring(last+1,txt.length);
						c+="'"+lastWord+"';";
						alert(c);
						chrome.tabs.executeScript({
							code: c
							});
					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("print".toLowerCase())) !==-1)
					{
						alert(txt);
						chrome.tabs.executeScript({
							code: "window.print()"
							});
						/*chrome.tabs.executeScript({
							file: "capture.js"
							});*/
					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("halt".toLowerCase())) !==-1)
					{
						alert(txt);
						chrome.tabs.executeScript({
							code: "var v=document.getElementsByTagName('video')[0]; v.pause();" 
							});
					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("play".toLowerCase())) !==-1)
					{
						alert(txt);
						chrome.tabs.executeScript({
							code: "var v=document.getElementsByTagName('video')[0]; v.play();" 
							});

					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("next video".toLowerCase())) !==-1)
					{
						alert(txt);
						chrome.tabs.executeScript({
							code: "var nbtn=document.getElementsByClassName('ytp-next-button')[0]; nbtn.click();" 
							});

					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("translate".toLowerCase())) !==-1)
					{
						alert(txt);
						var speak=txt.substring(txt.indexOf(" ")+1,txt.length);
						chrome.tabs.create({
                      'url': 'https://translate.google.com/#auto/hi/'+speak
                 		 });
					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("inbox".toLowerCase())) !==-1)
					{
						Speech("Opening your gmail account.");
						chrome.tabs.create({'url':'https://www.gmail.com/'});
					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("incognito".toLowerCase())) !==-1)
					{
						Speech("Opening incognito window.");
						chrome.windows.create({incognito:true,});
						
					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("weather".toLowerCase())) !==-1)
					{
						alert(txt);
						weather(txt.substring(txt.indexOf(" "),txt.length));
					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("link".toLowerCase())) !==-1)
					{
						alert(txt);
						var p=txt.substring(txt.indexOf(" ")+1,txt.length)
						var num=0;
						if(p==="to")
							num= 2;
						else 
							num=parseInt(p);
						chrome.tabs.executeScript({code:'var p=document.getElementsByClassName("r");var q=p['+num+'].getElementsByTagName("a");var r=q[0].href;window.open(r);'});
					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("minimise".toLowerCase())) !==-1)
					{
						Speech("Minimizing window.");
						chrome.windows.getCurrent(function func(my_window){
							chrome.windows.update(my_window.id,{state:"minimized"},function(windowUpdated){
								
							})
						});
					}
					else if((idx = (txt.toLowerCase()).lastIndexOf("maximize".toLowerCase())) !==-1)
					{
						Speech("Maximizing window.");
					chrome.windows.getCurrent(function func(my_window){
							chrome.windows.update(my_window.id,{state:"maximized"},function(windowUpdated){
								
							})
						});
					}
					else if((idx = (txt.toLowerCase()).indexOf("tab".toLowerCase())) !==-1)
					{
						var integer = parseInt(txt.substring(4));
						Speech("Moving to tab"+integer);
						chrome.tabs.query({}, function (tabs) {
								chrome.tabs.update(tabs[integer-1].id, { active: true});
							});
					}
					/*else if((idx = (txt.toLowerCase()).lastIndexOf("@settings".toLowerCase())) !==-1)
					{
						Speech("Opening your settings.");
						chrome.tabs.create({'url':'chrome://settings/'});
					}*/
					else
					{
						setResponse(data.result.fulfillment.speech);
						chrome.tabs.create({'url': 'http://google.com/search?q='+txt});					
						chrome.tabs.executeScript({
							code: "document.getElementsByClassName('_XWk')[0].innerHTML;"
							},function(selection){//_XW//alert(selection[0]);
								if(selection[0]===null){
									chrome.tabs.executeScript({
										code:"var rex = /(<([^>]+)>)/ig; document.getElementsByClassName('_Tgc')[0].innerHTML.replace(rex,'').split('.')[0];"
									},function(sl){
										if(sl[0]===null){
											chrome.tabs.executeScript({
												code:"var rex = /(<([^>]+)>)/ig; document.getElementsByClassName('st')[0].innerHTML.replace(rex,'').split('.')[0];"
											},function(sl2){
												Speech("According to Google "+sl2[0]);
											});
										}
										else
											Speech("According to Google "+sl[0]);
									});
								}
								else
									Speech(selection[0]); 
							}
						);
				    }
				}
			},
			error: function() {
				setResponse("Sorry ! we are having some internal problem. Please Try again.");
			}
			});
		}
		else{
			Speech("opening");
			chrome.tabs.create({'url': "http://www."+txt });
		}
    }
    function setResponse(val) {
      Speech(val);
    }
    //to speech 
    function Speech(say) {
		if ('speechSynthesis' in window && talking) {
			var language = window.navigator.userLanguage || window.navigator.language;
			var utterance = new SpeechSynthesisUtterance(say);
			//msg.voice = voices[10]; // Note: some voices don't support altering params
			//msg.voiceURI = 'native';
			if(timevocal == 1){
				utterance.volume = 1; // 0 to 1
				utterance.pitch = 0; //0 to 2
				utterance.voiceURI = 'native';
				utterance.lang = "en-IN";
				speechSynthesis.speak(utterance);
				timevocal=0
			}
			else{
				utterance.volume = 1; // 0 to 1
				utterance.rate = 0.9; // 0.1 to 10
				utterance.pitch = 1; //0 to 2
				//utterance.text = 'Hello World';
				utterance.voiceURI = 'native';
				utterance.lang = "en-IN";
				speechSynthesis.speak(utterance);
			}
		}
	}


  function processIt(data) {
      var temperature = parseInt(data.main.temp - 273.15);
      var humidity = parseInt(data.main.humidity);
      var windSpeed = parseInt(data.wind.speed);
      var cloudsDescription = data.weather[0].description;
      var temperatureString = "Present temperature is around  " + temperature+" degree celsius";
      var humidityString = "with humidity: " + humidity+"%";
      var windSpeedString = "and wind speed :" + windSpeed+ "Kilometer per hour";
      var cloudsDescriptionString = "sky seems " + cloudsDescription;

      var weather_response = temperatureString + ', ' +
          humidityString + ', ' +
          windSpeedString + ', ' +
          cloudsDescriptionString;

      setResponse(weather_response);
      alert(weather_response);

      if(debug){
        alert("temperature is  "+temperature);
        alert("humidity is "+humidity);
        alert("wind speed is "+windSpeed);
        alert("sky description "+cloudsDescription);   
      }
  }

  function weather(city) {
      var baseUrl = "http://api.openweathermap.org/data/2.5/weather?q=";
      var key = "ec58b4518e2a455913f8e64a7ac16248";
      var Url = baseUrl + city + "&APPID=" + key;

      $.getJSON(Url, function(dataJson) {
          var data = JSON.stringify(dataJson);
          var parsedData = JSON.parse(data);
          processIt(parsedData);
      });
  }


});

