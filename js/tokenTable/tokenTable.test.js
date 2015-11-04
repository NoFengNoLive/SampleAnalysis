describe('token表测试', function () {
    var tokenTable = {};

    beforeEach(module('tokenTable'));

    beforeEach(inject(function (_tokenTable_) {
        tokenTable = _tokenTable_;
    }))

    it('insert()如果参数类型错误，会抛出error', function () {
        expect(tokenTable.insert).toThrow(new Error("token表insert()参数类型错误：(string,number)"))
    })
    
    it('next()方法应该取下一个值',function(){
        tokenTable.insert('var', 1);
        expect(tokenTable.next().word === 'var').toBeTruthy();
    })
    
    it('应该先进先出', function () {
        tokenTable.insert('var', 1);
        tokenTable.insert('name', 2);
        tokenTable.insert(';', 3);

        expect(tokenTable.next().word).toMatch('var');
        expect(tokenTable.next().word).toMatch('name');
        expect(tokenTable.next().word).toMatch(';');
    })

    
    
})
