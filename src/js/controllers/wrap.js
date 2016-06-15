var app = angular.module('app');

app.controller('wrapCtrl', ['$scope', '$location', 'xhr', function ($scope, $location, xhr) {

    $scope.userName = '';
    $scope.isSupperUser = false;
    $scope.identityCompetence = '';
    $scope.menuList = [];

    $scope.logout = function () {
        $location.url('/login');
    };

    xhr.ajax({
        method: 'GET',
        url: 'data/login.json'
    }).success(function (re) {
        if (re.code == 1) {
            $scope.userName = re.data.userName;
            $scope.isSupperUser = re.data.isSupperUser;
            $scope.identityCompetence = re.data.identityCompetence;

            xhr.ajax({
                method: 'GET',
                url: 'data/menu.json'
            }).success(function (re) {
                if (re.code == 1) {
                    $scope.menuList = processData(re.data);
                }
            });

        } else {
            $location.url('/login');
        }
    });

    function processData (data) {
        var result = [],
            process = function (pid, list, targetList) {
                $.each(list, function (i, item) {

                    if (typeof item.submenu == 'undefined') {
                        item.submenu = [];
                    }

                    if (item.parent_id == pid) {
                        targetList.push(item);
                        process(item.id, list, item.submenu);
                    }

                });
            };

        process(0, data, result);

        return result;
    }

}]);
