var app = angular.module('app');

app.filter('menuFilter', function () {
    return function (input, identityCompetence, isSupperUser) {
        var result = [];
        angular.forEach(input, function (value) {
            if (isSupperUser || identityCompetence.indexOf(value.id) != -1) {
                result.push(value);
            }
        });
        return result;
    };
});
