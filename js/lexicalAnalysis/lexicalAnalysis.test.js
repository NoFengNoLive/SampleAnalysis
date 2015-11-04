describe('测试 lexicalAnalysis', function () {
    var lexicalAnalysis = {};
    var tokens, symbols;
    beforeEach(module('lexicalAnalysis'));

    beforeEach(inject(function (_lexicalAnalysis_) {
        lexicalAnalysis = _lexicalAnalysis_;
        lexicalAnalysis.init();
        tokens = lexicalAnalysis.tokens;
        symbols = lexicalAnalysis.symbols;
    }))

    it("在外部应该不能修改constant属性", function () {
        var a = {}
        lexicalAnalysis.constant = a;
        expect(lexicalAnalysis.constant === a).toBeFalsy();
    })


    it("测试关键字/标识符:(var name)", function () {
        lexicalAnalysis.openRead();
        var code = [];
        code.push("var name");
        lexicalAnalysis.readLine(code.join("\n"));
        lexicalAnalysis.closeRead();
        var token = tokens.next();
        expect(token !== null && token.word === 'var').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === 'name').toBeTruthy();

    })

    it("测试界符:(name= )", function () {
        var code = [];
        code.push("name= ");
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine(code.join("\n"));
        lexicalAnalysis.closeRead();
        var token = tokens.next();
        expect(token !== null && token.word === 'name').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '=').toBeTruthy();

    })

    it("测试字符常数:(name='tanyu')", function () {
        var code = [];
        code.push("name='tanyu'");
        lexicalAnalysis.openRead();

        lexicalAnalysis.readLine(code.join("\n"));
        lexicalAnalysis.closeRead();

        var token = tokens.next();
        expect(token !== null && token.word === 'name').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '=').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === 'tanyu').toBeTruthy();
    })

    it("测试整常数:(number1=1,number2 = 2)", function () {
        var code = [];

        code.push("number1=1,number2 = 2");

        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine(code.join("\n"));
        lexicalAnalysis.closeRead();

        var token = tokens.next();
        expect(token !== null && token.word === 'number1').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '=').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '1').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === ',').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === 'number2').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '=').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '2').toBeTruthy();
    })

    it("测试实常数:(number1=1e12,number2=12e+2)", function () {
        var code = [];
        code.push("number1=1e12,number2=12e+2");

        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine(code.join("\n"));
        lexicalAnalysis.closeRead();

        var token = tokens.next();
        expect(token !== null && token.word === 'number1').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '=').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '1e12').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === ',').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === 'number2').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '=').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '12e+2').toBeTruthy();
    })

    it("测试注释:[/*xxxxxxx*xx*x**/var a = 1/*xxxxxxx*xx*x**/]", function () {
        var code = [];
        code.push("/*xxxxxxx*xx*x**/var a = 1/*xxxxxxx*xx*x**/");

        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine(code.join("\n"));
        lexicalAnalysis.closeRead();

        var token = tokens.next();
        expect(token !== null && token.word === 'var').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === 'a').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '=').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '1').toBeTruthy();
    })

    it("测试除号:[/*xx*/a/b]", function () {
        var code = [];
        code.push("/*xx*/a/b");
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine(code.join("\n"));
        lexicalAnalysis.closeRead();
        var token = tokens.next();
        expect(token !== null && token.word === 'a').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === '/').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === 'b').toBeTruthy();
    })

    it("测试布尔常数和标示符:var a = true", function () {

        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine("var a = true;");
        var tokens = lexicalAnalysis.tokens;
        var token = tokens.next();
        expect(token !== null && token.word === 'var').toBeTruthy();
         var token = tokens.next();
        expect(token !== null && token.word === 'a').toBeTruthy();
         var token = tokens.next();
        expect(token !== null && token.word === '=').toBeTruthy();
         var token = tokens.next();
        expect(token !== null && token.word === 'true').toBeTruthy();
        
        symbols.isExist("a");
        symbols.isExist("true");
        
    })

    it("完整测试", function () {
        var code = [];
        code.push('/*this is a sample program writing in sample language*/');
        code.push('program example1;');
        code.push('/*used for illustrating compiling process*/');
        code.push('var');
        code.push('a, b, c: integer;');
        code.push('x: char;');
        code.push('begin');
        code.push('if (a + c * 3 > b) and(b > 3) then c:=3;');
        code.push('x:=2 + (3 * a) - b * c * 8;');
        code.push('if (2 + 3 > a) and(b > 3) and (a > c) then c:=3;');
        code.push('for x := 1 + 2  to 3 do b:=100;');
        code.push('while  a> b  do c:=5;');
        code.push('repeat  a:=10; until a> b;');
        code.push('end.');
        lexicalAnalysis.openRead();
        lexicalAnalysis.readLine(code.join("\n"));
        lexicalAnalysis.closeRead();
        var token = tokens.next();
        expect(token !== null && token.word === 'program').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === 'example1').toBeTruthy();
        var token = tokens.next();
        expect(token !== null && token.word === ';').toBeTruthy();

    })

    it("单个字符逐个读入", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readChar("v");
        lexicalAnalysis.readChar("a");
        lexicalAnalysis.readChar("r");
        lexicalAnalysis.readChar(" ");
        var token = tokens.next();
        expect(token !== null && token.word === 'var').toBeTruthy();
        lexicalAnalysis.readChar("v");
        lexicalAnalysis.closeRead();

        var token = tokens.next();
        expect(token !== null && token.word === 'v').toBeTruthy();

    })

    it("单个字符读入注释", function () {
        lexicalAnalysis.openRead();
        lexicalAnalysis.readChar("/");
        lexicalAnalysis.readChar("*");
        lexicalAnalysis.readChar("d");
        lexicalAnalysis.readChar("a");
        lexicalAnalysis.readChar(" ");
        lexicalAnalysis.readChar("d");
        lexicalAnalysis.readChar("a");
        lexicalAnalysis.readChar(" ");
        lexicalAnalysis.readChar("*");
        lexicalAnalysis.readChar("/");
        var token = tokens.next();
        expect(token.word === "").toBeTruthy();
        lexicalAnalysis.readChar("\n");
        lexicalAnalysis.readChar("p");
        lexicalAnalysis.readChar("r");
        lexicalAnalysis.readChar("o");
        lexicalAnalysis.readChar("g");
        lexicalAnalysis.readChar("r");
        lexicalAnalysis.readChar("a");
        lexicalAnalysis.readChar("m");
        lexicalAnalysis.readChar(" ");
        lexicalAnalysis.readChar("e");
        lexicalAnalysis.readChar("x");
        var token = tokens.next();
        expect(token && token.word === "program").toBeTruthy();
        var token = tokens.next();
        expect(token.word === "").toBeTruthy();
        lexicalAnalysis.closeRead();
        var token = tokens.next();
        expect(token && token.word === "ex").toBeTruthy();

    })
})