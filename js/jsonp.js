'use strict'
function json2url(json){
	var arr = [];
	for(var name in json){
		arr.push(name+'='+json[name]);
	}
	return arr.join('&');
}
function jsonp(json){
	json = json||{};
	if(!json.url)return;
	json.timeout = json.timeout||15000;
	json.cbName = json.cbName||'cb';
	json.data = json.data||{};
	json.data[json.cbName] = 'show'+Math.random();
	json.data[json.cbName] = json.data[json.cbName].replace('.','');
	
	json.timer = setTimeout(function(){
		window[json.data[json.cbName]] = function(res){
			oHead.removeChild(oS);
			json.error&&json.error('网络超时!');
		}
	},json.timeout);
	
	window[json.data[json.cbName]] = function(res){
		clearTimeout(json.timer);
		oHead.removeChild(oS);
		json.success&&json.success(res);
	}
	var oHead = document.getElementsByTagName('head')[0];
	var oS = document.createElement('script');
	oS.src = json.url+'?'+json2url(json.data);
	oHead.appendChild(oS);
}























