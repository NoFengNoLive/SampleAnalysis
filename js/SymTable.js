function SymTable(){
        var items = {};
        this.insert = function(item){
            if(!(item.type in items)){
                items[item.type] = [];
            }
            items[item.type].push(item);
        }
        this.isExist = function(word,type){
            if(typeof type !== "undefined" && (type in items)){
                for(var i=0;i<items[type].length;i++){
                    if(items[type][i].word === word)
                        return true;
                }
            }
            else{
                for(var _type in items){
                    for(var i=0;i<items[_type].length;i++){
                        if(items[_type][i].word === word)
                            return true;
                    }
                }
            }
            return false;
        }
    }
exports.SymTable = SymTable;