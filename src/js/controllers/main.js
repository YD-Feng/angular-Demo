var app = angular.module('app');

app.controller('mainCtrl', ['$scope', '$location', '$timeout', 'xhr', function ($scope, $location, $timeout, xhr) {
    $scope.txt = '这是main模块';
}]);
