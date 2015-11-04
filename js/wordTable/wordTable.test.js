describe('词法分析器之符号表测试', function() {
    var wordTable;

    beforeEach(module('wordTable'));

    beforeEach(inject(function(_wordTable_) {
        wordTable = _wordTable_;
    }))

    it("按特定类型插入数组后，isExist应能正确判断并返回true",function(){
        wordTable.insert(['var','if'],'关键词');
        expect(wordTable.isExist('var')).toBeTruthy();
    })
    
    it("按特定类型插入单项数据后，isExist应能正确判断并返回true", function() {
        wordTable.insert('var','关键词');
        expect(wordTable.isExist('var','关键词')).toBeTruthy();
    })

    it("isExist应能正确判断不存在的项并返回false", function() {
        wordTable.insert('var','关键词');
        expect(wordTable.isExist('varaa','关键词')).toBeFalsy();
    })

    it("插入数据后，按类型查getItems()应该包含插入的数据", function() {
        wordTable.insert('var','关键词');
        wordTable.insert('if','关键词');
        var items = wordTable.getItems('关键词');
        expect(items.length === 2).toBeTruthy();
        expect(items[0].word === 'var').toBeTruthy();
        expect(items[1].word === 'if').toBeTruthy();
    })
    
    it("插入数据后，种别码应该递增",function(){
        wordTable.insert('var','关键词');
        expect(wordTable.getItems('关键词')[0].kind === 1).toBeTruthy();
        wordTable.insert('if','关键词');
        expect(wordTable.getItems('关键词')[1].kind === 2).toBeTruthy();
        wordTable.insert('id','标识符');
        expect(wordTable.getItem('id','标识符').kind === 3).toBeTruthy();
        
    })
    
    it("未插入数据时，getItems()应该返回undefined",function(){
    	expect(wordTable.getItems('关键词')).toBeUndefined();
    })
    
    it("不传入类型参数，isExist()应该查找整个单词表",function(){
        wordTable.insert('var','关键词');
        wordTable.insert('name','变量');
        expect(wordTable.isExist('var')).toBeTruthy();
        expect(wordTable.isExist('name')).toBeTruthy();
        
    })
    
    it("按单词和类型查找，要么找到，要么返回null",function(){
        expect(wordTable.getItem('var','关键词') === null).toBeTruthy();
        wordTable.insert('var','关键词');
        expect(wordTable.getItem('var','关键词').word === 'var').toBeTruthy();
    })
    
    it("isExistKindCode()应该能判断种别码是否属于某个类型",function(){
        wordTable.insert('var','关键词');
        wordTable.insert('id','标示符');
        wordTable.insert("整常数",'常数');
        
        expect(wordTable.isExistKindCode(1,'关键词')).toBeTruthy();
        expect(wordTable.isExistKindCode(2,'关键词')).toBeFalsy();
        expect(wordTable.isExistKindCode(2,'标示符')).toBeTruthy();
        expect(wordTable.isExistKindCode(3,'常数','整常数')).toBeTruthy();
        
    })
    
    it("外部不可修改items",function(){
        wordTable.items = 1;
        expect(wordTable.items != 1).toBeTruthy
    })
    
    it("实景测试",function(){
          wordTable.insert([
            'program', 'var', 'integer', 'bool', 'real', 'char', 'const', 'begin',
            'if', 'then', 'else', 'while', 'do', 'for', 'to', 'end', 'read', 'write',
            'true', 'false',
        ], '关键字')

        wordTable.insert([
            'not', 'and', 'or', '+', '-', '*', '/', '<', '>',
            '<=', '>=', '==', '<>'
        ], '运算符')

        wordTable.insert('id', '标识符')
        wordTable.insert([
            ',', '=', ';', "'", '/*', '*/', ':', '(', ')', '.'
        ], '界符')
        wordTable.insert([
            '整常数', '实常数', '字符常数', '布尔常数'
        ], '常数')
        
        expect(wordTable.isExist('var','关键字')).toBeTruthy();
        expect(wordTable.isExist('not','运算符')).toBeTruthy();
        expect(wordTable.isExist('not','常数')).toBeFalsy();
    })
})
