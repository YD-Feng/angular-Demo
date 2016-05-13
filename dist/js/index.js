var app=angular.module("app",["ui.router","oc.lazyLoad"]),xhrPool={};app.config(["$ocLazyLoadProvider",function(o){o.config({loadedModules:["app"],jsLoader:requirejs,files:[],debug:!1})}]),app.config(["$stateProvider","$urlRouterProvider","$controllerProvider",function(o,t,r){function e(o,t){var r={loadStaticRes:["$ocLazyLoad",function(r){return r.load({name:t,cache:!1,files:o.files})}]};return r}o.state("login",{url:"/login",templateUrl:"dist/view/login.html",controller:"loginCtrl",resolve:e({files:["dist/js/controllers/login","dist/js/services/xhr"]},"app.login")}).state("platform",{url:"/platform",templateUrl:"dist/view/wrap.html",controller:"wrapCtrl",resolve:e({files:["dist/js/controllers/wrap","dist/js/services/xhr","dist/js/directives/wrap","dist/js/filters/wrap"]},"app.platform")}).state("platform.main",{url:"/main",templateUrl:"dist/view/main.html",controller:"mainCtrl",resolve:e({files:["dist/js/controllers/main","dist/js/services/xhr"]},"app.platform.main")}).state("platform.other",{url:"/other",templateUrl:"dist/view/other.html",controller:"otherCtrl",resolve:e({files:["dist/js/controllers/other","dist/js/services/xhr"]},"app.platform.other")}),t.otherwise("/login")}]),app.run(["$rootScope","$window","$location","$log","$http",function(o,t,r,e,l){o.$on("$stateChangeStart",function(o,t,r,e,l){angular.forEach(xhrPool,function(o,t){o.resolve(),delete xhrPool[t]})}),o.$on("$stateChangeSuccess",function(o,t,r,e,l){"login"==t.name?($("html").css({height:"100%"}),$("body").addClass("login-bg")):($("html").css({height:"auto"}),$("body").removeClass("login-bg"))})}]),angular.bootstrap(document,["app"]);