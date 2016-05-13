var app = angular.module('app');

app.controller('loginCtrl', ['$scope', '$location', '$timeout', 'xhr', function ($scope, $location, $timeout, xhr) {

    var timeOut = null;
    $scope.userName = H.Storage.get('userName') || '';
    $scope.password = '';
    $scope.errMsg = '';

    $scope.login = function () {
        if ($scope.userName == '') {
            showErrMsg('请输入用户名！');
            return;
        }

        if ($scope.password == '') {
            showErrMsg('请输入密码！');
            return;
        }

        xhr.ajax({
            method: 'GET',
            url: 'dist/data/login.json',
            data: {
                userName: $scope.userName,
                password: $scope.password
            }
        }).success(function (re) {
            if (re.code == 1) {
                H.Storage.set('userName', $scope.userName);
                $location.url('/platform/main')
            } else {
                showErrMsg(re.msg);
            }
        }).error(function () {
            H.alert('数据请求失败！');
        });
    };

    function showErrMsg (msg) {
        $scope.errMsg = msg;
        $timeout.cancel(timeOut);
        timeOut = $timeout(function () {
            $scope.errMsg = '';
        }, 3000);
    }

}]);
