app = angular.module("app", ['codeShow','ngAnimate'])
        .controller("appCtr", function ($scope) {
                var code = [];
                code.push('/*this is a sample program writing in sample language*/');
                code.push('&program example1;');
                code.push('/*used for illustrating compiling process*/');
                code.push('var');
                code.push('a, b, c: integer; ');
                code.push('x: char;');
                code.push('begin');
                code.push('if (a + c * 3 > b) and(b > 3) then c:=3;');
                code.push('x:=2 + (3 * a) - b * c * 8;');
                code.push('if (2 + 3 > a) and(b > 3) and (a > c) then c:=3;');
                code.push('for x := 1 + 2  to 3 do b:=100;');
                code.push('while  a> b  do c:=5;');
                code.push('repeat  a:=10; until a> b;');
                code.push('end.');
                $scope.code = code.join("\n");

        })
       
