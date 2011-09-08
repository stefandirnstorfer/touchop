/* Touchop - Touchable operators
 *           image processing domain
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function verify(obj, isFinal) {
}

function setDisplay(obj, state) {
    if (state)
	obj.removeAttribute("display");
    else
	obj.setAttribute("display","none");
}

function updateFilter(obj) {
    var filter= null;
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    // search for filter components recursively
	    if (filter!=null)
		fillFilter(filter, child);
	    // reset the filter root
	    if (child.nodeName=="svg:filter") {
		filter= child;
		filter.setAttribute("arg_no",1);
		for (var j=0; j<child.childNodes.length; ++j) {
		    var layer= child.childNodes[j];
		    var result= layer.getAttribute("result");
		    if (result!=null && result.match(/^arg.*/)) {
			child.removeChild(layer);
			j= j-1;
		    }
		}
	    }
	    // control visibility of the result
	    if (child.getAttribute("filter")!=null) {
	     	setDisplay(child, isValid(obj) && obj==findRoot(obj));
	    }
	}
    }
}

function fillFilter(filter, obj) {
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    // hide recursive results
	    if (child.getAttribute("filter")!=null) {
		if (child.getAttribute("display")!="none") {
		    var ctm= obj.getCTM();
		    if (Math.abs(ctm.c)<0.1) {
			child.setAttribute("display","none");
			layout(obj);
		    }
		}
	    }
	    // copy filter elements to root filter
	    if (filter!=null && child.nodeName=="svg:filter") {
		var arg_no= filter.getAttribute("arg_no");
		var argId= "arg" + arg_no;
		var insAt= filter.firstChild;
		for (var j=0; j<child.childNodes.length; ++j) {
		    var layer= child.childNodes[j];
		    if (layer.nodeType==1) {
			layer= layer.cloneNode(true);
			updateFeId(layer, "in", argId);
			updateFeId(layer, "in2", argId);
			updateFeId(layer, "result", argId);
			filter.insertBefore(layer, insAt);
		    }
		}
		filter.setAttribute("arg_no", eval(arg_no) + 1);
		filter= null;
	    } else {
		if (filter!=null)
		    fillFilter(filter, child);
	    }
	}
    }
}

function updateFeId(obj, name, argId) {
    var result= obj.getAttribute(name);
    if (result!=null)
	obj.setAttribute(name, argId+"_"+result);
    else
	if (name=="result")
	    obj.setAttribute(name, argId);
}

function layerLayout(obj) {
    if (isSheered(obj)) {
	obj.setAttribute("transform","scale(1, 0.9)");
    } else {
	obj.setAttribute("transform","matrix(1, 0, -0.3 ,0.5, 0, 0)");
    }
}

function isSheered(obj) {
    var result= false;
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1 && child.getAttribute("display")!="none" &&
	    child.transform!=undefined) {
	    var ctm= child.getTransformToElement(obj);
	    result= result || Math.abs(ctm.c) > 0.1;
	    result= result || isSheered(child);
	}
    }
    return result;
}
