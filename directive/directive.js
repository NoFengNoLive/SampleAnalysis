angular.module("codeShow", ["codeShow.tpl.html", "lexicalAnalysis", "grammaticalAnalysis"])
	.directive("codeShow", ["lexicalAnalysis", "grammaticalAnalysis", function (lexicalAnalysis, grammaticalAnalysis) {
		return {
			restrict: "E",
			templateUrl: "codeShow.tpl.html",
			require: "ngModel",
			scope: {},
			link: function (scope, elem, attrs, ngModelCtrl) {
				scope.grammaticalAnalysis = grammaticalAnalysis;
				scope.lexicalAnalysis = lexicalAnalysis;
				lexicalAnalysis.init();
				var lineTemp = "<h1></h1>"
				var charTemp = "<span class='codeSpan'></span>";
				var codeContentElem = elem.find('#codeContent');
				var showInterval;
				scope.showGramBtn = false;

				function showCode(codeStr) {
					if (angular.isUndefined(codeStr))
						return;
					lexicalAnalysis.openRead();
					// lexicalAnalysis.clear();
					showInterval = setInterval((function (lexicalAnalysis, codeStr) {
						var index = 0;
						var rowOpen = false;
						var currentRowElem;
						var row = 1;
						var bodyElem = $("body");
						function readChar(char) {
							try {
								lexicalAnalysis.readChar(char);
								if (char === "\n")
									return "";
								return "<span class='codeSpan'>" + char + "</span>";
							} catch (e) {
								if (char === "\n")
									return "";
								alert(e);
								return ("<span class='codeSpan codeSpanError'>" + char + "</span>");
							}
						}

						return function () {
							scope.showGramBtn = false;
							if (index < codeStr.length) {
								// 读取字符 渲染页面
								var char = codeStr[index];

								if (index == 0 || char === "\n") {
									var elemStr = [];
									elemStr.push("<h1 id='" + row + "' class='clearfix'>");
									elemStr.push(readChar(char));
									elemStr.push("</h1>");
									$(codeContentElem).append(elemStr.join(""));
									if (index == 0)
										currentRowElem = $("#1");
									else
										currentRowElem = currentRowElem.next();
									$(codeContentElem).scrollTop(18 * row);
									bodyElem.animate(
										{
											scrollTop: bodyElem[0].scrollHeight
										}, {
											duration: 600,
											easing: 'linear',
										})
									row++;
								}
								else {

									currentRowElem.append(readChar(char))
								}

								index++;
							}
							else {
								lexicalAnalysis.closeRead();
								window.clearInterval(showInterval);
								scope.showGramBtn = true;
							}
							scope.$apply();
						}
					})(lexicalAnalysis, codeStr), 50)
				};

				scope.fileChange = function (inputElem) {
					var file = inputElem.files[0];
					if (! /text\/\w+/.test(file.type)) {
						alert("请选择文本！");
						return;
					}
					var reader = new FileReader();
					reader.readAsText(file);
					reader.onload = function (f) {
						scope.lexicalAnalysis.clear();
						if (typeof showInterval != "undefined")
							window.clearInterval(showInterval);
						$(codeContentElem).empty();
						ngModelCtrl.$setViewValue(this.result);
						// inputElem.value = "";
					}
				}
				ngModelCtrl.$formatters.push(showCode);
				ngModelCtrl.$parsers.push(showCode);
			},
			controller: function ($scope) {
				$scope.showToken = true;
				$scope.toggle = function () {
					$scope.showToken = !$scope.showToken;
				}
				$scope.startGram = function () {
					try {
						$scope.grammaticalAnalysis.start($scope.lexicalAnalysis.tokens, $scope.lexicalAnalysis.symbols, $scope.lexicalAnalysis.words);
						alert("语法正确!");
						$scope.lexicalAnalysis.tokens.clearNext();
					}catch(e){
						alert(e);
					}
				}
			}
		}
	}])

angular.module('codeShow.tpl.html', []).run(["$templateCache", function ($templateCache) {
	$templateCache.put("codeShow.tpl.html",
		"<div class='code'>" +
		"	<div class='col-md-5'>" +
		" 		<div class='col-md-12'>" +
		"			<a  class='col-md-6 btn btn-success ' ng-click='toggle()'>toggle</a>" +
		"			<div class='col-md-6' style='padding:0'>" +
		"				<input id='read' type='file' onchange='angular.element(this).scope().fileChange(this)' class='noShow'/><a  class='col-md-12 btn btn-primary ' ng-click=''>read</a>" +
		"			</div>" +
		"		</div>" +
		"		<table ng-show='showToken' class='table table-hover' >" +
		"			<caption class='tit'><h1>token</h1></caption>" +
		"			<thead>" +
		"				<tr>" +
		"					<th>单词</th>" +
		"					<th>种别码</th>" +
		"				</tr>" +
		"			</thead>" +
		"			<tbody>" +
		"				<tr ng-repeat='token in lexicalAnalysis.tokens.items'>" +
		"					<td>{{token.word}}</td>" +
		"					<td>{{token.kind}}</td>" +
		"				</tr>" +
		"			</tbody>" +
		"		</table>" +
		"		<table ng-show='!showToken' class='table table-hover ' >" +
		"			<caption  class='tit'><h1>symbol</h1></caption>" +
		"			<thead>" +
		"				<tr>" +
		"					<th>单词</th>" +
		"					<th>种别码</th>" +
		"					<th>长度</th>" +
		"					<th>类型</th>" +

		"				</tr>" +
		"			</thead>" +
		"			<tbody>" +
		"				<tr ng-repeat='symbol in lexicalAnalysis.symbols.items'>" +
		"					<td>{{symbol.word}}</td>" +
		"					<td>{{symbol.kindCode}}</td>" +
		"					<td>{{symbol.length}}</td>" +
		"					<td>{{symbol.kindStr}}</td>" +
		"				</tr>" +
		"			</tbody>" +
		"		</table>" +
		"	</div>" +
		"	<div class='col-md-7'>" +
		"		<div id='codeContent' class='codeContent'></div>" +
		"	</div>" +
		"	<a  ng-show='showGramBtn' class='btn btn-danger' style='position:fixed' ng-click='startGram()'>词法分析</a>" +
		"</div>")
}])