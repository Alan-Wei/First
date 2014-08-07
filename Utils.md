# Utils function

* Utils.alert
 
    <pre>
	var Utils = function(){};
	Utils.global = {
	};
	Utils.alert = function (msg) {
	    var error = Utils.global.error = new Error();
	    var errorStack = Utils.global.errorStack = error.stack;
	    errorStack = errorStack.replace('Error\n', '');
	    var errorLine = errorStack.split('\n')[1];
	    if (errorLine) {
	        var fnReg = /(\w+(.?\w+)*)/gi;
	        var lineReg = /\w+.js:\d*:\d*/gi;
	        try {
	            var fnName = fnReg.exec(errorLine)[1];
	        }catch (e){}
	        var lineNumber = lineReg.exec(errorLine)[0];
	        if (fnName) {
	            fnName = fnName.trim();
	            fnName = fnName.replace('at ', '');  //remove 'at ' in webkit
	            fnName = fnName.replace('@http', ''); //remove @http in firefox
	        }
	        if (lineNumber) {
	            lineNumber = lineNumber.trim();}
	        console.log('Message:', msg, '; Function:', fnName, '; Position:', lineNumber);
	    } else {
	        console.log(msg);
	    }
	};</pre>