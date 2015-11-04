describe("测试符号表", function () {
	var symbolTable = {};

    beforeEach(module('symbolTable'));

    beforeEach(inject(function (_symbolTable_) {
        symbolTable = _symbolTable_;
    }))

	it("单词为字符串，isExist()能够返回true", function () {
		symbolTable.insert("var", 1);
		expect(symbolTable.isExist("var")).toBeTruthy();
		expect(!symbolTable.isExist("vara")).toBeTruthy();

	})
	it("单词为数字，isExist()能够返回true", function () {
		symbolTable.insert("100", 1);
		expect(symbolTable.isExist("100")).toBeTruthy();
	})

	it("单词为字符串，能够通过get()获取", function () {
		symbolTable.insert("var", 1);
		var item = symbolTable.get("word","var");
		expect(item.word === "var").toBeTruthy();
	})
	
	it("单词为数字，能够通过get()获取",function(){
		symbolTable.insert(100, 1);
		var item = symbolTable.get("word","100");
		expect(item.word === "100").toBeTruthy();
	})
})