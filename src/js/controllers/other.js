var app = angular.module('app');

app.controller('otherCtrl', ['$scope', '$location', '$timeout', 'xhr', function ($scope, $location, $timeout, xhr) {
    $scope.txt = '这是other模块';
}]);
