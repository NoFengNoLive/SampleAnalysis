angular.module("grammaticalAnalysis", [])
	.factory("grammaticalAnalysis", function () {
		var bean = {};
		var tokens, symbols, words,
			legalType = [];

		function init() {
			// 初始化变量类型
			legalType.push("integer");
			legalType.push("char");
			legalType.push("real");
			legalType.push("bool");
		}

		bean.start = function (_tokens_, _symbols_, _words_) {
			tokens = _tokens_;
			symbols = _symbols_;
			words = _words_;
			init();
			var token;
			if (typeof _tokens_ == "undefined" || typeof _symbols_ == "undefined")
				return;
			token = tokens.next();

			if (token.word === "program") {  /*处理文件第一语句*/
				token = tokens.next();
				if (!isidentifier(token)) /*判断是否是标识符*/
					error(token, "program后面必须接标识符!");
			}
			else
				error(token, "必须以program开头")
			token = tokens.next();
			if (token.word === ";") {/*程序头的结束*/
				token = tokens.next();
			}
			else
				error(token, "program必须以';'结尾")
			if (token.word === "const") {  /*表明下面是常量说明语句*/
				token = tokens.next();
				const_st(token);/*调用分析常量说明的函数*/
			}
			if (token.word === "var") {  /*表明下面是说明语句*/
				token = tokens.next();
				varst(token);/*调用分析变量说明的函数*/
			}

			// token = tokens.next();
			if (token.word === "begin") {	/*下面是可执行部分的开始*/
				token = tokens.next();
				if (token.word === "")
					error(token, "语法错误：缺少end");
				if (token.word !== "end") {
					while (true) {
						sort(token); /*处理各种可执行语句 只执行一句*/
						token = tokens.next();
						if (token.word === ";") /*赋值语句 有时候没有; */
							token = tokens.next();

						if (token.word === "" || token.word === "end") {
							break;
						}
					}

					if (token.word !== "end")
						error(token, "语法错误：缺少end")
				}

			}
			else
				error(token, "语法错误：缺少begin")
			token = tokens.next();
			if (token.word === ".") {/*处理程序结束*/
				return 0; /*直接返回分析成功*/
			}
			else
				error(token, "语法错误：结束符缺少'.'")
		}
		
		/*调用分析常量说明的函数*/
		function const_st(token) {

		}
		/**处理变量说明，读入var后进入该过程
		 * 模式:var xxx[,xxx,xxx] 
		 */
		function varst(token) {
			while (true) {
				if (!isidentifier(token)) error(token, "var后必须跟变量");
				token = tokens.next(); /*取下一个token字*/
				if (token.word === ",")
					token = tokens.next(); /*取下一个token字*/
				else if (token.word === ":") break;
				else error(token, "定义变量名时，变量名后只能出现':'或','")
			}
			var typeToken = tokens.next(); /*取出下一个token字，放入type中*/
			if (!isLegalType(typeToken.word)) error(token, "变量说明错");
			/*只能是这几种基本类型，若有其它类型，再加入*/
			token = tokens.next(); /*取出下一个token字*/
			if (token.word != ";") error(token, "缺少';'");/*处理完一行变量说明*/
			token = tokens.next(); /*取出下一个token字*/
			if (isidentifier(token)) varst(token);
			/* 如果读入是标识符，继续处理变量说明*/
			else if (token.word === "begin") {
				tokens.back();
				return; /* 结束本函数的处理，转入处理可执行程序部分*/
			}
			else error(token, "语法错误：缺少begin");
		}

		/* 可执行语句分类处理模块主程序 只执行一句*/
		function sort(token) {
			if (token.word == "if") ifs(); /*调用IF语句分析模块*/
			else if (token.word == "while") whiles();/*调用while语句分析模块*/
			else if (token.word == "repeat") repeats();/*调用repeat语句分析模块*/
			else if (token.word == "for") fors();/*调用for语句分析模块*/
			else {
				tokens.back();
				assign();/*其余情况表示是赋值语句，直接调用赋值语句的分析*/
			}
		}
		
		/**
		 * 赋值语句
		 * 模式: 标识符 := 算数表达式/字符常数
		 */
		function assign() {
			var token = tokens.next();
			if (isidentifier(token)) {
				var token = tokens.next();
				if (token.word === ":") {
					token = tokens.next();
					if (token.word === "=") {
						token = tokens.next();
						if (!isStrConstant(token)) {
							tokens.back();
							try {
								aexpr();/*算数表达式处理*/
							} catch (e) {
								error(token, "赋值语句错误:右部=>" + e.message);
							}
						}
					}
					else
						error(token, "赋值语句错误：缺少'='")
				}
				else
					error(token, "赋值语句错误：缺少':'")

			}
			else
				error(token, "赋值语句错误：缺少标识符!");
		}
		
		
		/**
		 * <if语句> ::= if <布尔表达式> then <执行句> else <执行句> 
		 *	<布尔表达式> ::= <变量><关系符><变量>
		 *	<关系符> ::= < | > | <> | <= |  >= | =
		 *	<执行语句> ::= <变量>:=<整数>
		 *	<变量> ::= <标识符>
		 *	<整数> ::= <数字> | <整数> <数字>
		 *	<数字>::=0|1|2|3…|9
		 */
		function ifs() {
			bexp();  /*处理布尔表达式*/
			token = tokens.next();
			if (token.word != "then")
				error(token, "语法错误：缺少then");
			token = tokens.next();
			sort(token);/*调用函数处理then后的可执行语句*/
			token = tokens.next();
			if (token.word === ";")
				return;
			if (token.word != "else")
				error(token, "语法错误：if未结束，缺少';'");
			token = tokens.next();
			sort(token);/*处理else后的可执行语句*/
		}

		function whiles() {
			bexp();  /*处理布尔表达式*/
			token = tokens.next();
			if (token.word != "do")
				error(token, "语法错误：缺少do");
			token = tokens.next();
			sort(token);/*调用函数处理then后的可执行语句*/
			token = tokens.next();
			if (token.word != ";")
				error(token, "while语句错误：缺少';'")
		}

		function repeats() {
			token = tokens.next();
			sort(token);/*调用函数处理then后的可执行语句*/
			token = tokens.next();
			if (token.word !== ";")
				error(token, "repeat语句错误：执行语句缺少';'");
			token = tokens.next();
			if (token.word !== "until")
				error(token, "语法错误：缺少until");
			bexp();  /*处理布尔表达式*/
			token = tokens.next();
			if (token.word !== ";")
				error(token, "repeat语句错误：判断条件缺少';'");
		}
		
		/**
		 * 模式：for + 变量/赋值语句/数字 + to + 变量/赋值语句/数字 + do + 执行语句
		 */
		function fors() {
			var token = tokens.next();
			if (!isNumber(token)) {
				tokens.back();
				if (!assgin_id())
					error(token, "for语句错误：条件类型错误!");
			}


			var token = tokens.next();
			if (token.word !== "to")
				error(token, "for语句错误：缺少to");

			var token = tokens.next();
			if (!isNumber(token)) {
				tokens.back();
				if (!assgin_id())
					error(token, "for语句错误：条件类型错误!");
			}

			token = tokens.next();
			if (token.word !== "do")
				error(token, "for语句错误：缺少do")

			token = tokens.next();
			sort(token);
			token = tokens.next();
			if (token.word !== ";")
				error(token, "for语句错误：缺少';'")
		}
		
		/**
		 * 处理和判断赋值语句和标示符
		 */
		function assgin_id() {
			token = tokens.next();
			if (isidentifier(token)) {
				token = tokens.next();
				if (token.word = ":") { /* 标示符+':' 处理赋值语句*/
					tokens.back();
					tokens.back();// 回退两次
					assign();	/*处理赋值语句*/
				}
				else
					tokens.back();

				return true;
			}

			return false;
		}
		/** 
		 *	(a>b) and c or ...
		 * 逻辑表达式的处理
		 */
		function bexp() {
			bt();   /* 处理布尔量*/
			token = tokens.next();
			if (token.word === "or") {   /*首先处理or*/
				token = tokens.next();
				bexp();  /* 递归调用，or 后面应跟随另一个布尔表达式*/
			}
			else {
				tokens.back();
				return;  /*布尔表达式分析结束*/
			}
		}

		/**
		 * 处理逻辑单元
		 * and
		 */
		function bt() {
			bf();      /*处理布尔量*/
			token = tokens.next();
			if (token.word === "and") {
				bt(); /*递归调用，and后面应跟随另一个布尔量*/
			}
			else {
				tokens.back();
				return;  /*布尔表达式分析结束*/
			}
		}
		/** 处理处理逻辑单元
		 * 	not
		 */
		function bf() {
			token = tokens.next();
			if (token.word === "not") {
				token = tokens.next();
				bf(); /*递归调用，not后面应跟随另一个布尔量*/
			}

			else {
				/*处理括号（*/
				if (token.word === "(") {
					bexp(); /*括号中仍然是表达式*/
					token = tokens.next();
					if (token.word !== ")") /*括号中的表达式处理完毕，后跟右括号*/
						error(token, "语法错误：'('未闭合");
				}
				else if (isBool(token)) {
					return;
				}
				else if (!isidentifier(token) && !isNumber(token))
					error(token, "语法错误：if判断条件类型错误!")
				/* 处理关系运算*/
				else {
					tokens.back();
					aexpr(); /* 调用算术表达式运算*/
					var rop = tokens.next(); /*处理完算术表达式，后面跟随关系运算符*/
					if (isRelOperator(rop)) { /*关系运算符*/
						aexpr(); /*关系运算符之后是算术表达式*/
					}
					else
						tokens.back();
				}
			}
		}	
		/**
		 * 
		 * 处理算数表达式
		 * 处理模式:整常数/实常数/标示符[+运算符 + 整常数/实常数/标示符]
		 */
		function aexpr() {
			var token = tokens.next();
			if (isNumber(token) || isidentifier(token)) {
				while (true) {
					token = tokens.next();

					if (isCompOperator(token)) {
						token = tokens.next();
						if (token.word == "(") {
							aexpr();
							token = tokens.next();
							if (token.word !== ")")
								error(token, "算数表达式错误：'('未闭合");
						}

						else if (!isNumber(token) && !isidentifier(token)) {
							error(token, "算数表达式错误：右部应该为变量或数字!");
							break;
						}
					} else {
						tokens.back();
						break;
					}
				}

			} else if (token.word == "(") {
				aexpr();
				token = tokens.next();
				it(token.word !== ")")
				error(token, "算数表达式错误：'('未闭合");
			}
			else
				error(token, "算数表达式错误：左部应为变量或数字!");
		}


		function isidentifier(token) {
			return words.isExistKindCode(token.kind, "标识符");
		}
		function isNumber(token) {
			return words.isExistKindCode(token.kind, "常数", "整常数") || words.isExistKindCode(token.kind, "常数", "实常数")
		}
		function isConstant(token) {
			return words.isExistKindCode(token.kind, "常数");
		}
		function isStrConstant() {
			return words.isExistKindCode(token.kind, "常数", "字符常数") || words.isExistKindCode(token.kind, "常数", "实常数")

		}
		function isBool(token) {
			return words.isExistKindCode(token.kind, "常数", "布尔常数");
		}

		function isCompOperator(token) {
			if (isRelOperator(token))
				return false;
			return words.isExistKindCode(token.kind, "运算符");
		}

		function isRelOperator(token) {
			var word = token.word;
			return word === ">" || word === "<" || word === "==" || word === "<>"
				|| word === ">=" || word === "<=";
		}

		function isLegalType(token) {
			for (var i = 0; i < isLegalType.length; i++) {
				if (token.word === isLegalType[i])
					return true;
			}
			return false;
		}
		function error(token, message) {
			while (token.word == "") {
				tokens.back();
				token = tokens.next();
			}

			tokens.clearNext();
			throw new Error("【" + token.row + "行" + token.col + "列】错误\n" + message);

		}
		return bean;
	})
