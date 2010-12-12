if (String.trim === undefined){
	String.trim = function(){
		return this.match(/^\s*(.*?)\s*$/)[1]; // tested a bit, this is noticeably the fastest method
	};
}

var comments = $("table table:eq(2) > tbody > tr");
comments.addClass("comment");
comments.each(function(i, node){
	$=jQuery;
	if ($("table tr a[id^=up]", node).length > 0){
		$("table tr a[id^=up]", node).click((function(comment){
			return function(){
				$(comment).removeClass("notvoted").addClass('voted');
			}
		})(node));
		$("table tr a[id^=down]", node).click((function(comment){
			return function(){
				$(comment).removeClass("notvoted").addClass('voted');
			}
		})(node));
		$(node).addClass("notvoted");
	} else {
		$(node).addClass("voted");
	}
});

var headers = comments.find("span.comhead");
var commentData = [];
headers.each(function(i, node){
	node = $(node);
	
	var score = $("span[id^=score_]", node);
	var commenter = $("a[href^=user]", node);
	
	var replacement = $("<span>").addClass("comhead");
	score.addClass("score");
	replacement.append(score);
	replacement.append($("<span>").addClass("between").text(node.contents()[0].data));
	commenter.addClass("user");
	replacement.append(commenter);
	replacement.append($("<span>").addClass("time").text(node.contents()[1].data));
	replacement.append(node.contents()[2]);
	while (node.contents().length > 2){
		replacement.append(node.contents()[2]);
	}
	node.replaceWith(replacement);
});

/** CSS manipulation based on rules - from http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript
* Modified to:
*  Correctly handle cases where there are no rules (the long `for` line)
*  Prioritize rule insertion to try W3C-compliant first
*  Clean up global scope a bit
*  Add & populate a rule in one step
* Note that, in some browsers, rules are not accessible if running through file:// !
**/
var CSSRule = {
	get: function getCSSRule(ruleName, deleteFlag) {
		ruleName = ruleName.toLowerCase();
		if (document.styleSheets) {
			for (var i = 0; i < document.styleSheets.length; i++) {
				var styleSheet = document.styleSheets[i];
				var cssRule = false;
				for (var ii = 0; ii < (styleSheet.cssRules ? styleSheet.cssRules.length : (styleSheet.rules ? styleSheet.rules.length : 0)); ii++) {
					if (styleSheet.cssRules) {
						cssRule = styleSheet.cssRules[ii];
					} else {
							cssRule = styleSheet.rules[ii];
					}
					if (cssRule) {
						if (cssRule.selectorText.toLowerCase() === ruleName) {
							if (deleteFlag === 'delete') {
								if (styleSheet.cssRules) {
									styleSheet.deleteRule(ii);
								} else {
									styleSheet.removeRule(ii);
								}
								return true;
							} else {
								return cssRule;
							}
						}
					}
				}
			}
		}
		return false;
	}
	
	, add: function addCSSRule(ruleName, rule) {
		if (document.styleSheets) {
			if (!this.get(ruleName)) {
				var len = document.styleSheets.length - 1;
				if (document.styleSheets[len].insertRule) {
					document.styleSheets[len].insertRule(ruleName + (rule ? "{" + rule + "}" : "{}"), document.styleSheets[len].cssRules.length);
				} else {
					document.styleSheets[len].addRule(ruleName, (rule ? "{" + rule + "}" : "{}"));
				}
			}
		}
		return this.get(ruleName);
	}
	
	, remove: function killCSSRule(ruleName) {
		return this.get(ruleName, 'delete');
	}
};

chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
	if (request.users){
		CSSRule.remove(".notvoted .user");
	}
	if (request.scores){
		CSSRule.remove(".notvoted .score");
	}
	if (request.users && request.scores){
		CSSRule.remove(".notvoted .between");
	}
	sendResponse({});
});