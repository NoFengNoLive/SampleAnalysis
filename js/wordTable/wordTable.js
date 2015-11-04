angular.module("wordTable", [])
    .factory("wordTable", function () {
        var bean = {};

        /** 
         *  {
         *      type:
         *      [
         *          {
         *              word:string,
         *              kind:number,
         *          },
         *          ...
         *      ]
         *  }
         */
        var items = {};

        Object.defineProperties(bean, {
            items: {
                value: items
            }
        })

        var length = 0;

        bean.insert = function (sysmbols, type) {
            if (typeof type == 'undefined') {
                return;
            }
            if (!(type in items)) {
                items[type] = [];
            }

            if (typeof sysmbols === 'string') {
                if (bean.isExist(sysmbols, type))
                    return
                items[type].push({ word: sysmbols, kind: (length + 1) });
                length++;
            }
            // 处理数组
            else if (Object.prototype.toString.call(sysmbols) === '[object Array]') {
                for (var i = 0; i < sysmbols.length; i++) {
                    if (typeof sysmbols[i] === 'string' && !bean.isExist(sysmbols[i]), type) {
                        items[type].push({ word: sysmbols[i], kind: (length + 1) });
                        length++;
                    }
                }
            }
        }



        bean.isExist = function (word, type) {
            return bean.getItem(word, type) !== null;
        }

        bean.isExistKindCode = function (kindCode, type, word) {
            if (typeof type != 'string' || !(type in items))
                return false;
            for (var i = 0; i < items[type].length; i++) {
                if (typeof word !== "undefined") {
                    if (kindCode === items[type][i].kind
                        && word === items[type][i].word)
                        return true;
                }
                else {
                    if (kindCode === items[type][i].kind)
                        return true;
                }
            }
            return false;
        }

        bean.isContain = function (type) {
            items[type]
        }
        bean.getItem = function (word, type) {
            if (typeof type !== "undefined" && (type in items)) {
                for (var i = 0; i < items[type].length; i++) {
                    if (items[type][i].word === word)
                        return items[type][i];
                }
            } else {
                for (var _type in items) {
                    for (var i = 0; i < items[_type].length; i++) {
                        if (items[_type][i].word === word)
                            return items[_type][i];
                    }
                }
            }
            return null;
        }
        bean.getItems = function (type) {
            return items[type];
        }

        bean.clear = function () {
            items = {};
            length = 0;
        }

        return bean;
    })
