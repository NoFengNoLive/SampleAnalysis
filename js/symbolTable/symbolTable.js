angular.module("symbolTable", [])
	.factory("symbolTable", function () {
		var bean = {};
		
		var items = [];
		var wordSearchTable = {};
		
		Object.defineProperties(bean,{
			items:{
				value:items
			}
		})
		

		bean.get = function (orderKey, value) {
			if (typeof orderKey != "string")
				return;
			if (orderKey == "word") {
				var index = wordSearchTable[value];
				if (typeof index !== "undefined") {
					return items[index];
				}
				else {
					return;
				}
			}


			wordSearchTable[orderKey]
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item[orderKey] === value)
					return item;
			}
		}

		bean.insert = function (word, kindCode, kindStr) {
			if (typeof word !== "string" && isNaN(parseInt(word)))
				return;
			if (isNaN(parseInt(kindCode)) || bean.isExist(word))
				return;
			if (typeof kindStr != "string" && typeof kindStr != "undefined")
				return;
			items.push({ word: word.toString(), kindCode: kindCode, kindStr: kindStr, length: word.length });
			wordSearchTable[word.toString()] = items.length - 1;
		}


		bean.isExist = function (word) {
			if (typeof word == "string")
				return (word in wordSearchTable);
			return false;
		}
		bean.clear = function () {
			items.length = 0;
			wordSearchTable.length = 0;
		}


		return bean;


	})