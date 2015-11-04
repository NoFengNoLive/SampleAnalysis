describe("语法分析测试", function () {
    var grammaticalAnalysis = {};
    var lexicalAnalysis = {};
    var tokens, symbols, words;
    beforeEach(module('grammaticalAnalysis'));
    beforeEach(module('lexicalAnalysis'));


    beforeEach(inject(function (_grammaticalAnalysis_, _lexicalAnalysis_) {
        grammaticalAnalysis = _grammaticalAnalysis_;
        lexicalAnalysis = _lexicalAnalysis_;
        tokens = lexicalAnalysis.tokens;
        symbols = lexicalAnalysis.symbols;
        words = lexicalAnalysis.words;
        lexicalAnalysis.init();
    }))

    it("异常测试:program ;", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program ;");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【1行10列】错误\nprogram后面必须接标识符!")
    })

    it("异常测试:program test", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【1行10列】错误\nprogram必须以';'结尾")
    })

    it("异常测试:缺少begin", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【1行14列】错误\n语法错误：缺少begin")
    })

    it("异常测试:var a = 1;", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a = integer;");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【2行7列】错误\n定义变量名时，变量名后只能出现':'或','")
    })

    it("异常测试:缺少begin", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【2行20列】错误\n语法错误：缺少begin")
    })

    it("异常测试:缺少end", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【3行1列】错误\n语法错误：缺少end");
    })
    it("异常测试:end缺少'.'", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("end");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【4行1列】错误\n语法错误：结束符缺少'.'");
    })

    it("异常测试:语法错误：if判断条件类型错误!", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【5行1列】错误\n语法错误：if判断条件类型错误!");
    })

    it("异常测试:缺少then", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if true");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【5行1列】错误\n语法错误：缺少then");
    })

    it("异常测试:'('未闭合", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if (a>b");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【5行1列】错误\n语法错误：'('未闭合");
    })

    it("异常测试:算数表达式右部应该为变量或数字", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if (a+>b)");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【4行7列】错误\n算数表达式错误：右部应该为变量或数字!");
    })
    it("异常测试:赋值语句错误：缺少':'", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if (a+c>b) then c=5");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【4行18列】错误\n赋值语句错误：缺少':'");
    })
    it("异常测试:赋值语句错误：缺少标识符!", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if (a+c>b) then 3=3");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【4行17列】错误\n赋值语句错误：缺少标识符!");
    })
    it("异常测试:赋值语句右部表达式", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if (a+c>b) then c:=+");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【4行20列】错误\n赋值语句错误:右部=>【4行20列】错误\n算数表达式错误：左部应为变量或数字!");
    })
    it("完整测试:赋值语句右部表达式", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("x := 2+(3*a)-b*c*8;");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        grammaticalAnalysis.start(tokens, symbols, words)
    })
    it("异常测试:if未结束，缺少';'", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if (a+c>b) then c:=3");
        lexicalAnalysis.readLine("end");
        lexicalAnalysis.closeRead();
        expect(function () {
            grammaticalAnalysis.start(tokens, symbols, words)
        }).toThrowError("【5行1列】错误\n语法错误：if未结束，缺少';'");
    })
    it("完整测试2", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if (a+c>b) and c>b then c:=3;");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        grammaticalAnalysis.start(tokens, symbols, words)
    })
    it("测试for语句", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if (a+c>b) and c>b then c:=3;");
        lexicalAnalysis.readLine("for x := 1+2 to 3 do b:=100;");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        grammaticalAnalysis.start(tokens, symbols, words)
    })

    it("测试while语句", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if (a+c>b) and c>b then c:=3;");
        lexicalAnalysis.readLine("while a>b  do b:=100;");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        grammaticalAnalysis.start(tokens, symbols, words)
    })

    it("测试repeat语句", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("program test;");
        lexicalAnalysis.readLine("var a,b,c : integer;");
        lexicalAnalysis.readLine("begin");
        lexicalAnalysis.readLine("if (a+c>b) and c>b then c:=3;");
        lexicalAnalysis.readLine("repeat a:=10;  until a>b;");
        lexicalAnalysis.readLine("end.");
        lexicalAnalysis.closeRead();
        grammaticalAnalysis.start(tokens, symbols, words)
    })


})