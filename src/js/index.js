var app = angular.module('app', ['ui.router', 'oc.lazyLoad']),
    xhrPool = {};//请求池

//配置期
app.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        loadedModules: ['app'], //主模块名,和 ng.bootstrap(document, ['app']) 相同
        jsLoader: requirejs, //使用 requirejs 去加载文件
        files: [], //主模块依赖的资源（主要子模块的声明文件）
        debug: false
    });
}]);

app.config(['$stateProvider', '$urlRouterProvider', '$controllerProvider', function ($stateProvider, $urlRouterProvider, $controllerProvider) {
    /**
     * 路由切换时调用
     * @param param.files 懒加载文件数组
     * @param module 子模块名
     */
    function resovleDep (param, module) {
        var resolves = {
            loadStaticRes: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name: module,
                    cache: true,
                    files: param.files
                });
            }]
        };

        return resolves;
    }

    //路由配置
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'view/login.html',
            controller: 'loginCtrl',
            resolve: resovleDep({
                files: ['js/controllers/login.js?v=123423423', 'js/services/xhr']
            }, 'app.login')
        })
        .state('platform', {
            url: '/platform',
            templateUrl: 'view/wrap.html',
            controller: 'wrapCtrl',
            resolve: resovleDep({
                files: ['js/controllers/wrap', 'js/services/xhr', 'js/directives/wrap', 'js/filters/wrap']
            }, 'app.platform')
        })
        .state('platform.main', {
            url: '/main',
            templateUrl: 'view/main.html',
            controller: 'mainCtrl',
            resolve: resovleDep({
                files: ['js/controllers/main', 'js/services/xhr']
            }, 'app.platform.main')
        })
        .state('platform.other', {
            url: '/other',
            templateUrl: 'view/other.html',
            controller: 'otherCtrl',
            resolve: resovleDep({
                files: ['js/controllers/other', 'js/services/xhr']
            }, 'app.platform.other')
        });

    $urlRouterProvider.otherwise('/login');
}]);

//运行期期
app.run(['$rootScope', '$window', '$location', '$log', '$http', function ($rootScope, $window, $location, $log, $http) {
    //为 ui-router 的相关事件添加回调
    $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {
        angular.forEach(xhrPool, function (xhr, xhrName) {
            xhr.resolve();
            delete xhrPool[xhrName];
        });
    });

    $rootScope.$on('$stateChangeSuccess', function (evt, toState, toParams, fromState, fromParams) {
        if (toState.name == 'login') {
            $('html').css({
                'height': '100%'
            });
            $('body').addClass('login-bg');
        } else {
            $('html').css({
                'height': 'auto'
            });
            $('body').removeClass('login-bg');
        }
    });
}]);

angular.bootstrap(document, ['app']);
