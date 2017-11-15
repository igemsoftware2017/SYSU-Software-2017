'use strict';

/* global angular */

function Part(name, type, start, end, sequence) {
    this.name=name;
    this.type=type;
    this.start=start;
    this.end=end;
    this.sequence = sequence;
}
Part.prototype.getStyleIn = function(){
    if (this.type == 'promoter') {
        return 'fill:rgba(170,0,85,0.9)';
    }
    if (this.type == 'RBS') {
        return 'fill:rgba(237,184,78,0.9)';
    }
    if (this.type == 'gene') {
        return 'fill:rgba(155,131,193,0.9)';
    }
    if (this.type == 'terminator') {
        return 'fill:rgba(255,221,238,0.6)';
    }
};
Part.prototype.getMarkerStyleOut = function() {
    if (this.type == 'promoter') {
        return 'fill:blue';
    }
    if (this.type == 'RBS') {
        return 'fill:rgba(238,255,221,0.6)';
    }
    if (this.type == 'gene') {
        return 'fill:rgba(238,255,221,0.6)';
    }
    if (this.type == 'terminator') {
        return 'fill:rgba(238,255,221,0.6)';
    }
};
Part.prototype.getVadjust = function() {
    if (this.type == 'promoter') {
        return '65';
    }
    if (this.type == 'RBS') {
        return '50';
    }
    if (this.type == 'gene') {
        return '15';
    }
    if (this.type == 'terminator') {
        return '65';
    }
};

let app = angular.module('myApp',['angularplasmid']);

app.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[');
    $interpolateProvider.endSymbol(']}');
}]);

app.controller('PlasmidCtrl', function($scope, $http){

    // 获得质粒数据
    $http.get('/api/plasmid_data').then(function(data){
        console.log(data);
        $scope.plasmids = data.data.data;
    });
    $scope.$watch('curPlaIndex', function(newValue,oldValue, scope) {
        if (newValue !== undefined) {
            $scope.currentPlasmid = $scope.plasmids[newValue];
        }
    });

    $scope.partList = new Array();
    $scope.partType = ['promoter','RBS','gene','terminator'];
    // 事件处理函数
    $scope.addNewPart = function(){
        console.log($scope.currentPlasmid.length);
        console.log($scope.currentPartBegin);
        console.log($scope.curPartEnd);
        if($scope.curPartName!==undefined &&Number($scope.currentPartBegin)<Number($scope.curPartEnd) && Number($scope.currentPartBegin)>=0 && Number($scope.curPartEnd)<=Number($scope.currentPlasmid.length))
        {
            $http.get('/api/plasm_part?name=' + $scope.curPartName).then(function(res) {
				$scope.partList.push(new Part($scope.curPartName, $scope.curPartType, $scope.currentPartBegin, $scope.curPartEnd, res.data.seq));
			});

            
        }else{
            alert('part setting invalid!');
        }
    };
    $scope.goBack = function(){
        $scope.partList.pop();
    };
    $scope.clearAllPart = function(){
        $scope.partList = new Array();
    };

    // 显示part 序列信息的部分
    $scope.myHide=true;
    $scope.myValue=null;
    $scope.current = null;
    $scope.showSequence = function (part) {
		if ($scope.current != part.name) {
        	$scope.myValue = part.sequence;
        	$scope.current = part.name;
            $scope.myHide = false;
		} else {
			$scope.myValue = null;
        	$scope.myHide = true;
            $scope.current = null;
		}
    };
    });

$('#plasmid-modal .ui.dropdown').dropdown();
