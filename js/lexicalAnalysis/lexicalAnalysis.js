angular.module("lexicalAnalysis", ["symbolTable", "tokenTable", "wordTable"])
    .factory("lexicalAnalysis", ['wordTable', 'tokenTable', 'symbolTable', function (wordsTable, tokens, symbols) {
        var constant = {},
            buffer = "",
            column = 1,
            startColumn,
            lostColumn = -1,
            index = 0,
            row = 1,
            currentWord = "",
            currentChar = "",
            awakeFn = [],
            state = "0";



        Object.defineProperties(constant, {
            START_STATE: { value: "start" },//开始
            DIG_STATE: { value: "digest" },//数字常数
            STR_STATE: { value: "string" },//字符常数
            ID_STATE: { value: "id" },//标识符or关键字
            COM_STATE: { value: "com" },//注释or除号
            DEL_STATE: { value: "del" },//界符
        
            OPEN: { value: "open" },//读取字符时候的状态
            CLOSE: { value: "close" },

            KEEP: { value: "keep" },//当调用get_next()时，返回通知等待唤醒
        
            SUCCESS: { value: "success" },//取token成功
        })

        var bean = {}

        var currentState = constant.START_STATE; // 初始状态
        var readState = constant.CLOSE;

        Object.defineProperties(bean, {
            constant: {
                value: constant
            },
            tokens: {
                value: tokens
            },
            symbols: {
                value: symbols
            },
            words: {
                value: wordsTable
            }
        })

        function clear() {
            currentWord = "";
            currentState = constant.START_STATE;
            state = "0";
        }

        bean.clear = function () {
            buffer = "";
            index = 0;
            row = 1;
            column = 0;
            awakeFn.length = 0;
            clear();
            tokens.clear();
            symbols.clear();

        }
        bean.init = function () {
            wordsTable.insert([
                'program', 'var', 'integer', 'bool', 'real', 'char', 'const', 'begin',
                'if', 'then', 'else', 'while', 'do', 'for', 'to', 'end', 'read', 'write',
                'true', 'false','.','repeat','until','and'
            ], '关键字')

            wordsTable.insert([
                'not', 'and', 'or', '+', '-', '*', '/', '<', '>',
                '<=', '>=', '==', '<>'
            ], '运算符')

            wordsTable.insert('id', '标识符')
            wordsTable.insert([
                ',', '=', ';', "'", '/*', '*/', ':', '(', ')', '.'
            ], '界符')
            wordsTable.insert([
                '整常数', '实常数', '字符常数', '布尔常数'
            ], '常数')

        }
        
        // 入口方法，不会被放入唤醒队列
        bean.readLine = function (line) {
            if (!isReadOpen()) {
                throw new Error("请打开输入");
            }
            buffer += line + "\n";
            if (awakeFn.length) {
                var char = get_next();
                while (awakeFn.length > 0) {
                    var fn = awakeFn.shift();
                    fn(char);
                }
            }

            var char = get_next();
            while (char != "") {
                sort(char);
                char = get_next();
            }

        }
    
        // 入口方法，不会被放入唤醒队列
        bean.readWord = function (word) {
            if (!isReadOpen()) {
                throw new Error("请打开输入");
            }
            buffer += word + " ";
            // 唤醒
            if (awakeFn.length) {
                var char = get_next();
                while (awakeFn.length > 0) {
                    var fn = awakeFn.shift();
                    fn(char);
                }
            }

            var char = get_next();
            while (char != "") {
                sort(char);
                char = get_next();
            }
        }

        bean.readChar = function (char) {
            if (!isReadOpen()) {
                throw new Error("请打开输入");
            }
            buffer += char;

            char = get_next();
            // 唤醒
            if (awakeFn.length) {
                var fn = awakeFn.shift();
                fn(char);
            }
            else
                sort(char);
        }

        bean.openRead = function () {
            readState = constant.OPEN;
        }
        bean.closeRead = function () {
            readState = constant.CLOSE;
            while (awakeFn.length > 0) {
                var fn = awakeFn.shift();
                fn("\n");
            }
            var char = get_next();
            while(char !== ""){
                sort(char);
                char = get_next();
            }
        }

        bean.getWords = function () {
            return wordsTable;
        }

        function isReadOpen() {
            return readState == constant.OPEN;
        }


        function sort(char) {
            if (typeof char !== 'string' || char.length != 1)
                throw new Error("sort():请传入单个字符")

            switch (currentState) {
                case constant.START_STATE:
                    startColumn = column;
                    judeState(char);
                    break;
                case constant.DIG_STATE:
                    startColumn = column;
                    recog_dig(char);
                    break;
                case constant.STR_STATE:
                    startColumn = column;
                    recog_str(char);
                    break;
                case constant.ID_STATE:
                    startColumn = column;
                    recog_id(char);
                    break;
                case constant.COM_STATE:
                    startColumn = column;
                    hand_com(char);
                    break;
                case constant.DEL_STATE:
                    startColumn = column;
                    recog_del(char);
                    break;
                default: return;
            }


        }

        /**
         *   处理数值常数
         */
        function recog_dig(char) {
            if (typeof char !== 'string' || char.length != 1)
                throw new Error("recog_dig():请传入单个字符")

            var name = "";
            while (state != 7) {
                switch (state) {
                    case '0': if (isDigit(char)) state = '1'; else error(); break;/*读入一个数字*/
                    case '1':
                        if (isDigit(char)) state = '1';/*仍然读入数字*/
                        else if (char == '.') state = '2'; /*读入小数点，识别实数*/
                        else if ((char == 'e') || (char == 'E')) state = '4'; /*读入e或E，带指数*/
                        else { /* 已识别完整数，返回 */
                            state = '7'
                            name = "整常数";
                        }
                        break;
                    case '2':
                        if (isDigit(char)) state = '3'; /* 读入数字*/
                        else error();
                        break;
                    case '3':
                        if (isDigit(char)) state = '3'; /* 读入数字*/
                        else if ((char == 'E') || (char == 'e')) state = '4'; /*读入e或E，指数*/
                        else { /* 已识别完带小数的实数，返回 */
                            state = '7';
                            name = "实常数";
                        }
                        break;
                    case '4':
                        if (isDigit(char)) state = '6'; /*读入数字*/
                        else if (char === '+' || char === '-') state = '5'; /*读入+，-符号*/
                        else error();
                        break;
                    case '5':
                        if (isDigit(char)) state = '6'; /*读入数字*/
                        else error();
                        break;
                    case '6':
                        if (isDigit(char)) state = '6'; /*读入数字*/
                        else {/* 已识别完带指数的实数，返回 */
                            state = '7';
                            name = "实常数";
                        }
                }
                if (state != "7") {
                    if (char != "\n")
                        currentWord += char;
                    char = get_next();/*读入下一个符号*/
                    if (char == constant.KEEP)
                        return;
                }
                else if (state == "7" && char != "\n")
                    back()
            }

            var word = wordsTable.getItem(name, '常数');
            if (char == "\n")
                tokens.insert(currentWord, word.kind, row - 1, startColumn);
            else
                tokens.insert(currentWord, word.kind, row, startColumn);

            symbols.insert(currentWord, word.kind, name);
            clear();
            return constant.SUCCESS;


        }

      
    
        /**
         *   处理字符常数
         */
        function recog_str(char) {
            while (state != 2) {
                switch (state) {
                    case '0':
                        state = '1';
                        break; /*由于进入此函数时，char 为单引号，所以不需再读入*/
                    case '1':
                        if (char === "'") {
                            state = '2';
                            break;
                        }/*读到最后的一个单引号，结束*/
                        else {
                            currentWord += char;
                            state = '1'; /* 否则一直是常数部分 */
                        }
                }
                char = get_next(); /* 读取下一个符号*/
                if (char == constant.KEEP)
                    return;
            }

            var word = wordsTable.getItem('字符常数', '常数');
            if (char == "\n")
                tokens.insert(currentWord, word.kind, row - 1, startColumn);
            else
                tokens.insert(currentWord, word.kind, row, startColumn);

            symbols.insert("'" + currentWord + "'", word.kind, "字符常数")
            clear();
            return constant.SUCCESS;

        }

        /**
         *   处理标识符/关键字
         */
        function recog_id(char) {
            while (state != '2') {

                switch (state) {
                    case '0':
                        if (isLetter(char)) state = '1'
                        else error();
                        break;
                    case '1':
                        if (isLetter(char) || isDigit(char)) state = '1';
                        else state = '2'; // 完成状态
                        break;
                }


                if (state !== "2") {
                    currentWord += char;
                    char = get_next();
                    if (char == constant.KEEP)
                        return;
                }
            
                // 空白符 退出
                if (isBlank(char))
                    break;
                else if (state == "2" && char != "")
                    back();
            }
            
            
            
            // 获取种别码
            var item;
            if (currentWord === 'true' || currentWord == 'false') {
                item = wordsTable.getItem('布尔常数', '常数');
                symbols.insert(currentWord, item.kind, "布尔常数");
            }
            else {
                item = wordsTable.getItem(currentWord, '关键字');

                if (item === null) {
                    item = wordsTable.getItem('id', '标识符');
                    symbols.insert(currentWord, item.kind, "标识符");
                }
            }
       
            // 往符号表添加
            //...
        
            // 插入token表 word,kind 单词+种别码
            if (char === "\n")
                tokens.insert(currentWord, item.kind, row - 1, startColumn);
            else
                tokens.insert(currentWord, item.kind, row, startColumn);

            clear();
            return constant.SUCCESS;

        }   
        
        
        /**
         *   处理注释/除号
         */
        function hand_com(char) {
            while (state !== "5") {
                switch (state) {
                    case "0":
                        if (char == "/")
                            state = "2";
                        break;
                    case "2":
                        if (char == "*")
                            state = "3";
                        else {
                            state = "5";
                            back();
                            var word = wordsTable.getItem('/', '运算符');
                            if (char == "\n")
                                tokens.insert('/', word.kind, row - 1, column);
                            else
                                tokens.insert('/', word.kind, row, column);

                            clear();
                            return;
                        }
                        break;
                    case "3":
                        if (char == "*")
                            state = "4";
                        else
                            state = "3";
                        break;
                    case "4":
                        if (char == "*")
                            state = "4";
                        else if (char == "/")
                            state = "5"
                        else
                            state = "3";
                        break;
                }

                if (state != "5") {
                    char = get_next();
                    if (char == constant.KEEP) {
                        return;
                    }
                }
            }
            clear();
            return constant.SUCCESS;

        }

        /**
         *   处理界符和运算符
         */
        function recog_del(char) {
            var item = wordsTable.getItem(char, '界符');
            if (item === null)
                item = wordsTable.getItem(char, '运算符');
            if (item !== null) {
                if (char == "\n")
                    tokens.insert(char, item.kind, row - 1, column);
                else
                    tokens.insert(char, item.kind, row, column);

                clear();
            }
            else
                error();

            return constant.SUCCESS;

        }

        bean.getsymbols = function () {
            return symbols;
        }
        /**
         *   判断起始符类型
         */
        function judeState(char) {

            var next = false;
            do {
                if (char == "")
                    return;
                if (isBlank(char)) {
                    if (char === "\n")
                        return;
                    char = get_next();
                    if (char == constant.KEEP)
                        return;
                    next = true;
                    continue;
                }
                if (isDigit(char)) {
                    currentState = constant.DIG_STATE;
                    break;
                }
                if (char === "'") {
                    currentState = constant.STR_STATE;
                    break;
                }
                if (isLetter(char)) {
                    currentState = constant.ID_STATE;
                    break;
                }
                if (char === "/") {
                    currentState = constant.COM_STATE;
                    break;
                }
                if (wordsTable.isExist(char, "界符") || wordsTable.isExist(char, "运算符")) {
                    currentState = constant.DEL_STATE;
                    break;
                }
                else {
                    throw new Error(row + "行" + column + "列词法解析异常，类型无法识别:" + char);
                    return;
                }

            } while (next)
            sort(char);
        }




        function isDigit(char) {
            return !!parseInt(char) || char === "0";
        }

        function isBlank(char) {
            var BLANK_REG = /^\s$/;
            return BLANK_REG.test(char);
        }

        function isLetter(char) {
            var LETTER_REG = /^[a-zA-Z]$/;
            return LETTER_REG.test(char);
        }

        function get_next() {
            if (index < buffer.length) {
                column++;
                currentChar = buffer[index++];
                if (currentChar == "\n") {
                    row++;
                    // lostColumn = column;
                    column = 0;
                }
                return currentChar;
            } else if (isReadOpen()) {
                var fn = get_next.caller;
                if (fn != bean.readLine && fn != bean.readChar && fn != bean.readWord) {
                    awakeFn.push(fn); // 将调用者放入唤醒队列
                    return constant.KEEP;
                }
                else
                    return ""
            } else {
                return "";
            }
        }
        function back() {
            index--;
            column--;
        }


        function error() {
            throw new Error("词法解析错误:" + row + "," + column + " " + currentChar);
        }

        return bean;
    }])
