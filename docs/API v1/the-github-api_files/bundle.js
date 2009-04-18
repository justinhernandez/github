;(function($){$.fn.extend({autocomplete:function(urlOrData,options){var isUrl=typeof urlOrData=="string";options=$.extend({},$.Autocompleter.defaults,{url:isUrl?urlOrData:null,data:isUrl?null:urlOrData,delay:isUrl?$.Autocompleter.defaults.delay:10,max:options&&!options.scroll?10:150},options);options.highlight=options.highlight||function(value){return value;};return this.each(function(){new $.Autocompleter(this,options);});},result:function(handler){return this.bind("result",handler);},search:function(handler){return this.trigger("search",[handler]);},flushCache:function(){return this.trigger("flushCache");},setOptions:function(options){return this.trigger("setOptions",[options]);},unautocomplete:function(){return this.trigger("unautocomplete");}});$.Autocompleter=function(input,options){var KEY={UP:38,DOWN:40,DEL:46,TAB:9,RETURN:13,ESC:27,COMMA:188,PAGEUP:33,PAGEDOWN:34};var $input=$(input).attr("autocomplete","off").addClass(options.inputClass);var timeout;var previousValue="";var cache=$.Autocompleter.Cache(options);var hasFocus=0;var lastKeyPressCode;var config={mouseDownOnSelect:false};var select=$.Autocompleter.Select(options,input,selectCurrent,config);$input.keydown(function(event){lastKeyPressCode=event.keyCode;switch(event.keyCode){case KEY.UP:event.preventDefault();if(select.visible()){select.prev();}else{onChange(0,true);}
break;case KEY.DOWN:event.preventDefault();if(select.visible()){select.next();}else{onChange(0,true);}
break;case KEY.PAGEUP:event.preventDefault();if(select.visible()){select.pageUp();}else{onChange(0,true);}
break;case KEY.PAGEDOWN:event.preventDefault();if(select.visible()){select.pageDown();}else{onChange(0,true);}
break;case options.multiple&&$.trim(options.multipleSeparator)==","&&KEY.COMMA:case KEY.TAB:case KEY.RETURN:if(selectCurrent()){event.preventDefault();}
break;case KEY.ESC:select.hide();break;default:clearTimeout(timeout);timeout=setTimeout(onChange,options.delay);break;}}).keypress(function(){}).focus(function(){hasFocus++;}).blur(function(){hasFocus=0;if(!config.mouseDownOnSelect){hideResults();}}).click(function(){if(hasFocus++>1&&!select.visible()){onChange(0,true);}}).bind("search",function(){var fn=(arguments.length>1)?arguments[1]:null;function findValueCallback(q,data){var result;if(data&&data.length){for(var i=0;i<data.length;i++){if(data[i].result.toLowerCase()==q.toLowerCase()){result=data[i];break;}}}
if(typeof fn=="function")fn(result);else $input.trigger("result",result&&[result.data,result.value]);}
$.each(trimWords($input.val()),function(i,value){request(value,findValueCallback,findValueCallback);});}).bind("flushCache",function(){cache.flush();}).bind("setOptions",function(){$.extend(options,arguments[1]);if("data"in arguments[1])
cache.populate();}).bind("unautocomplete",function(){select.unbind();$input.unbind();});function selectCurrent(){var selected=select.selected();if(!selected)
return false;var v=selected.result;previousValue=v;if(options.multiple){var words=trimWords($input.val());if(words.length>1){v=words.slice(0,words.length-1).join(options.multipleSeparator)+options.multipleSeparator+v;}
v+=options.multipleSeparator;}
$input.val(v);hideResultsNow();$input.trigger("result",[selected.data,selected.value]);return true;}
function onChange(crap,skipPrevCheck){if(lastKeyPressCode==KEY.DEL){select.hide();return;}
var currentValue=$input.val();if(!skipPrevCheck&&currentValue==previousValue)
return;previousValue=currentValue;currentValue=lastWord(currentValue);if(currentValue.length>=options.minChars){$input.addClass(options.loadingClass);if(!options.matchCase)
currentValue=currentValue.toLowerCase();request(currentValue,receiveData,hideResultsNow);}else{stopLoading();select.hide();}};function trimWords(value){if(!value){return[""];}
var words=value.split($.trim(options.multipleSeparator));var result=[];$.each(words,function(i,value){if($.trim(value))
result[i]=$.trim(value);});return result;}
function lastWord(value){if(!options.multiple)
return value;var words=trimWords(value);return words[words.length-1];}
function autoFill(q,sValue){if(options.autoFill&&(lastWord($input.val()).toLowerCase()==q.toLowerCase())&&lastKeyPressCode!=8){$input.val($input.val()+sValue.substring(lastWord(previousValue).length));$.Autocompleter.Selection(input,previousValue.length,previousValue.length+sValue.length);}};function hideResults(){clearTimeout(timeout);timeout=setTimeout(hideResultsNow,200);};function hideResultsNow(){select.hide();clearTimeout(timeout);stopLoading();if(options.mustMatch){$input.search(function(result){if(!result)$input.val("");});}};function receiveData(q,data){if(data&&data.length&&hasFocus){stopLoading();select.display(data,q);autoFill(q,data[0].value);select.show();}else{hideResultsNow();}};function request(term,success,failure){if(!options.matchCase)
term=term.toLowerCase();var data=cache.load(term);if(data&&data.length){success(term,data);}else if((typeof options.url=="string")&&(options.url.length>0)){var extraParams={};$.each(options.extraParams,function(key,param){extraParams[key]=typeof param=="function"?param():param;});$.ajax({mode:"abort",port:"autocomplete"+input.name,dataType:options.dataType,url:options.url,data:$.extend({q:lastWord(term),limit:options.max},extraParams),success:function(data){var parsed=options.parse&&options.parse(data)||parse(data);cache.add(term,parsed);success(term,parsed);}});}else{failure(term);}};function parse(data){var parsed=[];var rows=data.split("\n");for(var i=0;i<rows.length;i++){var row=$.trim(rows[i]);if(row){row=row.split("|");parsed[parsed.length]={data:row,value:row[0],result:options.formatResult&&options.formatResult(row,row[0])||row[0]};}}
return parsed;};function stopLoading(){$input.removeClass(options.loadingClass);};};$.Autocompleter.defaults={inputClass:"ac_input",resultsClass:"ac_results",loadingClass:"ac_loading",minChars:1,delay:400,matchCase:false,matchSubset:true,matchContains:false,cacheLength:10,max:100,mustMatch:false,extraParams:{},selectFirst:true,formatItem:function(row){return row[0];},autoFill:false,width:0,multiple:false,multipleSeparator:", ",highlight:function(value,term){return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("+term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,"\\$1")+")(?![^<>]*>)(?![^&;]+;)","gi"),"<strong>$1</strong>");},scroll:true,scrollHeight:180,attachTo:'body'};$.Autocompleter.Cache=function(options){var data={};var length=0;function matchSubset(s,sub){if(!options.matchCase)
s=s.toLowerCase();var i=s.indexOf(sub);if(i==-1)return false;return i==0||options.matchContains;};function add(q,value){if(length>options.cacheLength){flush();}
if(!data[q]){length++;}
data[q]=value;}
function populate(){if(!options.data)return false;var stMatchSets={},nullData=0;if(!options.url)options.cacheLength=1;stMatchSets[""]=[];for(var i=0,ol=options.data.length;i<ol;i++){var rawValue=options.data[i];rawValue=(typeof rawValue=="string")?[rawValue]:rawValue;var value=options.formatItem(rawValue,i+1,options.data.length);if(value===false)
continue;var firstChar=value.charAt(0).toLowerCase();if(!stMatchSets[firstChar])
stMatchSets[firstChar]=[];var row={value:value,data:rawValue,result:options.formatResult&&options.formatResult(rawValue)||value};stMatchSets[firstChar].push(row);if(nullData++<options.max){stMatchSets[""].push(row);}};$.each(stMatchSets,function(i,value){options.cacheLength++;add(i,value);});}
setTimeout(populate,25);function flush(){data={};length=0;}
return{flush:flush,add:add,populate:populate,load:function(q){if(!options.cacheLength||!length)
return null;if(!options.url&&options.matchContains){var csub=[];for(var k in data){if(k.length>0){var c=data[k];$.each(c,function(i,x){if(matchSubset(x.value,q)){csub.push(x);}});}}
return csub;}else
if(data[q]){return data[q];}else
if(options.matchSubset){for(var i=q.length-1;i>=options.minChars;i--){var c=data[q.substr(0,i)];if(c){var csub=[];$.each(c,function(i,x){if(matchSubset(x.value,q)){csub[csub.length]=x;}});return csub;}}}
return null;}};};$.Autocompleter.Select=function(options,input,select,config){var CLASSES={ACTIVE:"ac_over"};var listItems,active=-1,data,term="",needsInit=true,element,list;function init(){if(!needsInit)
return;element=$("<div/>").hide().addClass(options.resultsClass).css("position","absolute").appendTo(options.attachTo);list=$("<ul>").appendTo(element).mouseover(function(event){if(target(event).nodeName&&target(event).nodeName.toUpperCase()=='LI'){active=$("li",list).removeClass(CLASSES.ACTIVE).index(target(event));$(target(event)).addClass(CLASSES.ACTIVE);}}).click(function(event){$(target(event)).addClass(CLASSES.ACTIVE);select();input.focus();return false;}).mousedown(function(){config.mouseDownOnSelect=true;}).mouseup(function(){config.mouseDownOnSelect=false;});if(options.width>0)
element.css("width",options.width);needsInit=false;}
function target(event){var element=event.target;while(element&&element.tagName!="LI")
element=element.parentNode;if(!element)
return[];return element;}
function moveSelect(step){listItems.slice(active,active+1).removeClass();movePosition(step);var activeItem=listItems.slice(active,active+1).addClass(CLASSES.ACTIVE);if(options.scroll){var offset=0;listItems.slice(0,active).each(function(){offset+=this.offsetHeight;});if((offset+activeItem[0].offsetHeight-list.scrollTop())>list[0].clientHeight){list.scrollTop(offset+activeItem[0].offsetHeight-list.innerHeight());}else if(offset<list.scrollTop()){list.scrollTop(offset);}}};function movePosition(step){active+=step;if(active<0){active=listItems.size()-1;}else if(active>=listItems.size()){active=0;}}
function limitNumberOfItems(available){return options.max&&options.max<available?options.max:available;}
function fillList(){list.empty();var max=limitNumberOfItems(data.length);for(var i=0;i<max;i++){if(!data[i])
continue;var formatted=options.formatItem(data[i].data,i+1,max,data[i].value,term);if(formatted===false)
continue;var li=$("<li>").html(options.highlight(formatted,term)).addClass(i%2==0?"ac_event":"ac_odd").appendTo(list)[0];$.data(li,"ac_data",data[i]);}
listItems=list.find("li");if(options.selectFirst){listItems.slice(0,1).addClass(CLASSES.ACTIVE);active=0;}
list.bgiframe();}
return{display:function(d,q){init();data=d;term=q;fillList();},next:function(){moveSelect(1);},prev:function(){moveSelect(-1);},pageUp:function(){if(active!=0&&active-8<0){moveSelect(-active);}else{moveSelect(-8);}},pageDown:function(){if(active!=listItems.size()-1&&active+8>listItems.size()){moveSelect(listItems.size()-1-active);}else{moveSelect(8);}},hide:function(){element&&element.hide();active=-1;},visible:function(){return element&&element.is(":visible");},current:function(){return this.visible()&&(listItems.filter("."+CLASSES.ACTIVE)[0]||options.selectFirst&&listItems[0]);},show:function(){var offset=$(input).offset();element.css({width:typeof options.width=="string"||options.width>0?options.width:$(input).width(),top:offset.top+input.offsetHeight,left:offset.left}).show();if(options.scroll){list.scrollTop(0);list.css({maxHeight:options.scrollHeight,overflow:'auto'});if($.browser.msie&&typeof document.body.style.maxHeight==="undefined"){var listHeight=0;listItems.each(function(){listHeight+=this.offsetHeight;});var scrollbarsVisible=listHeight>options.scrollHeight;list.css('height',scrollbarsVisible?options.scrollHeight:listHeight);if(!scrollbarsVisible){listItems.width(list.width()-parseInt(listItems.css("padding-left"))-parseInt(listItems.css("padding-right")));}}}},selected:function(){var selected=listItems&&listItems.filter("."+CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);return selected&&selected.length&&$.data(selected[0],"ac_data");},unbind:function(){element&&element.remove();}};};$.Autocompleter.Selection=function(field,start,end){if(field.createTextRange){var selRange=field.createTextRange();selRange.collapse(true);selRange.moveStart("character",start);selRange.moveEnd("character",end);selRange.select();}else if(field.setSelectionRange){field.setSelectionRange(start,end);}else{if(field.selectionStart){field.selectionStart=start;field.selectionEnd=end;}}
field.focus();};})(jQuery);(function($){$.fn.bgIframe=$.fn.bgiframe=function(s){if($.browser.msie&&/6.0/.test(navigator.userAgent)){s=$.extend({top:'auto',left:'auto',width:'auto',height:'auto',opacity:true,src:'javascript:false;'},s||{});var prop=function(n){return n&&n.constructor==Number?n+'px':n;},html='<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+s.src+'"'+'style="display:block;position:absolute;z-index:-1;'+
(s.opacity!==false?'filter:Alpha(Opacity=\'0\');':'')+'top:'+(s.top=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')':prop(s.top))+';'+'left:'+(s.left=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')':prop(s.left))+';'+'width:'+(s.width=='auto'?'expression(this.parentNode.offsetWidth+\'px\')':prop(s.width))+';'+'height:'+(s.height=='auto'?'expression(this.parentNode.offsetHeight+\'px\')':prop(s.height))+';'+'"/>';return this.each(function(){if($('> iframe.bgiframe',this).length==0)
this.insertBefore(document.createElement(html),this.firstChild);});}
return this;};})(jQuery);jQuery.cookie=function(name,value,options){if(typeof value!='undefined'){options=options||{};if(value===null){value='';options.expires=-1;}
var expires='';if(options.expires&&(typeof options.expires=='number'||options.expires.toUTCString)){var date;if(typeof options.expires=='number'){date=new Date();date.setTime(date.getTime()+(options.expires*24*60*60*1000));}else{date=options.expires;}
expires='; expires='+date.toUTCString();}
var path=options.path?'; path='+(options.path):'';var domain=options.domain?'; domain='+(options.domain):'';var secure=options.secure?'; secure':'';document.cookie=[name,'=',encodeURIComponent(value),expires,path,domain,secure].join('');}else{var cookieValue=null;if(document.cookie&&document.cookie!=''){var cookies=document.cookie.split(';');for(var i=0;i<cookies.length;i++){var cookie=jQuery.trim(cookies[i]);if(cookie.substring(0,name.length+1)==(name+'=')){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break;}}}
return cookieValue;}};jQuery.fn.corner=function(options){var settings={tl:{radius:8},tr:{radius:8},bl:{radius:8},br:{radius:8},antiAlias:true,autoPad:true,validTags:["div"]};if(options&&typeof(options)!='string')
jQuery.extend(settings,options);return this.each(function(){new curvyObject(settings,this).applyCorners();});};function curvyObject(){this.box=arguments[1];this.settings=arguments[0];this.topContainer=null;this.bottomContainer=null;this.masterCorners=new Array();this.contentDIV=null;var boxHeight=$(this.box).css("height");var boxWidth=$(this.box).css("width");var borderWidth=$(this.box).css("borderTopWidth");var bgImage=$(this.box).css("backgroundImage");var boxPosition=$(this.box).css("position");var boxPaddingTop=$(this.box).css("paddingTop");var boxPaddingBottom=$(this.box).css("paddingBottom");var boxPaddingLeft=$(this.box).css("paddingLeft");var boxPaddingRight=$(this.box).css("paddingRight");this.boxPaddingTop=strip_px(boxPaddingTop);this.boxPaddingBottom=strip_px(boxPaddingBottom);this.boxPaddingLeft=strip_px(boxPaddingLeft);this.boxPaddingRight=strip_px(boxPaddingRight);this.borderColour=format_colour($(this.box).css("borderTopColor"));this.boxColour=format_colour($(this.box).css("backgroundColor"));this.boxHeight=parseInt(((boxHeight!=""&&boxHeight!="auto"&&boxHeight.indexOf("%")==-1)?boxHeight.substring(0,boxHeight.indexOf("px")):this.box.scrollHeight));this.boxWidth=parseInt(((boxWidth!=""&&boxWidth!="auto"&&boxWidth.indexOf("%")==-1)?boxWidth.substring(0,boxWidth.indexOf("px")):this.box.scrollWidth));this.borderWidth=parseInt(((borderWidth!=""&&borderWidth.indexOf("px")!==-1)?borderWidth.slice(0,borderWidth.indexOf("px")):0));this.borderString=this.borderWidth+"px"+" solid "+this.borderColour;this.bgImage=((bgImage!="none")?bgImage:"");if(this.bgImage=="initial")this.bgImage="";this.boxContent=this.box.innerHTML;if(boxPosition!="absolute")$(this.box).css("position","relative");$(this.box).css("padding","0px !important");if(($.browser.msie&&$.browser.version==6)&&boxWidth=="auto"&&boxHeight=="auto")$(this.box).css("width","100%");if(($.browser.msie)){$(this.box).css("zoom","1");$(this.box+" *").css("zoom","normal");}
if(this.settings.autoPad==true&&(this.boxPaddingTop>0||this.boxPaddingBottom>0||this.boxPaddingLeft>0||this.boxPaddingRight>0))
this.box.innerHTML="";this.applyCorners=function(){for(var t=0;t<2;t++){switch(t){case 0:if(this.settings.tl||this.settings.tr){var newMainContainer=document.createElement("DIV");var topMaxRadius=Math.max(this.settings.tl?this.settings.tl.radius:0,this.settings.tr?this.settings.tr.radius:0);$(newMainContainer).css({width:"100%","font-size":"1px",overflow:"hidden",position:"absolute","padding-left":this.borderWidth,"padding-right":this.borderWidth,height:topMaxRadius+"px",top:0-topMaxRadius+"px",left:0-this.borderWidth+"px"});this.topContainer=this.box.appendChild(newMainContainer);};break;case 1:if(this.settings.bl||this.settings.br){var newMainContainer=document.createElement("DIV");var botMaxRadius=Math.max(this.settings.bl?this.settings.bl.radius:0,this.settings.br?this.settings.br.radius:0);$(newMainContainer).css({width:"100%","font-size":"1px",overflow:"hidden",position:"absolute","padding-left":this.borderWidth,"padding-right":this.borderWidth,height:botMaxRadius,bottom:0-botMaxRadius+"px",left:0-this.borderWidth+"px"});this.bottomContainer=this.box.appendChild(newMainContainer);};break;};};if(this.settings.autoPad==true&&(this.boxPaddingTop>0||this.boxPaddingBottom>0||this.boxPaddingLeft>0||this.boxPaddingRight>0)){var contentContainer=document.createElement("DIV");$(contentContainer).css("position","relative").html(this.boxContent).addClass="autoPadDiv";var topPadding=Math.abs(topMaxRadius-this.boxPaddingTop);var botPadding=Math.abs(botMaxRadius-this.boxPaddingBottom);if(topMaxRadius<this.boxPaddingTop)
$(contentContainer).css("padding-top",topPadding);else
$(contentContainer).css("padding-top",this.boxPaddingTop);if(botMaxRadius<this.boxPaddingBottom)
$(contentContainer).css("padding-bottom",botPadding);else
$(contentContainer).css("padding-bottom",this.boxPaddingBottom);$(contentContainer).css({"padding-left":this.boxPaddingLeft,"padding-right":this.boxPaddingRight});this.contentDIV=this.box.appendChild(contentContainer);};if(this.topContainer)$(this.box).css("border-top",0);if(this.bottomContainer)$(this.box).css("border-bottom",0);var corners=["tr","tl","br","bl"];for(var i in corners){if(i>-1<4){var cc=corners[i];if(!this.settings[cc]){if(((cc=="tr"||cc=="tl")&&this.topContainer!=null)||((cc=="br"||cc=="bl")&&this.bottomContainer!=null)){var newCorner=document.createElement("DIV");$(newCorner).css({position:"relative","font-size":"1px",overflow:"hidden"});if(this.bgImage=="")
$(newCorner).css("background-color",this.boxColour);else
$(newCorner).css("background-image",this.bgImage).css("background-color",this.boxColour);;switch(cc)
{case"tl":$(newCorner).css({height:topMaxRadius-this.borderWidth,"margin-right":this.settings.tr.radius-(this.borderWidth*2),"border-left":this.borderString,"border-top":this.borderString,left:-this.borderWidth+"px","background-repeat":$(this.box).css("background-repeat"),"background-position":this.borderWidth+"px 0px"});break;case"tr":$(newCorner).css({height:topMaxRadius-this.borderWidth,"margin-left":this.settings.tl.radius-(this.borderWidth*2),"border-right":this.borderString,"border-top":this.borderString,left:this.borderWidth+"px","background-repeat":$(this.box).css("background-repeat"),"background-position":"-"+(topMaxRadius+this.borderWidth)+"px 0px"});break;case"bl":if(topMaxRadius>0)
$(newCorner).css({height:botMaxRadius-this.borderWidth,"margin-right":this.settings.br.radius-(this.borderWidth*2),"border-left":this.borderString,"border-bottom":this.borderString,left:-this.borderWidth+"px","background-repeat":$(this.box).css("background-repeat"),"background-position":"0px -"+($(this.box).height()+topMaxRadius-this.borderWidth+1)+"px"});else
$(newCorner).css({height:botMaxRadius-this.borderWidth,"margin-right":this.settings.br.radius-(this.borderWidth*2),"border-left":this.borderString,"border-bottom":this.borderString,left:-this.borderWidth+"px","background-repeat":$(this.box).css("background-repeat"),"background-position":"0px -"+($(this.box).height())+"px"});break;case"br":if(topMaxRadius>0)
$(newCorner).css({height:botMaxRadius-this.borderWidth,"margin-left":this.settings.bl.radius-(this.borderWidth*2),"border-right":this.borderString,"border-bottom":this.borderString,left:this.borderWidth+"px","background-repeat":$(this.box).css("background-repeat"),"background-position":"-"+this.settings.bl.radius+this.borderWidth+"px -"+($(this.box).height()+topMaxRadius-this.borderWidth+1)+"px"});else
$(newCorner).css({height:botMaxRadius-this.borderWidth,"margin-left":this.settings.bl.radius-(this.borderWidth*2),"border-right":this.borderString,"border-bottom":this.borderString,left:this.borderWidth+"px","background-repeat":$(this.box).css("background-repeat"),"background-position":"-"+this.settings.bl.radius+this.borderWidth+"px -"+($(this.box).height())+"px"});break;};};}else{if(this.masterCorners[this.settings[cc].radius]){var newCorner=this.masterCorners[this.settings[cc].radius].cloneNode(true);}else{var newCorner=document.createElement("DIV");$(newCorner).css({height:this.settings[cc].radius,width:this.settings[cc].radius,position:"absolute","font-size":"1px",overflow:"hidden"});var borderRadius=parseInt(this.settings[cc].radius-this.borderWidth);for(var intx=0,j=this.settings[cc].radius;intx<j;intx++){if((intx+1)>=borderRadius)
var y1=-1;else
var y1=(Math.floor(Math.sqrt(Math.pow(borderRadius,2)-Math.pow((intx+1),2)))-1);if(borderRadius!=j){if((intx)>=borderRadius)
var y2=-1;else
var y2=Math.ceil(Math.sqrt(Math.pow(borderRadius,2)-Math.pow(intx,2)));if((intx+1)>=j)
var y3=-1;else
var y3=(Math.floor(Math.sqrt(Math.pow(j,2)-Math.pow((intx+1),2)))-1);};if((intx)>=j)
var y4=-1;else
var y4=Math.ceil(Math.sqrt(Math.pow(j,2)-Math.pow(intx,2)));if(y1>-1)this.drawPixel(intx,0,this.boxColour,100,(y1+1),newCorner,-1,this.settings[cc].radius);if(borderRadius!=j){for(var inty=(y1+1);inty<y2;inty++){if(this.settings.antiAlias){if(this.bgImage!=""){var borderFract=(pixelFraction(intx,inty,borderRadius)*100);if(borderFract<30){this.drawPixel(intx,inty,this.borderColour,100,1,newCorner,0,this.settings[cc].radius);}else{this.drawPixel(intx,inty,this.borderColour,100,1,newCorner,-1,this.settings[cc].radius);};}else{var pixelcolour=BlendColour(this.boxColour,this.borderColour,pixelFraction(intx,inty,borderRadius));this.drawPixel(intx,inty,pixelcolour,100,1,newCorner,0,this.settings[cc].radius,cc);};};};if(this.settings.antiAlias){if(y3>=y2)
{if(y2==-1)y2=0;this.drawPixel(intx,y2,this.borderColour,100,(y3-y2+1),newCorner,0,0);}}else{if(y3>=y1)
{this.drawPixel(intx,(y1+1),this.borderColour,100,(y3-y1),newCorner,0,0);}};var outsideColour=this.borderColour;}else{var outsideColour=this.boxColour;var y3=y1;};if(this.settings.antiAlias){for(var inty=(y3+1);inty<y4;inty++){this.drawPixel(intx,inty,outsideColour,(pixelFraction(intx,inty,j)*100),1,newCorner,((this.borderWidth>0)?0:-1),this.settings[cc].radius);};};};this.masterCorners[this.settings[cc].radius]=newCorner.cloneNode(true);};if(cc!="br"){for(var t=0,k=newCorner.childNodes.length;t<k;t++){var pixelBar=newCorner.childNodes[t];var pixelBarTop=strip_px($(pixelBar).css("top"));var pixelBarLeft=strip_px($(pixelBar).css("left"));var pixelBarHeight=strip_px($(pixelBar).css("height"));if(cc=="tl"||cc=="bl"){$(pixelBar).css("left",this.settings[cc].radius-pixelBarLeft-1+"px");};if(cc=="tr"||cc=="tl"){$(pixelBar).css("top",this.settings[cc].radius-pixelBarHeight-pixelBarTop+"px");};switch(cc){case"tr":$(pixelBar).css("background-position","-"+Math.abs((this.boxWidth-this.settings[cc].radius+this.borderWidth)+pixelBarLeft)+"px -"+Math.abs(this.settings[cc].radius-pixelBarHeight-pixelBarTop-this.borderWidth)+"px");break;case"tl":$(pixelBar).css("background-position","-"+Math.abs((this.settings[cc].radius-pixelBarLeft-1)-this.borderWidth)+"px -"+Math.abs(this.settings[cc].radius-pixelBarHeight-pixelBarTop-this.borderWidth)+"px");break;case"bl":if(topMaxRadius>0)
$(pixelBar).css("background-position","-"+Math.abs((this.settings[cc].radius-pixelBarLeft-1)-this.borderWidth)+"px -"+Math.abs(($(this.box).height()+topMaxRadius-this.borderWidth+1))+"px");else
$(pixelBar).css("background-position","-"+Math.abs((this.settings[cc].radius-pixelBarLeft-1)-this.borderWidth)+"px -"+Math.abs(($(this.box).height()))+"px");break;};};};};if(newCorner){switch(cc){case"tl":if($(newCorner).css("position")=="absolute")$(newCorner).css("top","0");if($(newCorner).css("position")=="absolute")$(newCorner).css("left","0");if(this.topContainer)this.topContainer.appendChild(newCorner);break;case"tr":if($(newCorner).css("position")=="absolute")$(newCorner).css("top","0");if($(newCorner).css("position")=="absolute")$(newCorner).css("right","0");if(this.topContainer)this.topContainer.appendChild(newCorner);break;case"bl":if($(newCorner).css("position")=="absolute")$(newCorner).css("bottom","0");if(newCorner.style.position=="absolute")$(newCorner).css("left","0");if(this.bottomContainer)this.bottomContainer.appendChild(newCorner);break;case"br":if($(newCorner).css("position")=="absolute")$(newCorner).css("bottom","0");if($(newCorner).css("position")=="absolute")$(newCorner).css("right","0");if(this.bottomContainer)this.bottomContainer.appendChild(newCorner);break;};};};};var radiusDiff=new Array();radiusDiff["t"]=Math.abs(this.settings.tl.radius-this.settings.tr.radius);radiusDiff["b"]=Math.abs(this.settings.bl.radius-this.settings.br.radius);for(z in radiusDiff){if(z=="t"||z=="b"){if(radiusDiff[z]){var smallerCornerType=((this.settings[z+"l"].radius<this.settings[z+"r"].radius)?z+"l":z+"r");var newFiller=document.createElement("DIV");$(newFiller).css({height:radiusDiff[z],width:this.settings[smallerCornerType].radius+"px",position:"absolute","font-size":"1px",overflow:"hidden","background-color":this.boxColour});switch(smallerCornerType)
{case"tl":$(newFiller).css({"bottom":"0","left":"0","border-left":this.borderString});this.topContainer.appendChild(newFiller);break;case"tr":$(newFiller).css({"bottom":"0","right":"0","border-right":this.borderString});this.topContainer.appendChild(newFiller);break;case"bl":$(newFiller).css({"top":"0","left":"0","border-left":this.borderString});this.bottomContainer.appendChild(newFiller);break;case"br":$(newFiller).css({"top":"0","right":"0","border-right":this.borderString});this.bottomContainer.appendChild(newFiller);break;}};var newFillerBar=document.createElement("DIV");$(newFillerBar).css({position:"relative","font-size":"1px",overflow:"hidden","background-color":this.boxColour,"background-image":this.bgImage,"background-repeat":$(this.box).css("background-repeat")});switch(z){case"t":if(this.topContainer){if(this.settings.tl.radius&&this.settings.tr.radius){$(newFillerBar).css({height:topMaxRadius-this.borderWidth+"px","margin-left":this.settings.tl.radius-this.borderWidth+"px","margin-right":this.settings.tr.radius-this.borderWidth+"px","border-top":this.borderString});if(this.bgImage!="")
$(newFillerBar).css("background-position","-"+(topMaxRadius+this.borderWidth)+"px 0px");this.topContainer.appendChild(newFillerBar);};$(this.box).css("background-position","0px -"+(topMaxRadius-this.borderWidth+1)+"px");};break;case"b":if(this.bottomContainer){if(this.settings.bl.radius&&this.settings.br.radius){$(newFillerBar).css({height:botMaxRadius-this.borderWidth+"px","margin-left":this.settings.bl.radius-this.borderWidth+"px","margin-right":this.settings.br.radius-this.borderWidth+"px","border-bottom":this.borderString});if(this.bgImage!=""&&topMaxRadius>0)
$(newFillerBar).css("background-position","-"+(this.settings.bl.radius-this.borderWidth)+"px -"+($(this.box).height()+topMaxRadius-this.borderWidth+1)+"px");else
$(newFillerBar).css("background-position","-"+(this.settings.bl.radius-this.borderWidth)+"px -"+($(this.box).height())+"px");this.bottomContainer.appendChild(newFillerBar);};};break;};};};};this.drawPixel=function(intx,inty,colour,transAmount,height,newCorner,image,cornerRadius){var pixel=document.createElement("DIV");$(pixel).css({height:height,width:"1px",position:"absolute","font-size":"1px",overflow:"hidden"});var topMaxRadius=Math.max(this.settings["tr"].radius,this.settings["tl"].radius);if(image==-1&&this.bgImage!=""){if(topMaxRadius>0)
$(pixel).css("background-position","-"+((this.boxWidth-cornerRadius-this.borderWidth)+intx)+"px -"+(($(this.box).height()+topMaxRadius-this.borderWidth)-inty)+"px");else
$(pixel).css("background-position","-"+((this.boxWidth-cornerRadius-this.borderWidth)+intx)+"px -"+(($(this.box).height())-inty)+"px");$(pixel).css({"background-image":this.bgImage,"background-repeat":$(this.box).css("background-repeat"),"background-color":colour,"background-position":"-"+((this.boxWidth-cornerRadius-this.borderWidth)+intx)+"px -"+(($(this.box).height()+topMaxRadius-this.borderWidth)-inty)+"px"});}
else
{$(pixel).css("background-color",colour);};if(transAmount!=100)
setOpacity(pixel,transAmount);$(pixel).css({top:inty+"px",left:intx+"px"});newCorner.appendChild(pixel);};};function BlendColour(Col1,Col2,Col1Fraction){var red1=parseInt(Col1.substr(1,2),16);var green1=parseInt(Col1.substr(3,2),16);var blue1=parseInt(Col1.substr(5,2),16);var red2=parseInt(Col2.substr(1,2),16);var green2=parseInt(Col2.substr(3,2),16);var blue2=parseInt(Col2.substr(5,2),16);if(Col1Fraction>1||Col1Fraction<0)Col1Fraction=1;var endRed=Math.round((red1*Col1Fraction)+(red2*(1-Col1Fraction)));if(endRed>255)endRed=255;if(endRed<0)endRed=0;var endGreen=Math.round((green1*Col1Fraction)+(green2*(1-Col1Fraction)));if(endGreen>255)endGreen=255;if(endGreen<0)endGreen=0;var endBlue=Math.round((blue1*Col1Fraction)+(blue2*(1-Col1Fraction)));if(endBlue>255)endBlue=255;if(endBlue<0)endBlue=0;return"#"+IntToHex(endRed)+IntToHex(endGreen)+IntToHex(endBlue);};function IntToHex(strNum){base=strNum/16;rem=strNum%16;base=base-(rem/16);baseS=MakeHex(base);remS=MakeHex(rem);return baseS+''+remS;};function MakeHex(x){if((x>=0)&&(x<=9)){return x;}else{switch(x){case 10:return"A";case 11:return"B";case 12:return"C";case 13:return"D";case 14:return"E";case 15:return"F";};};};function pixelFraction(x,y,r){var pixelfraction=0;var xvalues=new Array(1);var yvalues=new Array(1);var point=0;var whatsides="";var intersect=Math.sqrt((Math.pow(r,2)-Math.pow(x,2)));if((intersect>=y)&&(intersect<(y+1))){whatsides="Left";xvalues[point]=0;yvalues[point]=intersect-y;point=point+1;};var intersect=Math.sqrt((Math.pow(r,2)-Math.pow(y+1,2)));if((intersect>=x)&&(intersect<(x+1))){whatsides=whatsides+"Top";xvalues[point]=intersect-x;yvalues[point]=1;point=point+1;};var intersect=Math.sqrt((Math.pow(r,2)-Math.pow(x+1,2)));if((intersect>=y)&&(intersect<(y+1))){whatsides=whatsides+"Right";xvalues[point]=1;yvalues[point]=intersect-y;point=point+1;};var intersect=Math.sqrt((Math.pow(r,2)-Math.pow(y,2)));if((intersect>=x)&&(intersect<(x+1))){whatsides=whatsides+"Bottom";xvalues[point]=intersect-x;yvalues[point]=0;};switch(whatsides){case"LeftRight":pixelfraction=Math.min(yvalues[0],yvalues[1])+((Math.max(yvalues[0],yvalues[1])-Math.min(yvalues[0],yvalues[1]))/2);break;case"TopRight":pixelfraction=1-(((1-xvalues[0])*(1-yvalues[1]))/2);break;case"TopBottom":pixelfraction=Math.min(xvalues[0],xvalues[1])+((Math.max(xvalues[0],xvalues[1])-Math.min(xvalues[0],xvalues[1]))/2);break;case"LeftBottom":pixelfraction=(yvalues[0]*xvalues[1])/2;break;default:pixelfraction=1;};return pixelfraction;};function rgb2Hex(rgbColour){try{var rgbArray=rgb2Array(rgbColour);var red=parseInt(rgbArray[0]);var green=parseInt(rgbArray[1]);var blue=parseInt(rgbArray[2]);var hexColour="#"+IntToHex(red)+IntToHex(green)+IntToHex(blue);}catch(e){alert("There was an error converting the RGB value to Hexadecimal in function rgb2Hex");};return hexColour;};function rgb2Array(rgbColour){var rgbValues=rgbColour.substring(4,rgbColour.indexOf(")"));var rgbArray=rgbValues.split(", ");return rgbArray;};function setOpacity(obj,opacity){opacity=(opacity==100)?99.999:opacity;if($.browser.safari&&obj.tagName!="IFRAME")
{var rgbArray=rgb2Array(obj.style.backgroundColor);var red=parseInt(rgbArray[0]);var green=parseInt(rgbArray[1]);var blue=parseInt(rgbArray[2]);obj.style.backgroundColor="rgba("+red+", "+green+", "+blue+", "+opacity/100+")";}
else if(typeof(obj.style.opacity)!="undefined")
{obj.style.opacity=opacity/100;}
else if(typeof(obj.style.MozOpacity)!="undefined")
{obj.style.MozOpacity=opacity/100;}
else if(typeof(obj.style.filter)!="undefined")
{obj.style.filter="alpha(opacity:"+opacity+")";}
else if(typeof(obj.style.KHTMLOpacity)!="undefined")
{obj.style.KHTMLOpacity=opacity/100;}};function format_colour(colour){var returnColour="#ffffff";if(colour!=""&&colour!="transparent")
{if(colour.substr(0,3)=="rgb")
{returnColour=rgb2Hex(colour);}
else if(colour.length==4)
{returnColour="#"+colour.substring(1,2)+colour.substring(1,2)+colour.substring(2,3)+colour.substring(2,3)+colour.substring(3,4)+colour.substring(3,4);}
else
{returnColour=colour;};};return returnColour;};function strip_px(value){return parseInt(((value!=""&&value.indexOf("px")!==-1)?value.slice(0,value.indexOf("px")):0))}
(function($){$.dimensions={version:'@VERSION'};$.each(['Height','Width'],function(i,name){$.fn['inner'+name]=function(){if(!this[0])return;var torl=name=='Height'?'Top':'Left',borr=name=='Height'?'Bottom':'Right';return this.css('display')!='none'?this[0]['client'+name]:num(this,name.toLowerCase())+num(this,'padding'+torl)+num(this,'padding'+borr);};$.fn['outer'+name]=function(options){if(!this[0])return;var torl=name=='Height'?'Top':'Left',borr=name=='Height'?'Bottom':'Right';options=$.extend({margin:false},options||{});var val=this.css('display')!='none'?this[0]['offset'+name]:num(this,name.toLowerCase())
+num(this,'border'+torl+'Width')+num(this,'border'+borr+'Width')
+num(this,'padding'+torl)+num(this,'padding'+borr);return val+(options.margin?(num(this,'margin'+torl)+num(this,'margin'+borr)):0);};});$.each(['Left','Top'],function(i,name){$.fn['scroll'+name]=function(val){if(!this[0])return;return val!=undefined?this.each(function(){this==window||this==document?window.scrollTo(name=='Left'?val:$(window)['scrollLeft'](),name=='Top'?val:$(window)['scrollTop']()):this['scroll'+name]=val;}):this[0]==window||this[0]==document?self[(name=='Left'?'pageXOffset':'pageYOffset')]||$.boxModel&&document.documentElement['scroll'+name]||document.body['scroll'+name]:this[0]['scroll'+name];};});$.fn.extend({position:function(){var left=0,top=0,elem=this[0],offset,parentOffset,offsetParent,results;if(elem){offsetParent=this.offsetParent();offset=this.offset();parentOffset=offsetParent.offset();offset.top-=num(elem,'marginTop');offset.left-=num(elem,'marginLeft');parentOffset.top+=num(offsetParent,'borderTopWidth');parentOffset.left+=num(offsetParent,'borderLeftWidth');results={top:offset.top-parentOffset.top,left:offset.left-parentOffset.left};}
return results;},offsetParent:function(){var offsetParent=this[0].offsetParent;while(offsetParent&&(!/^body|html$/i.test(offsetParent.tagName)&&$.css(offsetParent,'position')=='static'))
offsetParent=offsetParent.offsetParent;return $(offsetParent);}});function num(el,prop){return parseInt($.curCSS(el.jquery?el[0]:el,prop,true))||0;};})(jQuery);(function($){$.facebox=function(data,klass){$.facebox.loading()
if(data.ajax)fillFaceboxFromAjax(data.ajax,klass)
else if(data.image)fillFaceboxFromImage(data.image,klass)
else if(data.div)fillFaceboxFromHref(data.div,klass)
else if($.isFunction(data))data.call($)
else $.facebox.reveal(data,klass)}
$.extend($.facebox,{settings:{opacity:0,overlay:true,loadingImage:'/facebox/loading.gif',closeImage:'/facebox/closelabel.gif',imageTypes:['png','jpg','jpeg','gif'],faceboxHtml:'\
    <div id="facebox" style="display:none;"> \
      <div class="popup"> \
        <table> \
          <tbody> \
            <tr> \
              <td class="tl"/><td class="b"/><td class="tr"/> \
            </tr> \
            <tr> \
              <td class="b"/> \
              <td class="body"> \
                <div class="content"> \
                </div> \
                <div class="footer"> \
                  <a href="#" class="close"> \
                    <img src="/facebox/closelabel.gif" title="close" class="close_image" /> \
                  </a> \
                </div> \
              </td> \
              <td class="b"/> \
            </tr> \
            <tr> \
              <td class="bl"/><td class="b"/><td class="br"/> \
            </tr> \
          </tbody> \
        </table> \
      </div> \
    </div>'},loading:function(){init()
if($('#facebox .loading').length==1)return true
showOverlay()
$('#facebox .content').empty()
$('#facebox .body').children().hide().end().append('<div class="loading"><img src="'+$.facebox.settings.loadingImage+'"/></div>')
$('#facebox').css({top:getPageScroll()[1]+(getPageHeight()/10),left:$(window).width()/2-205}).show()
$(document).bind('keydown.facebox',function(e){if(e.keyCode==27)$.facebox.close()
return true})
$(document).trigger('loading.facebox')},reveal:function(data,klass){$(document).trigger('beforeReveal.facebox')
if(klass)$('#facebox .content').addClass(klass)
$('#facebox .content').append(data)
$('#facebox .loading').remove()
$('#facebox .body').children().fadeIn('normal')
$('#facebox').css('left',$(window).width()/2-($('#facebox table').width()/2))
$(document).trigger('reveal.facebox').trigger('afterReveal.facebox')},close:function(){$(document).trigger('close.facebox')
return false}})
$.fn.facebox=function(settings){if($(this).length==0)return
init(settings)
function clickHandler(){$.facebox.loading(true)
var klass=this.rel.match(/facebox\[?\.(\w+)\]?/)
if(klass)klass=klass[1]
fillFaceboxFromHref(this.href,klass)
return false}
return this.click(clickHandler)}
function init(settings){if($.facebox.settings.inited)return true
else $.facebox.settings.inited=true
$(document).trigger('init.facebox')
makeCompatible()
var imageTypes=$.facebox.settings.imageTypes.join('|')
$.facebox.settings.imageTypesRegexp=new RegExp('\.'+imageTypes+'$','i')
if(settings)$.extend($.facebox.settings,settings)
$('body').append($.facebox.settings.faceboxHtml)
var preload=[new Image(),new Image()]
preload[0].src=$.facebox.settings.closeImage
preload[1].src=$.facebox.settings.loadingImage
$('#facebox').find('.b:first, .bl, .br, .tl, .tr').each(function(){preload.push(new Image())
preload.slice(-1).src=$(this).css('background-image').replace(/url\((.+)\)/,'$1')})
$('#facebox .close').click($.facebox.close)
$('#facebox .close_image').attr('src',$.facebox.settings.closeImage)}
function getPageScroll(){var xScroll,yScroll;if(self.pageYOffset){yScroll=self.pageYOffset;xScroll=self.pageXOffset;}else if(document.documentElement&&document.documentElement.scrollTop){yScroll=document.documentElement.scrollTop;xScroll=document.documentElement.scrollLeft;}else if(document.body){yScroll=document.body.scrollTop;xScroll=document.body.scrollLeft;}
return new Array(xScroll,yScroll)}
function getPageHeight(){var windowHeight
if(self.innerHeight){windowHeight=self.innerHeight;}else if(document.documentElement&&document.documentElement.clientHeight){windowHeight=document.documentElement.clientHeight;}else if(document.body){windowHeight=document.body.clientHeight;}
return windowHeight}
function makeCompatible(){var $s=$.facebox.settings
$s.loadingImage=$s.loading_image||$s.loadingImage
$s.closeImage=$s.close_image||$s.closeImage
$s.imageTypes=$s.image_types||$s.imageTypes
$s.faceboxHtml=$s.facebox_html||$s.faceboxHtml}
function fillFaceboxFromHref(href,klass){if(href.match(/#/)){var url=window.location.href.split('#')[0]
var target=href.replace(url,'')
$.facebox.reveal($(target).clone().show(),klass)}else if(href.match($.facebox.settings.imageTypesRegexp)){fillFaceboxFromImage(href,klass)}else{fillFaceboxFromAjax(href,klass)}}
function fillFaceboxFromImage(href,klass){var image=new Image()
image.onload=function(){$.facebox.reveal('<div class="image"><img src="'+image.src+'" /></div>',klass)}
image.src=href}
function fillFaceboxFromAjax(href,klass){$.get(href,function(data){$.facebox.reveal(data,klass)})}
function skipOverlay(){return $.facebox.settings.overlay==false||$.facebox.settings.opacity===null}
function showOverlay(){if(skipOverlay())return
if($('facebox_overlay').length==0)
$("body").append('<div id="facebox_overlay" class="facebox_hide"></div>')
$('#facebox_overlay').hide().addClass("facebox_overlayBG").css('opacity',$.facebox.settings.opacity).click(function(){$(document).trigger('close.facebox')}).fadeIn(200)
return false}
function hideOverlay(){if(skipOverlay())return
$('#facebox_overlay').fadeOut(200,function(){$("#facebox_overlay").removeClass("facebox_overlayBG")
$("#facebox_overlay").addClass("facebox_hide")
$("#facebox_overlay").remove()})
return false}
$(document).bind('close.facebox',function(){$(document).unbind('keydown.facebox')
$('#facebox').fadeOut(function(){$('#facebox .content').removeClass().addClass('content')
hideOverlay()
$('#facebox .loading').remove()})})})(jQuery);(function(){jQuery.fn.fancyZoom=function(options){if($(this).length==0)return
var options=options||{};var directory=options&&options.directory?options.directory:'images';var zooming=false;if($('#zoom').length==0){var ext=$.browser.msie?'gif':'png';var html='<div id="zoom" style="display:none;"> \
        <table id="zoom_table" style="border-collapse:collapse; width:100%; height:100%;"> \
        <tbody> \
        <tr> \
        <td class="tl" style="background:url('+directory+'/tl.'+ext+') 0 0 no-repeat; width:20px; height:20px; overflow:hidden;" /> \
        <td class="tm" style="background:url('+directory+'/tm.'+ext+') 0 0 repeat-x; height:20px; overflow:hidden;" /> \
        <td class="tr" style="background:url('+directory+'/tr.'+ext+') 100% 0 no-repeat; width:20px; height:20px; overflow:hidden;" /> \
        </tr> \
        <tr> \
        <td class="ml" style="background:url('+directory+'/ml.'+ext+') 0 0 repeat-y; width:20px; overflow:hidden;" /> \
        <td class="mm" style="background:#fff; vertical-align:top; padding:10px;"> \
        <div id="zoom_content"> \
        </div> \
        </td> \
        <td class="mr" style="background:url('+directory+'/mr.'+ext+') 100% 0 repeat-y;  width:20px; overflow:hidden;" /> \
        </tr> \
        <tr> \
        <td class="bl" style="background:url('+directory+'/bl.'+ext+') 0 100% no-repeat; width:20px; height:20px; overflow:hidden;" /> \
        <td class="bm" style="background:url('+directory+'/bm.'+ext+') 0 100% repeat-x; height:20px; overflow:hidden;" /> \
        <td class="br" style="background:url('+directory+'/br.'+ext+') 100% 100% no-repeat; width:20px; height:20px; overflow:hidden;" /> \
        </tr> \
        </tbody> \
        </table> \
        <a href="#" title="Close" id="zoom_close" style="position:absolute; top:0; left:0;"> \
        <img src="'+directory+'/closebox.'+ext+'" alt="Close" style="border:none; margin:0; padding:0;" /> \
        </a> \
        </div>';$('body').append(html);$('html').click(function(e){if($(e.target).parents('#zoom:visible').length==0)hide();});$(document).keyup(function(event){if(event.keyCode==27&&$('#zoom:visible').length>0)hide();});$('#zoom_close').click(hide);}
var zoom=$('#zoom');var zoom_table=$('#zoom_table');var zoom_close=$('#zoom_close');var zoom_content=$('#zoom_content');var middle_row=$('td.ml,td.mm,td.mr');return $(this).click(show);function show(e){if(zooming)return false;zooming=true;var content_div=$($(this).attr('href'));var zoom_width=options.width;var zoom_height=options.height;var width=window.innerWidth||(window.document.documentElement.clientWidth||window.document.body.clientWidth);var height=window.innerHeight||(window.document.documentElement.clientHeight||window.document.body.clientHeight);var x=window.pageXOffset||(window.document.documentElement.scrollLeft||window.document.body.scrollLeft);var y=window.pageYOffset||(window.document.documentElement.scrollTop||window.document.body.scrollTop);var window_size={'width':width,'height':height,'x':x,'y':y}
var width=(zoom_width||content_div.width())+60;var height=(zoom_height||content_div.height())+60;var d=window_size;var newTop=Math.max((d.height/2)-(height/2)+y,0);var newLeft=(d.width/2)-(width/2);var curTop=e.pageY;var curLeft=e.pageX;zoom_close.attr('curTop',curTop);zoom_close.attr('curLeft',curLeft);zoom_close.attr('scaleImg',options.scaleImg?'true':'false');$('#zoom').hide().css({position:'absolute',top:curTop+'px',left:curLeft+'px',width:'1px',height:'1px'});fixBackgroundsForIE();zoom_close.hide();if(options.closeOnClick){$('#zoom').click(hide);}
if(options.scaleImg){zoom_content.html(content_div.html());$('#zoom_content img').css('width','100%');}else{zoom_content.html('');}
$('#zoom').animate({top:newTop+'px',left:newLeft+'px',opacity:"show",width:width,height:height},500,null,function(){if(options.scaleImg!=true){zoom_content.html(content_div.html());}
unfixBackgroundsForIE();zoom_close.show();zooming=false;})
return false;}
function hide(){if(zooming)return false;zooming=true;$('#zoom').unbind('click');fixBackgroundsForIE();if(zoom_close.attr('scaleImg')!='true'){zoom_content.html('');}
zoom_close.hide();$('#zoom').animate({top:zoom_close.attr('curTop')+'px',left:zoom_close.attr('curLeft')+'px',opacity:"hide",width:'1px',height:'1px'},500,null,function(){if(zoom_close.attr('scaleImg')=='true'){zoom_content.html('');}
unfixBackgroundsForIE();zooming=false;});return false;}
function switchBackgroundImagesTo(to){$('#zoom_table td').each(function(i){var bg=$(this).css('background-image').replace(/\.(png|gif|none)\"\)$/,'.'+to+'")');$(this).css('background-image',bg);});var close_img=zoom_close.children('img');var new_img=close_img.attr('src').replace(/\.(png|gif|none)$/,'.'+to);close_img.attr('src',new_img);}
function fixBackgroundsForIE(){if($.browser.msie&&parseFloat($.browser.version)>=7){switchBackgroundImagesTo('gif');}}
function unfixBackgroundsForIE(){if($.browser.msie&&$.browser.version>=7){switchBackgroundImagesTo('png');}}}})();(function($){$.fn.ajaxSubmit=function(options){if(typeof options=='function')
options={success:options};options=$.extend({url:this.attr('action')||window.location.toString(),type:this.attr('method')||'GET'},options||{});var veto={};$.event.trigger('form.pre.serialize',[this,options,veto]);if(veto.veto)return this;var a=this.formToArray(options.semantic);if(options.data){for(var n in options.data)
a.push({name:n,value:options.data[n]});}
if(options.beforeSubmit&&options.beforeSubmit(a,this,options)===false)return this;$.event.trigger('form.submit.validate',[a,this,options,veto]);if(veto.veto)return this;var q=$.param(a);if(options.type.toUpperCase()=='GET'){options.url+=(options.url.indexOf('?')>=0?'&':'?')+q;options.data=null;}
else
options.data=q;var $form=this,callbacks=[];if(options.resetForm)callbacks.push(function(){$form.resetForm();});if(options.clearForm)callbacks.push(function(){$form.clearForm();});if(!options.dataType&&options.target){var oldSuccess=options.success||function(){};callbacks.push(function(data){if(this.evalScripts)
$(options.target).attr("innerHTML",data).evalScripts().each(oldSuccess,arguments);else
$(options.target).html(data).each(oldSuccess,arguments);});}
else if(options.success)
callbacks.push(options.success);options.success=function(data,status){for(var i=0,max=callbacks.length;i<max;i++)
callbacks[i](data,status,$form);};var files=$('input:file',this).fieldValue();var found=false;for(var j=0;j<files.length;j++)
if(files[j])
found=true;if(options.iframe||found){if($.browser.safari&&options.closeKeepAlive)
$.get(options.closeKeepAlive,fileUpload);else
fileUpload();}
else
$.ajax(options);$.event.trigger('form.submit.notify',[this,options]);return this;function fileUpload(){var form=$form[0];var opts=$.extend({},$.ajaxSettings,options);var id='jqFormIO'+$.fn.ajaxSubmit.counter++;var $io=$('<iframe id="'+id+'" name="'+id+'" />');var io=$io[0];var op8=$.browser.opera&&window.opera.version()<9;if($.browser.msie||op8)io.src='javascript:false;document.write("");';$io.css({position:'absolute',top:'-1000px',left:'-1000px'});var xhr={responseText:null,responseXML:null,status:0,statusText:'n/a',getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){}};var g=opts.global;if(g&&!$.active++)$.event.trigger("ajaxStart");if(g)$.event.trigger("ajaxSend",[xhr,opts]);var cbInvoked=0;var timedOut=0;setTimeout(function(){var encAttr=form.encoding?'encoding':'enctype';var t=$form.attr('target'),a=$form.attr('action');$form.attr({target:id,method:'POST',action:opts.url});form[encAttr]='multipart/form-data';if(opts.timeout)
setTimeout(function(){timedOut=true;cb();},opts.timeout);$io.appendTo('body');io.attachEvent?io.attachEvent('onload',cb):io.addEventListener('load',cb,false);form.submit();$form.attr({action:a,target:t});},10);function cb(){if(cbInvoked++)return;io.detachEvent?io.detachEvent('onload',cb):io.removeEventListener('load',cb,false);var ok=true;try{if(timedOut)throw'timeout';var data,doc;doc=io.contentWindow?io.contentWindow.document:io.contentDocument?io.contentDocument:io.document;xhr.responseText=doc.body?doc.body.innerHTML:null;xhr.responseXML=doc.XMLDocument?doc.XMLDocument:doc;if(opts.dataType=='json'||opts.dataType=='script'){var ta=doc.getElementsByTagName('textarea')[0];data=ta?ta.value:xhr.responseText;if(opts.dataType=='json')
eval("data = "+data);else
$.globalEval(data);}
else if(opts.dataType=='xml'){data=xhr.responseXML;if(!data&&xhr.responseText!=null)
data=toXml(xhr.responseText);}
else{data=xhr.responseText;}}
catch(e){ok=false;$.handleError(opts,xhr,'error',e);}
if(ok){opts.success(data,'success');if(g)$.event.trigger("ajaxSuccess",[xhr,opts]);}
if(g)$.event.trigger("ajaxComplete",[xhr,opts]);if(g&&!--$.active)$.event.trigger("ajaxStop");if(opts.complete)opts.complete(xhr,ok?'success':'error');setTimeout(function(){$io.remove();xhr.responseXML=null;},100);};function toXml(s,doc){if(window.ActiveXObject){doc=new ActiveXObject('Microsoft.XMLDOM');doc.async='false';doc.loadXML(s);}
else
doc=(new DOMParser()).parseFromString(s,'text/xml');return(doc&&doc.documentElement&&doc.documentElement.tagName!='parsererror')?doc:null;};};};$.fn.ajaxSubmit.counter=0;$.fn.ajaxForm=function(options){return this.ajaxFormUnbind().submit(submitHandler).each(function(){this.formPluginId=$.fn.ajaxForm.counter++;$.fn.ajaxForm.optionHash[this.formPluginId]=options;$(":submit,input:image",this).click(clickHandler);});};$.fn.ajaxForm.counter=1;$.fn.ajaxForm.optionHash={};function clickHandler(e){var $form=this.form;$form.clk=this;if(this.type=='image'){if(e.offsetX!=undefined){$form.clk_x=e.offsetX;$form.clk_y=e.offsetY;}else if(typeof $.fn.offset=='function'){var offset=$(this).offset();$form.clk_x=e.pageX-offset.left;$form.clk_y=e.pageY-offset.top;}else{$form.clk_x=e.pageX-this.offsetLeft;$form.clk_y=e.pageY-this.offsetTop;}}
setTimeout(function(){$form.clk=$form.clk_x=$form.clk_y=null;},10);};function submitHandler(){var id=this.formPluginId;var options=$.fn.ajaxForm.optionHash[id];$(this).ajaxSubmit(options);return false;};$.fn.ajaxFormUnbind=function(){this.unbind('submit',submitHandler);return this.each(function(){$(":submit,input:image",this).unbind('click',clickHandler);});};$.fn.formToArray=function(semantic){var a=[];if(this.length==0)return a;var form=this[0];var els=semantic?form.getElementsByTagName('*'):form.elements;if(!els)return a;for(var i=0,max=els.length;i<max;i++){var el=els[i];var n=el.name;if(!n)continue;if(semantic&&form.clk&&el.type=="image"){if(!el.disabled&&form.clk==el)
a.push({name:n+'.x',value:form.clk_x},{name:n+'.y',value:form.clk_y});continue;}
var v=$.fieldValue(el,true);if(v&&v.constructor==Array){for(var j=0,jmax=v.length;j<jmax;j++)
a.push({name:n,value:v[j]});}
else if(v!==null&&typeof v!='undefined')
a.push({name:n,value:v});}
if(!semantic&&form.clk){var inputs=form.getElementsByTagName("input");for(var i=0,max=inputs.length;i<max;i++){var input=inputs[i];var n=input.name;if(n&&!input.disabled&&input.type=="image"&&form.clk==input)
a.push({name:n+'.x',value:form.clk_x},{name:n+'.y',value:form.clk_y});}}
return a;};$.fn.formSerialize=function(semantic){return $.param(this.formToArray(semantic));};$.fn.fieldSerialize=function(successful){var a=[];this.each(function(){var n=this.name;if(!n)return;var v=$.fieldValue(this,successful);if(v&&v.constructor==Array){for(var i=0,max=v.length;i<max;i++)
a.push({name:n,value:v[i]});}
else if(v!==null&&typeof v!='undefined')
a.push({name:this.name,value:v});});return $.param(a);};$.fn.fieldValue=function(successful){for(var val=[],i=0,max=this.length;i<max;i++){var el=this[i];var v=$.fieldValue(el,successful);if(v===null||typeof v=='undefined'||(v.constructor==Array&&!v.length))
continue;v.constructor==Array?$.merge(val,v):val.push(v);}
return val;};$.fieldValue=function(el,successful){var n=el.name,t=el.type,tag=el.tagName.toLowerCase();if(typeof successful=='undefined')successful=true;if(successful&&(!n||el.disabled||t=='reset'||t=='button'||(t=='checkbox'||t=='radio')&&!el.checked||(t=='submit'||t=='image')&&el.form&&el.form.clk!=el||tag=='select'&&el.selectedIndex==-1))
return null;if(tag=='select'){var index=el.selectedIndex;if(index<0)return null;var a=[],ops=el.options;var one=(t=='select-one');var max=(one?index+1:ops.length);for(var i=(one?index:0);i<max;i++){var op=ops[i];if(op.selected){var v=$.browser.msie&&!(op.attributes['value'].specified)?op.text:op.value;if(one)return v;a.push(v);}}
return a;}
return el.value;};$.fn.clearForm=function(){return this.each(function(){$('input,select,textarea',this).clearFields();});};$.fn.clearFields=$.fn.clearInputs=function(){return this.each(function(){var t=this.type,tag=this.tagName.toLowerCase();if(t=='text'||t=='password'||tag=='textarea')
this.value='';else if(t=='checkbox'||t=='radio')
this.checked=false;else if(tag=='select')
this.selectedIndex=-1;});};$.fn.resetForm=function(){return this.each(function(){if(typeof this.reset=='function'||(typeof this.reset=='object'&&!this.reset.nodeType))
this.reset();});};$.fn.enable=function(b){if(b==undefined)b=true;return this.each(function(){this.disabled=!b});};$.fn.select=function(select){if(select==undefined)select=true;return this.each(function(){var t=this.type;if(t=='checkbox'||t=='radio')
this.checked=select;else if(this.tagName.toLowerCase()=='option'){var $sel=$(this).parent('select');if(select&&$sel[0]&&$sel[0].type=='select-one'){$sel.find('option').select(false);}
this.selected=select;}});};})(jQuery);(function($){$.hotkeys=function(options){for(key in options)$.hotkey(key,options[key])
return this}
$.hotkey=function(key,value){$.hotkeys.cache[key.charCodeAt(0)-32]=value
return this}
$.hotkeys.cache={}})(jQuery)
jQuery(document).ready(function($){$('a[hotkey]').each(function(){$.hotkey($(this).attr('hotkey'),$(this).attr('href'))})
$(document).bind('keydown.hotkey',function(e){if($(e.target).is(':input'))return
if(e.shiftKey||e.ctrlKey||e.altKey||e.metaKey)return true
var el=$.hotkeys.cache[e.keyCode]
if(el){$.isFunction(el)?el.call(this):window.location=el
return false}})});(function($){$.fn.editable=function(target,options){var settings={target:target,name:'value',id:'id',type:'text',width:'auto',height:'auto',event:'click',onblur:'cancel',loadtype:'GET',loadtext:'Loading...',placeholder:'Click to edit',submittype:'post',loaddata:{},submitdata:{}};if(options){$.extend(settings,options);}
var plugin=$.editable.types[settings.type].plugin||function(){};var submit=$.editable.types[settings.type].submit||function(){};var buttons=$.editable.types[settings.type].buttons||$.editable.types['defaults'].buttons;var content=$.editable.types[settings.type].content||$.editable.types['defaults'].content;var element=$.editable.types[settings.type].element||$.editable.types['defaults'].element;var callback=settings.callback||function(){};if(!$.isFunction($(this)[settings.event])){$.fn[settings.event]=function(fn){return fn?this.bind(settings.event,fn):this.trigger(settings.event);}}
$(this).attr('title',settings.tooltip);settings.autowidth='auto'==settings.width;settings.autoheight='auto'==settings.height;return this.each(function(){if(!$.trim($(this).html())){$(this).html(settings.placeholder);}
$(this)[settings.event](function(e){var self=this;if(self.editing){return;}
$(self).css("visibility","hidden");if(settings.width!='none'){settings.width=settings.autowidth?$(self).width():settings.width;}
if(settings.height!='none'){settings.height=settings.autoheight?$(self).height():settings.height;}
$(this).css("visibility","");if($(this).html().toLowerCase().replace(/;/,'')==settings.placeholder.toLowerCase().replace(/;/,'')){$(this).html('');}
self.editing=true;self.revert=$(self).html();$(self).html('');var form=$('<form/>');if(settings.cssclass){if('inherit'==settings.cssclass){form.attr('class',$(self).attr('class'));}else{form.attr('class',settings.cssclass);}}
if(settings.style){if('inherit'==settings.style){form.attr('style',$(self).attr('style'));form.css('display',$(self).css('display'));}else{form.attr('style',settings.style);}}
var input=element.apply(form,[settings,self]);var input_content;if(settings.loadurl){var t=setTimeout(function(){input.disabled=true;content.apply(form,[settings.loadtext,settings,self]);},100);var loaddata={};loaddata[settings.id]=self.id;if($.isFunction(settings.loaddata)){$.extend(loaddata,settings.loaddata.apply(self,[self.revert,settings]));}else{$.extend(loaddata,settings.loaddata);}
$.ajax({type:settings.loadtype,url:settings.loadurl,data:loaddata,async:false,success:function(result){window.clearTimeout(t);input_content=result;input.disabled=false;}});}else if(settings.data){input_content=settings.data;if($.isFunction(settings.data)){input_content=settings.data.apply(self,[self.revert,settings]);}}else{input_content=self.revert;}
content.apply(form,[input_content,settings,self]);input.attr('name',settings.name);buttons.apply(form,[settings,self]);plugin.apply(form,[settings,self]);$(self).append(form);$(':input:visible:enabled:first',form).focus();if(settings.select){input.select();}
input.keydown(function(e){if(e.keyCode==27){input.blur();e.preventDefault();reset();}});var t;if('cancel'==settings.onblur){input.blur(function(e){t=setTimeout(reset,500);});}else if('submit'==settings.onblur){input.blur(function(e){form.submit();});}else if($.isFunction(settings.onblur)){input.blur(function(e){settings.onblur.apply(self,[input.val(),settings]);});}else{input.blur(function(e){});}
form.submit(function(e){if(t){clearTimeout(t);}
e.preventDefault();submit.apply(form,[settings,self]);if($.isFunction(settings.target)){var str=settings.target.apply(self,[input.val(),settings]);$(self).html(str);self.editing=false;callback.apply(self,[self.innerHTML,settings]);if(!$.trim($(self).html())){$(self).html(settings.placeholder);}}else{var submitdata={};submitdata[settings.name]=input.val();submitdata[settings.id]=self.id;if($.isFunction(settings.submitdata)){$.extend(submitdata,settings.submitdata.apply(self,[self.revert,settings]));}else{$.extend(submitdata,settings.submitdata);}
$(self).html(settings.indicator);$.ajax({type:settings.submittype,url:settings.target,data:submitdata,success:function(str){$(self).html(str);self.editing=false;callback.apply(self,[self.innerHTML,settings]);if(!$.trim($(self).html())){$(self).html(settings.placeholder);}}});}
return false;});function reset(){$(self).html(self.revert);self.editing=false;if(!$.trim($(self).html())){$(self).html(settings.placeholder);}}
$(self).bind('reset',reset)});});};$.editable={types:{defaults:{element:function(settings,original){var input=$('<input type="hidden">');$(this).append(input);return(input);},content:function(string,settings,original){$(':input:first',this).val(string);},buttons:function(settings,original){if(settings.submit){var submit=$('<input type="submit">');submit.val(settings.submit);$(this).append(submit);}
if(settings.cancel){var cancel=$('<input type="button">');cancel.val(settings.cancel);$(this).append(cancel);$(cancel).click(function(){$(original).html(original.revert);original.editing=false;});}}},text:{element:function(settings,original){var input=$('<input>');if(settings.width!='none'){input.width(settings.width);}
if(settings.height!='none'){input.height(settings.height);}
input.attr('autocomplete','off');$(this).append(input);return(input);}},textarea:{element:function(settings,original){var textarea=$('<textarea>');if(settings.rows){textarea.attr('rows',settings.rows);}else{textarea.height(settings.height);}
if(settings.cols){textarea.attr('cols',settings.cols);}else{textarea.width(settings.width);}
$(this).append(textarea);return(textarea);}},select:{element:function(settings,original){var select=$('<select>');$(this).append(select);return(select);},content:function(string,settings,original){if(String==string.constructor){eval('var json = '+string);for(var key in json){if(!json.hasOwnProperty(key)){continue;}
if('selected'==key){continue;}
var option=$('<option>').val(key).append(json[key]);$('select',this).append(option);}}
$('select',this).children().each(function(){if($(this).val()==json['selected']){$(this).attr('selected','selected');};});}}},addInputType:function(name,input){$.editable.types[name]=input;}};})(jQuery);(function($){$.extend($.fn,{livequery:function(type,fn,fn2){var self=this,q;if($.isFunction(type))
fn2=fn,fn=type,type=undefined;$.each($.livequery.queries,function(i,query){if(self.selector==query.selector&&self.context==query.context&&type==query.type&&(!fn||fn.$lqguid==query.fn.$lqguid)&&(!fn2||fn2.$lqguid==query.fn2.$lqguid))
return(q=query)&&false;});q=q||new $.livequery(this.selector,this.context,type,fn,fn2);q.stopped=false;$.livequery.run(q.id);return this;},expire:function(type,fn,fn2){var self=this;if($.isFunction(type))
fn2=fn,fn=type,type=undefined;$.each($.livequery.queries,function(i,query){if(self.selector==query.selector&&self.context==query.context&&(!type||type==query.type)&&(!fn||fn.$lqguid==query.fn.$lqguid)&&(!fn2||fn2.$lqguid==query.fn2.$lqguid)&&!this.stopped)
$.livequery.stop(query.id);});return this;}});$.livequery=function(selector,context,type,fn,fn2){this.selector=selector;this.context=context||document;this.type=type;this.fn=fn;this.fn2=fn2;this.elements=[];this.stopped=false;this.id=$.livequery.queries.push(this)-1;fn.$lqguid=fn.$lqguid||$.livequery.guid++;if(fn2)fn2.$lqguid=fn2.$lqguid||$.livequery.guid++;return this;};$.livequery.prototype={stop:function(){var query=this;if(this.type)
this.elements.unbind(this.type,this.fn);else if(this.fn2)
this.elements.each(function(i,el){query.fn2.apply(el);});this.elements=[];this.stopped=true;},run:function(){if(this.stopped)return;var query=this;var oEls=this.elements,els=$(this.selector,this.context),nEls=els.not(oEls);this.elements=els;if(this.type){nEls.bind(this.type,this.fn);if(oEls.length>0)
$.each(oEls,function(i,el){if($.inArray(el,els)<0)
$.event.remove(el,query.type,query.fn);});}
else{nEls.each(function(){query.fn.apply(this);});if(this.fn2&&oEls.length>0)
$.each(oEls,function(i,el){if($.inArray(el,els)<0)
query.fn2.apply(el);});}}};$.extend($.livequery,{guid:0,queries:[],queue:[],running:false,timeout:null,checkQueue:function(){if($.livequery.running&&$.livequery.queue.length){var length=$.livequery.queue.length;while(length--)
$.livequery.queries[$.livequery.queue.shift()].run();}},pause:function(){$.livequery.running=false;},play:function(){$.livequery.running=true;$.livequery.run();},registerPlugin:function(){$.each(arguments,function(i,n){if(!$.fn[n])return;var old=$.fn[n];$.fn[n]=function(){var r=old.apply(this,arguments);$.livequery.run();return r;}});},run:function(id){if(id!=undefined){if($.inArray(id,$.livequery.queue)<0)
$.livequery.queue.push(id);}
else
$.each($.livequery.queries,function(id){if($.inArray(id,$.livequery.queue)<0)
$.livequery.queue.push(id);});if($.livequery.timeout)clearTimeout($.livequery.timeout);$.livequery.timeout=setTimeout($.livequery.checkQueue,20);},stop:function(id){if(id!=undefined)
$.livequery.queries[id].stop();else
$.each($.livequery.queries,function(id){$.livequery.queries[id].stop();});}});$.livequery.registerPlugin('append','prepend','after','before','wrap','attr','removeAttr','addClass','removeClass','toggleClass','empty','remove');$(function(){$.livequery.play();});var init=$.prototype.init;$.prototype.init=function(a,c){var r=init.apply(this,arguments);if(a&&a.selector)
r.context=a.context,r.selector=a.selector;if(typeof a=='string')
r.context=c||document,r.selector=a;return r;};$.prototype.init.prototype=$.prototype;})(jQuery);;(function(){Primer=function(container,width,height){this.container=container
this.width=width
this.height=height
this.actions=[]
this.init()}
Primer.prototype={init:function(){var el=$(this.container).eq(0)
el.append('<canvas width="'+this.width+'" height="'+this.height+'"></canvas>')
var jelc=$('canvas',el)
var elc=jelc[0]
this.context=elc.getContext('2d')
this.root=new Primer.Layer()
this.root.bind(this)
var self=this
jelc.eq(0).mousemove(function(e){e.localX=e.clientX-elc.offsetLeft
e.localY=e.clientY-elc.offsetTop
self.ghost(e)})},addChild:function(child){child.bind(this)
this.root.addChild(child)
this.draw()},draw:function(){this.context.clearRect(0,0,this.width,this.height)
this.root.draw()},ghost:function(e){this.root.ghost(e)
for(var i in this.actions){var action=this.actions[i]
action[0](action[1])}
this.actions=[]}}
Primer.Layer=function(){this.primer=null
this.children=[]
this.calls=[]
this.xVal=0
this.yVal=0
this.visibleVal=true
this.mouseoverVal=function(){}
this.mouseoutVal=function(){}
this.mouseWithin=false}
Primer.Layer.prototype={bind:function(primer){this.primer=primer
for(var i in this.children){this.children[i].bind(primer)}},get context(){return this.primer.context},get x(){return this.xVal},set x(xVal){this.xVal=xVal
if(this.primer)this.primer.draw()},get y(){return this.yVal},set y(yVal){this.yVal=yVal
if(this.primer)this.primer.draw()},get visible(){return this.visibleVal},set visible(visibleVal){this.visibleVal=visibleVal
if(this.primer)this.primer.draw()},addChild:function(child){child.bind(this.primer)
this.children.push(child)
if(this.primer)this.primer.draw()},mouseover:function(fn){this.mouseoverVal=fn},mouseout:function(fn){this.mouseoutVal=fn},set fillStyle(a){this.calls.push(["fillStyle",a])},set strokeStyle(a){this.calls.push(["strokeStyle",a])},beginPath:function(){this.calls.push(["beginPath"])},moveTo:function(a,b){this.calls.push(["moveTo",a,b])},lineTo:function(a,b){this.calls.push(["lineTo",a,b])},fill:function(){this.calls.push(["fill"])},stroke:function(){this.calls.push(["stroke"])},fillRect:function(a,b,c,d){this.calls.push(["fillRect",a,b,c,d])},draw:function(){if(!this.visible){return}
this.context.save()
this.context.translate(this.x,this.y)
for(var i in this.calls){var call=this.calls[i]
switch(call[0]){case"strokeStyle":this.context.strokeStyle=call[1];break
case"fillStyle":this.context.fillStyle=call[1];break
case"fillRect":this.context.fillRect(call[1],call[2],call[3],call[4]);break
case"beginPath":this.context.beginPath();break
case"moveTo":this.context.moveTo(call[1],call[2]);break
case"lineTo":this.context.lineTo(call[1],call[2]);break
case"fill":this.context.fill();break
case"stroke":this.context.stroke();break}}
for(var i in this.children){this.children[i].draw()}
this.context.restore()},ghost:function(e){if(!this.visible){return}
this.context.save()
this.context.translate(this.x,this.y)
for(var i in this.calls){var call=this.calls[i]
switch(call[0]){case"fillRect":this.ghostFillRect(e,call[1],call[2],call[3],call[4]);break
case"beginPath":this.context.beginPath();break
case"moveTo":this.context.moveTo(call[1],call[2]);break
case"lineTo":this.context.lineTo(call[1],call[2]);break
case"fill":this.ghostFill(e);break}}
for(var i in this.children){e.localX-=this.x
e.localY-=this.y
this.children[i].ghost(e)}
this.context.restore()},ghostDetect:function(e){if(this.context.isPointInPath(e.localX-this.x,e.localY-this.y)){if(!this.mouseWithin){this.primer.actions.push([this.mouseoverVal,e])}
this.mouseWithin=true}else{if(this.mouseWithin){this.primer.actions.push([this.mouseoutVal,e])}
this.mouseWithin=false}},ghostFillRect:function(e,x,y,w,h){this.context.beginPath()
this.context.moveTo(x,y)
this.context.lineTo(x+w,y)
this.context.lineTo(x+w,y+h)
this.context.lineTo(x,y+h)
this.context.lineTo(x,y)
this.ghostDetect(e)},ghostFill:function(e){this.ghostDetect(e)}}})();(function($){$.fn.relatizeDate=function(){return $(this).each(function(){$(this).text($.relatizeDate(this))})}
$.relatizeDate=function(element){return $.relatizeDate.timeAgoInWords(new Date($(element).text()))}
$r=$.relatizeDate
$.extend($.relatizeDate,{shortDays:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],days:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],shortMonths:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],months:['January','February','March','April','May','June','July','August','September','October','November','December'],strftime:function(date,format){var day=date.getDay(),month=date.getMonth();var hours=date.getHours(),minutes=date.getMinutes();var pad=function(num){var string=num.toString(10);return new Array((2-string.length)+1).join('0')+string};return format.replace(/\%([aAbBcdHImMpSwyY])/g,function(part){switch(part[1]){case'a':return $r.shortDays[day];break;case'A':return $r.days[day];break;case'b':return $r.shortMonths[month];break;case'B':return $r.months[month];break;case'c':return date.toString();break;case'd':return pad(date.getDate());break;case'H':return pad(hours);break;case'I':return pad((hours+12)%12);break;case'm':return pad(month+1);break;case'M':return pad(minutes);break;case'p':return hours>12?'PM':'AM';break;case'S':return pad(date.getSeconds());break;case'w':return day;break;case'y':return pad(date.getFullYear()%100);break;case'Y':return date.getFullYear().toString();break;}})},timeAgoInWords:function(targetDate,includeTime){return $r.distanceOfTimeInWords(targetDate,new Date(),includeTime);},distanceOfTimeInWords:function(fromTime,toTime,includeTime){var delta=parseInt((toTime.getTime()-fromTime.getTime())/1000);if(delta<60){return'less than a minute ago';}else if(delta<120){return'about a minute ago';}else if(delta<(45*60)){return(parseInt(delta/60)).toString()+' minutes ago';}else if(delta<(120*60)){return'about an hour ago';}else if(delta<(24*60*60)){return'about '+(parseInt(delta/3600)).toString()+' hours ago';}else if(delta<(48*60*60)){return'1 day ago';}else{var days=(parseInt(delta/86400)).toString();if(days>5){var fmt='%B %d, %Y'
if(includeTime)fmt+=' %I:%M %p'
return $r.strftime(fromTime,fmt);}else{return days+" days ago"}}}})})(jQuery);(function($){$.fn.spamjax=function(callback,settings){if($.isFunction(settings)){var s=callback,callback=settings,settings=s}
var settings=settings||{}
var options={}
if(!$.facebox)settings.facebox=null
options.complete=function(xhr,ok){callback.call(this,xhr.responseText,ok)}
if(settings.confirmation){options.beforeSubmit=function(){var execute=confirm(settings.confirmation)
if(!execute)return false
if(settings.facebox)$.facebox.loading()}}else if(settings.facebox){options.beforeSubmit=$.facebox.loading}
return $(this).ajaxForm($.extend(settings,options))}})(jQuery);jQuery.fn.truncate=function(max,settings){settings=jQuery.extend({chars:/\s/,trail:["...",""]},settings);var myResults={};var ie=$.browser.msie;function fixIE(o){if(ie){o.style.removeAttribute("filter");}}
return this.each(function(){var $this=jQuery(this);var myStrOrig=$this.html().replace(/\r\n/gim,"");var myStr=myStrOrig;var myRegEx=/<\/?[^<>]*\/?>/gim;var myRegExArray;var myRegExHash={};var myResultsKey=$("*").index(this);while((myRegExArray=myRegEx.exec(myStr))!=null){myRegExHash[myRegExArray.index]=myRegExArray[0];}
myStr=jQuery.trim(myStr.split(myRegEx).join(""));if(myStr.length>max){var c;while(max<myStr.length){c=myStr.charAt(max);if(c.match(settings.chars)){myStr=myStr.substring(0,max);break;}
max--;}
if(myStrOrig.search(myRegEx)!=-1){var endCap=0;for(eachEl in myRegExHash){myStr=[myStr.substring(0,eachEl),myRegExHash[eachEl],myStr.substring(eachEl,myStr.length)].join("");if(eachEl<myStr.length){endCap=myStr.length;}}
$this.html([myStr.substring(0,endCap),myStr.substring(endCap,myStr.length).replace(/<(\w+)[^>]*>.*<\/\1>/gim,"").replace(/<(br|hr|img|input)[^<>]*\/?>/gim,"")].join(""));}else{$this.html(myStr);}
myResults[myResultsKey]=myStrOrig;$this.html(["<div class='truncate_less'>",$this.html(),settings.trail[0],"</div>"].join("")).find(".truncate_show",this).click(function(){if($this.find(".truncate_more").length==0){$this.append(["<div class='truncate_more' style='display: none;'>",myResults[myResultsKey],settings.trail[1],"</div>"].join("")).find(".truncate_hide").click(function(){$this.find(".truncate_more").css("background","#fff").fadeOut("normal",function(){$this.find(".truncate_less").css("background","#fff").fadeIn("normal",function(){fixIE(this);$(this).css("background","none");});fixIE(this);});return false;});}
$this.find(".truncate_less").fadeOut("normal",function(){$this.find(".truncate_more").fadeIn("normal",function(){fixIE(this);});fixIE(this);});jQuery(".truncate_show",$this).click(function(){$this.find(".truncate_less").css("background","#fff").fadeOut("normal",function(){$this.find(".truncate_more").css("background","#fff").fadeIn("normal",function(){fixIE(this);$(this).css("background","none");});fixIE(this);});return false;});return false;});}});};var GitHub={gravatar:function(md5,size){size=size||35
var host=location.protocol=='https:'?'https://secure.gravatar.com':'http://gravatar.com'
var prot=location.protocol=='https:'?'https':'http'
return'<img src="'+host+'/avatar/'+md5+'?s='+size+'&d='+prot+'%3A%2F%2Fgithub.com%2Fimages%2Fgravatars%2Fgravatar-'+size+'.png" />'},rename_confirmation:function(){return"Read the following before clicking OK:\n\n\
* This may take a few minutes.\n\
* We won't setup any redirects from your old name. This includes repository urls, your profile, any feeds, etc. \
In other words, if you have a popular project, you're probably going to upset a lot of people.\n\
* You'll need to update any .git/config's to point to your new name if you have local copies of your repo(s).\n\n\
Ready to proceed?"}}
Function.prototype.delay=function(time){return setTimeout(this,time)}
$.fn.scrollTo=function(el,speed){if(typeof el=='number'||!el){speed=el
target=this
container='html,body'}else{target=el
container=this}
var offset=$(target).offset().top-30
$(container).animate({scrollTop:offset},speed||1000)
return this}
$.gitbox=function(url,klass){$.facebox(function(){$.get(url,function(data){$.facebox(data,'nopad')
$('#facebox .footer').hide()})})}
$.fn.spin=function(){return this.after('<img src="/images/modules/ajax/indicator.gif" id="spinner"/>')}
$.fn.stopSpin=function(){return this.next().remove()}
$.extend(GitHub,{scrollToHilightedLine:function(){var lines,target=window.location.hash
if(lines=target.match(/^#?(?:L|-)(\d+)$/g)){lines=$.map(lines,function(line){return parseInt(line.replace(/\D/g,''))})
$('#LID'+lines[0]).scrollTo(1)}}})
$(function(){GitHub.scrollToHilightedLine()
$('.jshide').hide()
$('.toggle_link').click(function(){$($(this).attr('href')).toggle()
return false})
$('.hide_alert').livequery('click',function(){$('#site_alert').slideUp()
$.cookie('hide_alert_vote','t',{expires:7,path:'/'})
return false})
$('.hide_div').click(function(){$(this).parents('div:first').fadeOut()
return false})
$('#login_field').focus()
$('#versions_select').change(function(){location.href=this.value})
if($.fn.facebox)$('a[rel*=facebox]').facebox()
if($.fn.fancyZoom)$('a[rel*=fancyzoom]').fancyZoom({directory:'images/fancyzoom'})
if($.fn.truncate){$('.truncate').bind('truncate',function(){$(this).truncate(50,{chars:/.*/})}).trigger('truncate')}
if($.fn.corner)$('.corner').corner()
if($.fn.relatizeDate)$('.relatize').relatizeDate()
$('a[href=#][alt^=""]').hover(function(){window.status=$(this).attr('alt')},function(){window.status=''})
$.hotkey('s',function(){$('.topsearch input[name=q]').val('').focus()})
$.userAutocomplete=function(){if(!$.fn.autocomplete)return
$(".autocompleter").autocomplete('/users/ajax_search',{formatItem:function(row){row=row[0].split(' ')
return GitHub.gravatar(row[1],24)+' '+row[0]},formatResult:function(row){return row[0].split(' ')[0]}})
$(".autocompleter").result(function(){$(this).addClass('accept')})
$(".autocompleter").keypress(function(){$(this).removeClass('accept')})}
$.userAutocomplete()
if($('#csrf_token').length>0){var auth_string='&request_uri='+window.location.pathname+'&authenticity_token='+$('#csrf_token').text()
$.ajaxSetup({beforeSend:function(xhr,settings){xhr.setRequestHeader("Accept","text/javascript")
if(typeof settings.data=='string'){settings.data+=auth_string}else if(!settings.data){settings.data=auth_string}}})}else{$.ajaxSetup({'beforeSend':function(xhr){xhr.setRequestHeader("Accept","text/javascript")}})}});GitHub.highlightLines=function(e){var target,lines
if(e){$('.line').css('background-color','transparent')
target=$(this).attr('rel')
if(e.shiftKey){target=window.location.hash.replace(/-\d+/,'')+'-'+target.replace(/\D/g,'')}
window.location.hash=target}else{target=window.location.hash}
if(lines=target.match(/#?(?:L|-)(\d+)/g)){lines=$.map(lines,function(line){return parseInt(line.replace(/\D/g,''))})
if(lines.length==1)
return $('#LC'+lines[0]).css('background-color','#ffc')
for(var i=lines[0];i<=lines[1];i++)
$('#LC'+i).css('background-color','#ffc')
$('#LC'+lines[0]).scrollTo(1)}
return false}
$(function(){GitHub.highlightLines()
$('.line_numbers span').mousedown(GitHub.highlightLines)});GitHub.Commit={currentBubble:null,dumpEmptyClass:function(){$(this).removeClass('empty')},addEmptyClass:function(){if(!$(this).data('clicked')&&$(this).text()=='0')$(this).addClass('empty')},highlightLine:function(){$(this).parent().css('background','#ffc')},unhighlightLine:function(){if(!$(this).data('clicked'))$(this).parent().css('background','')},jumpToHashFile:function(){if(window.location.hash&&!/diff-\d+/.test(window.location.hash)){var line,hash=window.location.hash
if(position=hash.match(/-P(\d+)/)){hash=hash.replace(position[0],'')
position=position[1]}
var target=$('#toc a:contains("'+hash.replace('#','')+'")')
if(target.length>0){var diff=target.attr('href')
$(diff).scrollTo(1)
if(position){setTimeout(function(){GitHub.Commit.highlightLine.call($(diff+' .cp-'+position))},50)}}}},observeHash:function(){if(window.location.hash!=GitHub.Commit.oldHash){GitHub.Commit.oldHash=window.location.hash
GitHub.Commit.jumpToHashFile()}}}
$(function(){GitHub.Commit.jumpToHashFile()
GitHub.Commit.oldHash=window.location.hash
setInterval(GitHub.Commit.observeHash,50)
var clearHovered=function(){if(GitHub.Commit.hovered){GitHub.Commit.addEmptyClass.call(GitHub.Commit.hovered)
GitHub.Commit.unhighlightLine.call(GitHub.Commit.hovered)
GitHub.Commit.hovered=null}}
$('#files').mouseout(function(e){var bubble=$(e.target)
bubble=bubble.is('.bubble')?bubble:bubble.parent()
if(bubble.is(':not(.faux-bubble)'))clearHovered()})
$('#files').mouseover(function(e){var bubble=$(e.target)
bubble=bubble.is('.bubble')?bubble:bubble.parent()
if(!bubble.is('.bubble'))return
GitHub.Commit.hovered=bubble
if(bubble.is('.empty'))
GitHub.Commit.dumpEmptyClass.call(bubble)
if(bubble.is(':not(.faux-bubble)'))
GitHub.Commit.highlightLine.call(bubble)})
$('#files').click(function(e){var bubble=$(e.target)
bubble=bubble.is('.bubble')?bubble:bubble.parent()
if(!bubble.is('.bubble'))return
bubble.data('clicked',true)
GitHub.currentBubble=bubble
var url=window.location.pathname.replace('commit','comments')
url+='/'+$.trim(bubble.parents('.file').find('.meta .info').text())
if(bubble.is(':not(.faux-bubble)')){var pos=parseInt(bubble.attr('class').match(/cp-(\d+)/)[1])
url+='?position='+pos}
if(pos){var firstLine=parseInt(bubble.parents('tbody').find('.line_numbers:first > a:first').text())
url+='&line='+(firstLine+pos-1)}
$.gitbox(url)})
$(document).bind('close.facebox',function(){if(GitHub.currentBubble){var el=GitHub.currentBubble
$(el).data('clicked',false)
GitHub.Commit.unhighlightLine.call(el)
GitHub.Commit.addEmptyClass.call(el)}})
$('.add_comment').livequery('click',function(){var text=$.trim($('#commit_comment_form textarea').val())
if(text==''){$('#commit_comments .inner').scrollTo('#commit_comment_form')}else{$('.actions :button').attr('disabled',true)
$('.add_comment').spin()
$.post($('#commit_comment_form').attr('action'),{body:text},function(data){$('.no_one').remove()
$('.comment_list .previewed').remove()
$('.comment_list').append('<li>'+data+'</li>')
$('#commit_comment_form textarea').val('')
$('.actions :button').attr('disabled',false).stopSpin()
GitHub.currentBubble.addClass('commented')
var count=GitHub.currentBubble.find('span')
count.text(parseInt(count.text())+1)})}})
$('#preview_comment').livequery('click',function(){$('.actions :button').attr('disabled',true)
$('.add_comment').spin()
var target=$('#commit_comment_form').attr('action').replace('create','preview')
var text='*Comment Preview:* '+$.trim($('#commit_comment_form textarea').val())
$.post(target,{body:text},function(data){$('.no_one').remove()
$('.comment_list .previewed').remove()
$('.comment_list').append('<li class="previewed">'+data+'</li>')
$('.actions :button').attr('disabled',false).stopSpin()})})
$('.delete_comment').click(function(){var self=this
$(this).spin()
$.post(this.href,{'_method':'delete'},function(){$(self).next().remove()
$(self).parents('.comment').hide()})
return false})
$('#add_comment_button').click(function(){var self=this
$(self).spin().attr('disabled',true)
setTimeout(function(){$(self).parents('form').submit()},10)})
$.each(['line','file','all'],function(_,type){var klass=type+'_link'
$('a.'+klass).livequery('click',function(){$('.links a').show()
$('h1 span').hide()
$('span.'+klass).show()
$('a.'+klass).hide()
$('span.'+type+'_header').show()
$('.comment_list').hide()
$('#comments_for_'+type).toggle()
return false})})});GitHub.Commits={elements:[],current:null,selected:function(){return $(this.elements).eq(this.current)},select:function(index){this.current=index
$('.selected').removeClass('selected')
return this.elements.eq(index).addClass('selected')},next:function(){if(this.current!==null){if(this.elements.length-1==this.current)return
var el=this.select(++this.current)
if(el.offset().top-$(window).scrollTop()+50>$(window).height())el.scrollTo(200)}else{this.select(0)}},prev:function(){if(!this.current){this.elements.eq(0).removeClass('selected')
return this.current=null}
var el=this.select(--this.current)
if(el.offset().top-$(window).scrollTop()<0)el.scrollTo(200)},link:function(key){if(GitHub.Commits.current===null)return false
window.location=GitHub.Commits.selected().find('[hotkey='+key+']').attr('href')}}
$(function(){GitHub.Commits.elements=$('.commit')
$.hotkeys({c:function(){GitHub.Commits.link('c')},p:function(){GitHub.Commits.link('p')},t:function(){GitHub.Commits.link('t')},j:function(){GitHub.Commits.next()},k:function(){GitHub.Commits.prev()}})
$('#invite_link > a').click(function(){var url=location.pathname.match(/(.+\/commits)(\/|$)/)[1]+'/invitees'
$.post(url,{},function(invitees){if(invitees.length==0){$('#invitee_box > p').text("Everyone is already a GitHub user and/or there weren't any valid emails")
$('#invitee_box input').attr('disabled','disabled')}else{for(var i in invitees){var html='<li><label><input name="emails[]" value="'+invitees[i][0]+'" type="checkbox" /> '
html+=invitees[i][1]+' <small> - '+invitees[i][0]+'</label></li>'
$('#invitees').append(html)}
$('#invitee_box > p').hide()}},'json')
$(this).hide()
$('#invitee_box').show()
return false})
$('#invite_form').submit(function(){$(this).find('input[type=submit]').attr('value','Sending Invites...').attr('disabled','disabled')
$.post($(this).attr('action'),$(this).serialize(),function(){$('#invitee_box').html('<h3>Thanks!</h3>Your invites have been sent.')})
return false})
$('#invitee_box span a').click(function(){$('#invitee_box').hide()
return false})});$(function(){$('.repo_filter').click(function(){$('#repo_listing li').hide()
$('#repo_filter a').removeClass('filter_selected')
$(this).addClass('filter_selected')
$('#repo_listing li.'+$(this).attr('rel')).show()
return false})
$('.reveal_commits, .hide_commits').click(function(){var div=$(this).parents('.details')
div.find('.reveal, .hide_commits, .commits').toggle()
return false})});$(function(){$('#downloads .delete').click(function(){if(confirm('Are you sure you want to delete this?')){$(this).hide().parents('form').append('deleting&hellip;').submit()}
return false})})
GitHub.editableGenerator=function(options){return function(_,self){var defaults={id:'field',tooltip:'Click to edit!',indicator:'Saving...',data:function(data){return $(self).attr('data')||data},style:"display: inline",onblur:'submit',callback:function(){(function(){if($(self).attr('data'))$(self).attr('data',$(self).text())
$(self).trigger('truncate').next().show()
$(self).trigger('afterSave.editableGenerator')}).delay(20)}}
return $(this).editable($(this).attr('rel'),$.extend({},defaults,options))}}
$(function(){$('.edit_link').click(function(){$(this).prev().trigger('click')
return false})});$(function(){$('#import-authors').click(function(){var button=$(this).val('Generating Author List...').attr('disabled','disabled')
var post_url=$('#new_repository').attr('action')+'/grab_authors'
$.post(post_url,{'svn_url':$('#svn_url').val()},function(authors){if(authors.toString()==''){button.attr('disabled','').val('Step 1: Import Authors')
alert("No authors were returned, please try a different URL")}else{$('#authors').show()
$.each(authors,function(i,author){var li=$('<tr><td><input type="text" disabled="disabled" value="'+author+'" name="svn_authors[]" /></td><td><input size="40" type="text" name="git_authors[]"/></td></tr>')
li.appendTo('#authors-list')})
button.parent().remove()
$('#import-submit').show()}},'json')
return false})
$('#import-submit').click(function(){$(this).attr('disabled','disabled')
var form=$(this).parent().parent()
form.find('input[name="svn_authors[]"]').attr('disabled','')
form.submit()})
$('.repo span.edit').each(GitHub.editableGenerator({width:'350px'}))
$('.repo span.editarea').each(GitHub.editableGenerator({type:'textarea',width:'550px',height:'100px',cancel:'Cancel',submit:'OK'}))
$('span.edit, span.editarea').click(function(){$(this).next().hide()})
$('#run_postreceive_test').click(function(){$.post(location.href+'/test_postreceive',{})
$.facebox($('#postreceive_test').text())
return false})
$('#repository_postreceive_url').bind('afterSave.editableGenerator',function(){if($('#repository_postreceive_url').text().slice(0,4)=='http')
$('#run_postreceive_test').show()
else
$('#run_postreceive_test').hide()})
$('#add_new_member_link').click(function(){$('#add_new_member_link').parent().hide()
$('#add_new_member').show()
$('#add_member').focus()
return false})
$('#add_member_cancel').click(function(){$('#add_new_member').hide().find('input[type=text]').val('')
$('#add_new_member_link').parent().show()
return false})
$('#add_new_member form').submit(function(){$('#add_member_cancel').spin()
$('#add_new_member :submit').attr('disabled',true)
$.post(this.action,{'member':$('#add_member').val()},function(data){if($.inArray($(data).find('a:first').text(),$('.members li a:not(.action)').map(function(){return $(this).text()}))==-1)
$('.members').append(data)
$('#add_member').val('').css('background-color','').focus()
$('#add_new_member :submit').attr('disabled',false)
$('#spinner').remove()})
return false})
$('.revoke_member').click(function(){$.post(this.href,'',function(data){console.log(data)})
$(this).parent().parent().remove()
return false})
$('.toggle_permission').click(function(){$('.public_repo, .private_repo, .public_security, .private_security').toggle()
if($('.repo').is('.public'))$('.repo').removeClass('public').addClass('private')
else $('.repo').removeClass('private').addClass('public')
$.post(this.href,'')
return false})
$('#copy_permissions ul li a').click(function(){$(this).parents('form').submit()
return false})
$('#delete_repo').click(function(){var confirm_string='Are you sure you want to delete this repository?  There is no going back.'
return confirm(confirm_string)})
$('#reveal_delete_repo_info').click(function(){$(this).toggle()
$('#delete_repo_info').toggle()
return false})
$('#repo_rename > input[type=submit]').click(function(){if(!confirm(GitHub.rename_confirmation())){return false}})
$('.toggle_watch').click(function(){if($('.userbox').length==0)return true
$('.toggle_watch').toggle()
$.post($(this).attr('href'),{data:{}})
return false})
$('.git_url_facebox').click(function(){$.facebox($($(this).attr('rel')).html(),'tip')
return false})
$('#donate_activate_toggle a').click(function(){$(this).parent().hide()
$('#donate_activate').show()
return false})
$('#pledgie_deactivate').click(function(){$('#paypal').val('')
return true})
$('.pull_request_button').click(function(){var url=location.pathname,ref=url.split('/')[4],target=url.split('/').slice(0,3).join('/'),self=this
$.facebox(function(){$.get(target+'/pull_request/'+ref,function(data){$.facebox(data,'nopad')
$('#facebox .footer').hide()
$.userAutocomplete()})})
return false})
$('.repo_toggle').click(function(){var options={}
options['field']=this.id
options['value']=this.checked?'1':'0'
var url=window.location.pathname.replace('edit','update')
$.post(url,options)
$('#rubygem_save').show()})
$('.test_hook').click(function(){var self=$(this).spin().siblings('.right').remove().end()
var href=location.href.replace(/hooks/,'test_service')
$.post(href,{name:self.attr('rel')||''},function(){self.next().remove()
self.next().after('<div class="right"><em>Payload deployed</em></div>')})
return false})
$('.postreceive_hook_help').click(function(){$('#postreceive_urls-help').toggle()
return false})
$('.hook_help').click(function(){var div=$('#'+this.id.replace('-toggle',''))
if(div.is(":visible")){div.hide()}else{div.show()
div.html('<pre>Loading...</pre>')
var url='/pjhyett/github-services/tree/master/docs/'+div.attr('id').replace('-help','')
$.get(url,{'raw':'true'},function(data){div.html('<pre>'+data+'</pre>')})}
return false})
$('#close_facebox').livequery('click',function(){$(document).trigger('close.facebox')
return false})
$('#pull_request .select_all').livequery('click',function(){$('#facebox :checkbox').attr('checked',true)
return false})
$('#pull_request .add_recipient').livequery('click',function(){var user=$(this).prev().val()
$(this).prev().val('').css('background','Window')
if(!$.trim(user))return
var list=$('#pull_request .recipients ul')
var recipients=list.find('li').map(function(){return $.trim($(this).text())})
if($.inArray(user,recipients)>=0)return list.find('li:contains('+user+') :checkbox').attr('checked',true)
$('#pull_request .recipients ul').prepend('<li><label><input type="checkbox" name="message[to][]" value="'+user+'"/> '+user+'</label>').end().find(':checkbox:first').attr('checked',true)})
$('#pull_request_form').livequery('submit',function(){var empty=[]
var recipient_controls=$(this).find("input[name='message[to][]']")
recipient_controls.each(function(){if($(this).is(':checkbox')&&!$(this).attr('checked')||$(this).is(':text')&&$(this).val()=='')
empty.push($(this))})
if(empty.length==recipient_controls.length){$('#pull_request_error').show().text('Please select at least one recipient.')
return false}else{$(this).ajaxSubmit(function(){$('#pull_request_error').remove()
$('#pull_request').find('h1').text('Sent!').end().find('.pull_request_inside').empty().append('<p>Your pull request was sent.</p>').end().find('.actions span').remove().end().find('#close_facebox').text('Close')
var close=setTimeout(function(){$(document).trigger('close.facebox')},2500)
$(document).one('close.facebox',function(){clearTimeout(close)})})
return false}})
$('#remove_auto_responder').livequery('click',function(){$.ajax({async:true,type:'PUT',url:window.location.pathname.replace('edit','update_pull_request_auto_response')})
$('#auto_responder_details').html('<a href="#" id="add_auto_responder">Add auto-responder</a>')
return false})
$('#add_auto_responder').livequery('click',function(){$.facebox({div:'#auto_response_editor'},'nopad')
$('#facebox .footer').hide()
return false})
$('.cancel_auto_response_action').livequery('click',function(){$.facebox.close()
return false})
$('.auto_response_form').livequery('submit',function(){var self=this,auto_response
$(self).ajaxSubmit(function(key){$.facebox.close()
auto_response=$(self).find('textarea').val().slice(0,40)
if(auto_response.length>=40)
auto_response+='...'
$('#auto_responder_details').html('<em>'+auto_response+'</em> ('+'<a href="#" id="remove_auto_responder">Remove auto-responder</a>)')})
return false;})
$('.add_postreceive_url').livequery('click',function(){var parent=$(this).parent()
var row=parent.clone()
var fieldset=$(this).parents('fieldset')
row.find('input').val('')
fieldset.find('p:last').before(row)
var remove=fieldset.find('.remove_postreceive_url:first').clone()
parent.find('a').after(remove.show())
parent.find('a:first').remove()
return false})
$('.remove_postreceive_url').livequery('click',function(){$(this).parent().remove()
return false})
$('.unlock_branch').click(function(){var path=location.pathname.split('/'),target='/'+path[1]+'/'+path[2]+'/unlock_branch/'+path[4],div=$(this).parents('.notification')
$(this).spin().remove()
var self=this
$.post(target,function(){div.hide()})
return false})});GitHub.Fluid={init:function(){if(!window.fluid)return
with(GitHub.Fluid){setDockCount()
addMenuItems()}},setDockCount:function(){window.fluid.dockBadge=$('.inbox strong a').text()},addMenuItems:function(){with(GitHub.Fluid){addDockJump("My Account",'/account')
addDockJump("News",'/news')
addDockJump("Repositories",'/repositories')
addDockJump("Popular Watched",'/popular/watched')
addDockJump("Popular Forked",'/popular/forked')}},addDockJump:function(name,path){window.fluid.addDockMenuItem(name,function(){window.location='http://github.com'+path})}}
$(GitHub.Fluid.init);$(function(){var head_sha=$('#forkqueue #head-sha').text();$('#forkqueue .untested').each(function(i,dom){var sha=$(dom).attr('name')
var response=$.ajax({url:"forkqueue/applies/"+head_sha+"/"+sha,async:false}).responseText;if(response=='YUP'){$(dom).addClass('clean');}else{$(dom).addClass('unclean');}});$('.action-choice').change(function(evt){var action=$(this).attr('value');if(action=='ignore'){var rows=$(this).parents('form').contents().find('input:checked')
rows.each(function(i,dom){var sha=$(dom).attr('ref');$(dom).parents('tr').children('.icons').html('ignoring...');$.post("forkqueue/ignore/"+sha,{});$(dom).parents('tr').fadeOut();})}else if(action=='apply'){var form=$(this).parents('form');form.submit();}
$(this).children('.default').attr('selected',1);});var fork_queue_selection_log=[]
$('#forkqueue input[type=checkbox]').click(function(evt){var m=$(this).attr('class').match(/^r-(\d+)-(\d+)$/)
var i=parseInt(m[1])
var j=parseInt(m[2])
if(evt.shiftKey&&fork_queue_selection_log.length>0){var lastRow=fork_queue_selection_log[fork_queue_selection_log.length-1]
var mLast=lastRow.match(/^r-(\d+)-(\d+)$/)
var iLast=parseInt(mLast[1])
var jLast=parseInt(mLast[2])
if(i==iLast){var selectionType=$(this).attr('checked')==true
var jSorted=[j,jLast].sort()
var jFrom=jSorted[0]
var jTo=jSorted[1]
for(var k=jFrom;k<jTo;k++){if(selectionType==true){$('#forkqueue input.r-'+i+'-'+k).attr("checked","true")}else{$('#forkqueue input.r-'+i+'-'+k).removeAttr("checked")}}}}
fork_queue_selection_log.push($(this).attr("class"))})
$('#forkqueue a.select_all').click(function(){$(this).removeClass("select_all")
var klass=$(this).attr('class')
$(this).addClass("select_all")
$('#forkqueue tr.'+klass+' input[type=checkbox]').attr('checked','true')
fork_queue_selection_log=[]
return false})
$('#forkqueue a.select_none').click(function(){$(this).removeClass("select_none")
var klass=$(this).attr('class')
$(this).addClass("select_none")
$('#forkqueue tr.'+klass+' input[type=checkbox]').removeAttr('checked')
fork_queue_selection_log=[]
return false})
$('table#queue tr.not-applied:first').each(function(){applyNextPatch()})
$('#change-branch').click(function(){$('#int-info').hide()
$('#int-change').show()
return false})
$('#change-branch-nevermind').click(function(){$('#int-change').hide()
$('#int-info').show()
return false})
function applyNextPatch(){var not_applied=$('table#queue tr.not-applied').length
var head_sha=$('#head-sha').text()
if(not_applied>0){var total_size=$('#total-commits').text()
$('#current-commit').text((total_size-not_applied)+1);var next=$('table#queue tr.not-applied:first')
var sha=next.attr('name')
$('.date',next).html('applying')
$('.icons',next).html('<img src="/images/modules/ajax/indicator.gif" alt="Processing" />')
$.post("patch/"+head_sha+"/"+sha,function(data){next.removeClass('not-applied')
if(data=='NOPE'){next.addClass('unclean_failure')
$('.date',next).html('failed')
$('.icons',next).html('<img src="/images/icons/exclamation.png" alt="Failed" />')}else{$('#head-sha').text(data)
next.addClass('clean')
$('.date',next).html('applied')
$('.apply-status',next).attr('value','1')
$('.icons',next).html('<img src="/images/modules/dashboard/news/commit.png" alt="Applied" />')}
applyNextPatch()})}else{$('#new-head-sha').attr('value',head_sha)
$('#finalize').show()}}
$('#refresh-network-data').each(function(){$.post("network_meta",function(data){$('#fq-refresh').show()
$('#fq-notice').hide()})})});$(function(){if($('.business .logos').length>0){var data=[["CustomInk","customink.png","http://customink.com/"],["Pivotal Labs","pivotallabs.png","http://pivotallabs.com/"],["FiveRuns","fiveruns.png","http://fiveruns.com/"],["PeepCode","peepcode.png","http://peepcode.com/"],["Mustache","mustache.png","http://mustacheinc.com/"],["Frogmetrics","frogmetrics.png","http://frogmetrics.com/"],["Upstream","upstream.png","http://upstream-berlin.com/"],["Terralien","terralien.png","http://terralien.com/"],["Planet Argon","planetargon.png","http://planetargon.com/"],["Tightrope Media Systems","tightropemediasystems.png","http://trms.com/"],["Rubaidh","rubaidh.png","http://rubaidh.com/"],["Iterative Design","iterativedesigns.png","http://iterativedesigns.com/"],["GiraffeSoft","giraffesoft.png","http://giraffesoft.com/"],["Evil Martians","evilmartians.png","http://evilmartians.com/"],["Crimson Jet","crimsonjet.png","http://crimsonjet.com/"],["Alonetone","alonetone.png","http://alonetone.com/"],["EntryWay","entryway.png","http://entryway.net/"],["Fingertips","fingertips.png","http://fngtps.com/"],["Run Code Run","runcoderun.png","http://runcoderun.com/"],["Be a Magpie","beamagpie.png","http://be-a-magpie.com/"],["Rocket Rentals","rocketrentals.png","http://rocket-rentals.de/"],["Connected Flow","connectedflow.png","http://connectedflow.com/"],["Dwellicious","dwellicious.png","http://dwellicious.com/"],["Assay Depot","assaydepot.png","http://www.assaydepot.com/"],["Centro","centro.png","http://www.centro.net/"],["yreality","yreality.png","http://yreality.net/"],["Debuggable Ltd.","debuggable.png","http://debuggable.com/"],["Blogage.de","blogage.png","http://blogage.de/"],["ThoughtBot","thoughtbot.png","http://www.thoughtbot.com/"],["Viget Labs","vigetlabs.png","http://www.viget.com/"],["RateMyArea","ratemyarea.png","http://www.ratemyarea.com/"],["Abloom","abloom.png","http://abloom.at/"],["LinkingPaths","linkingpaths.png","http://www.linkingpaths.com/"],["MIKAMAI","mikamai.png","http://mikamai.com/"],["BEKK","bekk.png","http://www.bekk.no/"],["Reductive Labs","reductivelabs.png","http://www.reductivelabs.com/"],["Sexbyfood","sexbyfood.png","http://www.sexbyfood.com/"],["Factorial, LLC","yfactorial.png","http://yfactorial.com/"],["SnapMyLife","snapmylife.png","http://www.snapmylife.com/"],["Scrumy","scrumy.png","http://scrumy.com/"],["TinyMassive","tinymassive.png","http://www.tinymassive.com/"],["SOCIALTEXT","socialtext.png","http://www.socialtext.com/"],["All-Seeing Interactive","allseeinginteractive.png","http://allseeing-i.com/"],["Howcast","howcast.png","http://www.howcast.com/"],["Relevance Inc","relevance.png","http://thinkrelevance.com/"],["Nitobi Software Inc","nitobi.png","http://www.nitobi.com/"],["99designs","99designs.png","http://99designs.com/"],["EdgeCase, LLC","edgecase.png","http://edgecase.com"],["EMI Group Limited","emi.png","http://emi.com/"],["TechCrunch","techcrunch.png","http://techcrunch.com/"],["WePlay","weplay.png","http://weplay.com/"],["Shopify","shopify.png","http://shopify.com/"]]
var start=function(){var list=$('.business .logos table')
$.each(data,function(i,el){list.append('<tr><td><a href="'+el[2]+'"><img src="http://assets'+(i%4)+'.github.com/images/modules/home/customers/'+el[1]+'" alt="'+el[0]+'" /></a></td></tr>')})
var ystart=parseInt($('.business .slide').css('top'))
var size=$('.business .logos td').length-4
var count=0
var slider=function(){count+=1
var ynow=parseInt($('.business .slide').css('top'))
if(Math.abs(ynow+(size*75))<25){$('.business .slide').css('top',0)
count=0}else{$('.business .slide').animate({top:"-"+(count*75)+"px"},1500)}}
setInterval(slider,3000)}
setTimeout(start,1000)}});$(function(){$('.cancel').click(function(){window.location='/inbox'
return false})
$('#inbox .del a').click(function(){var self=this
$.ajax({url:$(this).attr('rel'),data:{_method:'delete'},type:'POST',success:function(){$(self).parents('.item').hide()}})
return false})
$('#message .del a').click(function(){var self=this
$.ajax({url:window.location.href,data:{_method:'delete'},type:'POST',success:function(){window.location='/inbox'}})
return false})
$('#reveal_deleted').click(function(){$(this).parent().hide()
$('.hidden_message').show()
return false})});$(function(){if($('#impact_graph').length>0){GitHub.ImpactGraph.drawImpactGraph()}})
GitHub.ImpactGraph={colors:null,data:null,chunkVerticalSpace:2,initColors:function(authors){seedColors=[[222,0,0],[255,141,0],[255,227,0],[38,198,0],[0,224,226],[0,33,226],[218,0,226]]
this.colors=new Array()
var i=0
for(var author in authors){var color=seedColors[i%7]
if(i>6){color=[this.randColorValue(color[0]),this.randColorValue(color[1]),this.randColorValue(color[2])]}
this.colors.push(color)
i+=1}},drawImpactGraph:function(){var streams={}
var repo=$('#impact_graph').attr('rel')
var self=this
$.getJSON("/"+repo+"/graphs/impact_data",function(data){self.initColors(data.authors)
var ctx=self.createCanvas(data)
data=self.padChunks(data)
self.data=data
$.each(data.buckets,function(i,item){self.drawBucket(streams,item,i)})
self.drawAll(ctx,data,streams)
self.authorHint()})},createCanvas:function(data){var width=data.buckets.length*50*2-50
var height=0
for(var i in data.buckets){var bucket=data.buckets[i]
var bucketHeight=0
for(var j in bucket.i){var chunk=bucket.i[j]
bucketHeight+=this.normalizeImpact(chunk[1])+this.chunkVerticalSpace}
if(bucketHeight>height){height=bucketHeight}}
$('#impact_graph div').remove()
var els=$('#impact_graph')
els.height(height+50).css("border","1px solid #aaa")
$('#caption').show()
els.append('<canvas width="'+width+'" height="'+(height+30)+'"></canvas>')
var elc=$('#impact_graph canvas')[0]
return elc.getContext('2d')},padChunks:function(data){for(var author in data.authors){var first=this.findFirst(author,data)
var last=this.findLast(author,data)
for(var i=first+1;i<last;i++){if(!this.bucketHasAuthor(data.buckets[i],author)){data.buckets[i].i.push([author,0])}}}
return data},bucketHasAuthor:function(bucket,author){for(var j=0;j<bucket.i.length;j++){if(bucket.i[j][0]==parseInt(author)){return true}}
return false},findFirst:function(author,data){for(var i=0;i<data.buckets.length;i++){if(this.bucketHasAuthor(data.buckets[i],author)){return i}}},findLast:function(author,data){for(var i=data.buckets.length-1;i>=0;i--){if(this.bucketHasAuthor(data.buckets[i],author)){return i}}},colorFor:function(author){var color=this.colors[author]
return("rgb("+color[0]+","+color[1]+","+color[2]+")")},randColorValue:function(seed){var delta=Math.round(Math.random()*100)-50
var newVal=seed+delta
if(newVal>255){newVal=255}
if(newVal<0){newVal=0}
return(newVal)},drawBucket:function(streams,bucket,i){var maxY=0
var self=this
$.each(bucket.i,function(j,chunk){var authorID=chunk[0]
var impact=self.normalizeImpact(chunk[1])
if(!streams[authorID]){streams[authorID]=new Array()}
streams[authorID].push([i*100,maxY,50,impact,chunk[1]])
maxY=maxY+impact+self.chunkVerticalSpace})},normalizeImpact:function(size){if(size<=9){return size+1}else if(size<=5000){return Math.round(10+size/50)}else{return Math.round(100+(Math.log(size)*10));}},drawAll:function(ctx,data,streams){this.drawStreams(ctx,streams,null)
this.drawDates(data)},drawStreams:function(ctx,streams,topAuthor){ctx.clearRect(0,0,10000,500)
$('.activator').remove()
for(var author in streams){if(author!=topAuthor){this.drawStream(author,streams,ctx,true)}}
if(topAuthor!=null){this.drawStream(topAuthor,streams,ctx,false)}},drawStream:function(author,streams,ctx,activator){ctx.fillStyle=this.colorFor(author)
chunks=streams[author]
for(var i=0;i<chunks.length;i++){var chunk=chunks[i]
ctx.fillRect(chunk[0],chunk[1],chunk[2],chunk[3])
if(activator){this.placeActivator(author,streams,ctx,chunk[0],chunk[1],chunk[2],chunk[3],chunk[4])}
if(i!=0){ctx.beginPath()
ctx.moveTo(previousChunk[0]+50,previousChunk[1])
ctx.bezierCurveTo(previousChunk[0]+75,previousChunk[1],chunk[0]-25,chunk[1],chunk[0],chunk[1])
ctx.lineTo(chunk[0],chunk[1]+chunk[3])
ctx.bezierCurveTo(chunk[0]-25,chunk[1]+chunk[3],previousChunk[0]+75,previousChunk[1]+previousChunk[3],previousChunk[0]+50,previousChunk[1]+previousChunk[3])
ctx.fill()}
previousChunk=chunk}},drawStats:function(author,streams){chunks=streams[author]
for(var i=0;i<chunks.length;i++){var chunk=chunks[i]
var impact=chunk[4]
if(impact>10){this.drawStat(impact,chunk[0],chunk[1]+(chunk[3]/2))}}},drawStat:function(text,x,y){var styles=''
styles+='position: absolute;'
styles+='left: '+x+'px;'
styles+='top: '+y+'px;'
styles+='width: 50px;'
styles+='text-align: center;'
styles+='color: #fff;'
styles+='font-size: 9px;'
styles+='z-index: 0;'
$('#impact_graph').append('<p class="stat" style="'+styles+'">'+text+'</p>')},drawDate:function(text,x,y){y+=3
var styles=''
styles+='position: absolute;'
styles+='left: '+x+'px;'
styles+='top: '+y+'px;'
styles+='width: 50px;'
styles+='text-align: center;'
styles+='color: #888;'
styles+='font-size: 9px;'
$('#impact_graph').append('<p style="'+styles+'">'+text+'</p>')},placeActivator:function(author,streams,ctx,x,y,w,h,impact){y+=5
var styles=''
styles+='position: absolute;'
styles+='left: '+x+'px;'
styles+='top: '+y+'px;'
styles+='width: '+w+'px;'
styles+='height: '+h+'px;'
styles+='z-index: 100;'
styles+='cursor: pointer;'
var id='a'+x+'-'+y
$('#impact_graph').append('<div class="activator" id="'+id+'" style="'+styles+'">&nbsp;</div>')
var self=this
$('#'+id).mouseover(function(e){$(e.target).css("background-color","black").css("opacity","0.08")
self.drawAuthor(author)}).mouseout(function(e){$(e.target).css("background-color","transparent")
self.clearAuthor()
self.authorHint()}).mousedown(function(){$('.stat').remove()
self.clearAuthor()
self.drawStreams(ctx,streams,author)
self.drawStats(author,streams)
self.drawSelectedAuthor(author)
self.authorHint()})},drawDates:function(data){var self=this
$.each(data.buckets,function(i,bucket){var max=0
$.each(bucket.i,function(j,chunk){max+=self.normalizeImpact(chunk[1])+1})
var months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
var date=new Date()
date.setTime(bucket.d*1000)
var dateString=''+date.getDate()+' '+months[date.getMonth()]+' '+date.getFullYear()
self.drawDate(dateString,i*100,max+7)})},authorText:function(text,x,y){var id=null
if(y<25){id='selected_author_text'}else{id='author_text'}
var styles=''
styles+='position: absolute;'
styles+='left: '+x+'px;'
styles+='top: '+y+'px;'
styles+='width: 920px;'
styles+='color: #444;'
styles+='font-size: 18px;'
$('#impact_legend').append('<p id="'+id+'" style="'+styles+'">'+text+'</p>')},authorHint:function(){this.authorText('<span style="color: #aaa;">mouse over the graph for more details</span>',0,30)},drawAuthor:function(author){this.clearAuthor()
var ctx=$('#impact_legend canvas')[0].getContext('2d')
ctx.fillStyle=this.colorFor(author)
ctx.strokeStyle="#888888"
ctx.fillRect(0,30,20,20)
ctx.strokeRect(0.5,30.5,19,19)
var name=this.data.authors[author].n
this.authorText(name+' <span style="color: #aaa;">(click for more info)</span>',25,30)},drawSelectedAuthor:function(author){this.clearSelectedAuthor()
var ctx=$('#impact_legend canvas')[0].getContext('2d')
ctx.fillStyle=this.colorFor(author)
ctx.strokeStyle="#000000"
ctx.fillRect(0,0,20,20)
ctx.strokeRect(0.5,0.5,19,19)
var auth=this.data.authors[author]
var name=auth.n
var commits=auth.c
var adds=auth.a
var dels=auth.d
this.authorText(name+' ('+commits+' commits, '+adds+' additions, '+dels+' deletions)',25,0)},clearAuthor:function(){var ctx=$('#impact_legend canvas')[0].getContext('2d')
ctx.clearRect(0,30,920,20)
$('#author_text').remove()},clearSelectedAuthor:function(){var ctx=$('#impact_legend canvas')[0].getContext('2d')
ctx.clearRect(0,0,920,20)
$('#selected_author_text').remove()}};$(function(){$('#add_key_action').click(function(){$(this).toggle()
$('#new_key').toggle().find(':text').focus()
return false})
$('.edit_key_action').livequery('click',function(){$.gitbox($(this).attr('href'))
return false})
$('#cancel_add_key').click(function(){$('#add_key_action').toggle()
$('#new_key').toggle().find('textarea').val('')
$('#new_key').find(':text').val('')
$('#new_key .object_error').remove()
return false})
$('.cancel_edit_key').livequery('click',function(){$.facebox.close()
$('#new_key .object_error').remove()
return false})
$('.delete_key').livequery('click',function(){if(confirm('Are you sure you want to delete this key?')){$.ajax({type:'DELETE',url:$(this).attr('href')})
var list=$(this).parents('ul')
$(this).parent().remove()
if(list.find('li').length==0){$('#keys .body .danger').show()}}
return false})
$('.key_editing').livequery('submit',function(){var self=this
$(self).find('.object_error').remove()
$(self).find(':submit').attr('disabled',true).spin()
$(self).ajaxSubmit(function(key){if(key.substring(0,3)=="<li"){if($(self).attr('id').substring(0,4)=='edit'){$('#'+$(self).attr('id').substring(5)).replaceWith(key)
$.facebox.close()}else{$('#keys .body .danger').hide()
$('#keys ul').append(key)
$('#add_key_action').toggle()
$(self).toggle()}
$(self).find('textarea').val('')
$(self).find(':text').val('')}else{$(self).append(key)}
$(self).find(':submit').attr('disabled',false).stopSpin()})
return false})});$(function(){if($('#network .out_of_date').length>0){var up_to_date=function(){$('#network .out_of_date').addClass("up_to_date").text("This graph has new data available. Reload the page to see it!");};var repo=$('#network .out_of_date').attr('rel');var tid=[];var pinger=function(){$.getJSON("/"+repo+"/network_current",function(data){if(data.current){up_to_date();clearInterval(tid[0]);}})}
tid.push(setInterval(pinger,5000));}});$(function(){$(".graph .bars").each(function(i){var graph=this
var callback=function(data){new ParticipationGraph(graph,data)}
var datasource=$(this).attr("rel")
$.get(datasource,null,callback,"text")})});ParticipationGraph=function(el,data){this.BAR_WIDTH=7
this.allCommits=null
this.ownerCommits=null
this.primer=new Primer(el,416,20)
this.data=data
this.readData()
this.draw()}
ParticipationGraph.prototype={readData:function(){var data_strings=this.data.split("\n")
this.allCommits=this.base64BytesToIntArray(data_strings[0])
this.ownerCommits=this.base64BytesToIntArray(data_strings[1])},max:function(arr){var max=arr[0]
for(var i=1;i<arr.length;i++){if(arr[i]>max){max=arr[i]}}
return max},integerize:function(arr){var out=new Array()
for(var i=0;i<arr.length;i++){out.push(parseInt(arr[i]))}
return out},base64ByteToInt:function(byte){var chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!-"
return chars.indexOf(byte)},base64BytesToIntArray:function(data){var arr=[]
var num
for(var i=0;i<data.length;i++){if(i%2==0){num=64*this.base64ByteToInt(data.charAt(i))}else{num=num+this.base64ByteToInt(data.charAt(i))
arr.push(num)}}
return arr},draw:function(){var max=this.max(this.allCommits)
var scale
if(max>=20){scale=19.0/max}else{scale=1}
var allCommitsLayer=new Primer.Layer()
for(var i=0;i<this.allCommits.length;i++){var square=new Primer.Layer()
square.fillStyle="#CACACA"
var d=this.allCommits[i]*scale
square.fillRect(i*(this.BAR_WIDTH+1),20-d,this.BAR_WIDTH,d)
allCommitsLayer.addChild(square)}
var ownerCommitsLayer=new Primer.Layer()
for(var i=0;i<this.ownerCommits.length;i++){var square=new Primer.Layer()
square.fillStyle="#336699"
var d=this.ownerCommits[i]*scale
square.fillRect(i*(this.BAR_WIDTH+1),20-d,this.BAR_WIDTH,d)
ownerCommitsLayer.addChild(square)}
this.primer.addChild(allCommitsLayer)
this.primer.addChild(ownerCommitsLayer)}};$(function(){$('#signup_form').submit(function(){$('#signup_button').attr('disabled',true).val('Creating your GitHub account...')})});GitHub.CachedCommitDataPoller=function(){var poller=this
this.timer=setInterval(function(){poller.poll()},2000)}
GitHub.CachedCommitDataPoller.prototype={poll:function(){var sha,commit,msg,user,poller=this,path=location.pathname,url=location.pathname.replace(/tree\/.+/,'cache/commits/')+GitHub.currentTreeSHA+'?path='+GitHub.currentPath+'&commit_sha='+GitHub.commitSHA,commitURL=location.pathname.replace(/tree\/.+/,'commit/')
$.getJSON(url,function(data){if(!data)return
poller.clearTimer()
$('#browser tr').each(function(){if((sha=$(this).find('.content a').attr('id'))&&data[sha]){$(this).find('.age').html('<span class="drelatize">'+data[sha].date+'</span>')
msg=$(this).find('.message')
msg.html(data[sha].message)
if(msg.html().length>50)
msg.html(msg.html().slice(0,47)+'...')
msg.html('<a href="'+commitURL+sha+'" class="message">'+msg.html()+'</a>')
user=data[sha].login?'<a href="/'+data[sha].login+'">'+data[sha].login+'</a>':data[sha].author
msg.html(msg.html()+' ['+user+']')}})
if($.fn.relatizeDate)$('.drelatize').relatizeDate()})},clearTimer:function(){clearInterval(this.timer)
this.timer=null}}
$(function(){$('#file-edit-link').click(function(){$('#readme').hide()
$('#files').children().hide().end().append('<div class="blob-editor"><img src="/images/modules/browser/loading.gif"/></div>')
$('.blob-editor').load($(this).attr('rel'),{},function(){$('#files').scrollTo(500)})
return false})
$('#cancel-blob-editing').livequery('click',function(){$('.blob-editor').remove()
$('#readme').show()
$('#files').children().show()
return false})
$('#download_button').click(function(){var url="/"+$(this).attr('rel')+"/archives/"+GitHub.currentCommitRef
$.gitbox(url)
return false})
$('.archive_link a').livequery('click',function(){$('.popup .inner').hide()
$('.popup .wait').show()
var url=$(this).attr('rel')
var tid=[];var pinger=function(){$.getJSON(url,function(data){if(data.ready){$(document).trigger('close.facebox')
clearInterval(tid[0])}})}
tid.push(setInterval(pinger,1000));})
$('.other_archive_link').livequery('click',function(){$.gitbox($(this).attr('href'))
return false})
$('#private-clone-url > a').bind('contextmenu',function(){var size=$(this).text().length
$(this).hide().next().attr('size',size).show().focus().get(0).select()
return false})
var dim=function(){$(this).hide().prev().show()}
$('#private-clone-url > :input').mouseout(dim).blur(dim)
$('.toggle_watch > img').click(function(){var url=$(this).parent().attr('href')
if(url!='/signup'){$('.toggle_watch').show()
$(this).parent().hide()
$.post(url,{})
return false}})
if($('#loading_commit_data').length>0){new GitHub.CachedCommitDataPoller}})
$(function(){$('a.follow').click(function(){$.post(this.href,{})
$(this).parent().find('.follow').toggle()
return false})
if(GitHub.editableGenerator)$('#dashboard span.edit').each(GitHub.editableGenerator({width:'200px',submittype:'put'}))
$('.user_toggle').click(function(){var options={}
options[this.name]=this.checked?'1':'0'
options['_method']='put'
$.post('/account',options)
$('#notify_save').show()
setTimeout("$('#notify_save').fadeOut()",1000)})
$('#edit_user .info .rename').click(function(){$('#edit_user .username').toggle()
$('#user_rename').toggle()
return false})
$('#add_email_action').click(function(){$(this).toggle()
$('#add_email_form').toggle().find(':text').focus()
return false})
$('#cancel_add_email').click(function(){$('#add_email_action').toggle()
$('#add_email_form').toggle().find(':text').val('')
return false})
$('.delete_email').livequery('click',function(){if($('.email').length==1){$.facebox('You must always have at least one email address.  If you want to delete this address, add a new one first.')
return false}
$.post($(this).attr('href'),{email:$(this).prev().text()})
$(this).parent().remove()
return false})
$('#user_rename > input[type=submit]').click(function(){if(!confirm(GitHub.rename_confirmation())){return false}})
if($('.email').length>0){$('#add_email_form').submit(function(){$('#add_email_form :submit').attr('disabled',true).spin()
var self=this
$(this).ajaxSubmit(function(user){$('.emails ul').append(user)
$('#add_email_form :submit').attr('disabled',false).stopSpin()
$(self).find(':text').val('').focus()})
return false})}
$('#change_plan_toggle').click(function(){$('.plan_box').hide()
$('.user').hide()
$('#change_plan').show()
return false})
$('#change_plan_disabled_toggle').click(function(){$('#update_cc').hide()
$('.plan_box').hide()
$('.user').hide()
$('#account_disabled_notice').hide()
$('#change_plan').show()})
$('#update_cc_toggle').click(function(){$('.plan_box').hide()
$('#update_cc').show()
return false})
$('.plan_cancel').click(function(){$('#change_plan').hide()
$('.plan_box').hide()
$('.user').show()
$('#current_plan').show()
return false})
$('.change_plan_link').click(function(){var plan=$(this).attr('href').match(/#(\w+)/)[1]
var human_plan=$(this).parent().find('h3').text()
var direction=$(this).text().replace(/e$/,'ing')
$('#update_cc_form input#plan').val(plan)
if(plan=='free'){$('#update_cc_form').submit()
return false}
$('.user').show()
$('strong.plan_pricing').hide()
$('#change_plan').hide()
if(plan=='coupon'){$('#coupon_box').show()
return false}
$('#update_plan_status').html("<h2>You're "+direction+' to the '+human_plan+' Plan</h2>').show()
$('#'+plan+'_cost').show()
$('#update_cc').show()
if(!$('#can_update_cc').is('.dont_show'))$('#can_update_cc').show()
return false})
$('#plan_update_button').click(function(){$('#update_cc_form').submit()
return false})
$('#update_cc_form input[type=submit]').click(function(){$(this).attr('disabled',true)
$(this).val('Processing Credit Card...')
$('#update_cc_form').submit()})
$('#show_card_form').submit(function(){$.post($(this).attr('action'),{},function(data){var result=$('<p>'+data+'</p>')
$('#show_card_submit').after(result)})
return false})
$('#reveal_cancel_info').click(function(){$(this).toggle()
$('#cancel_info').toggle()
return false})
$('#cancel_plan').submit(function(){var message="Are you POSITIVE you want to delete your account? There is absolutely NO going back. All your repositories, comments, wiki pages - everything will be gone. Please consider downgrading your plan."
return confirm(message)})
if(window.location.href.match(/account\/upgrade$/)){$('#change_plan_toggle').click()}});$(function(){$('#see-more-elsewhere').click(function(){$('.seen-elsewhere').show()
$(this).remove()
return false})})