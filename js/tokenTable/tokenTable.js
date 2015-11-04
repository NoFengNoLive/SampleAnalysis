angular.module("tokenTable", [])
    .factory('tokenTable', function () {
        var bean = {};
        var items = [];
        var nextTag = 0;

        Object.defineProperties(bean, {
            items: {
                value: items
            }
        })

        bean.insert = function (word, kind,row,col) {
            if (typeof word !== 'string' || typeof kind !== 'number')
                throw new Error("token表insert()参数类型错误：(string,number)")
            var item = {
                word: word,
                kind: kind,
                row:row,
                col:col
            }
            items.push(item);
            return angular.copy(item);
        }

        bean.next = function () {
            if (nextTag < items.length)
                return items[nextTag++]
            else
                return {word:""};
        }
        
        bean.clearNext = function(){
            nextTag = 0;
        }
        bean.back = function () {
            if (nextTag > 1)
                nextTag--;
        }
        bean.clear = function () {
            items.length = 0;
            nextTag = 0;
        }

        return bean;
    })
