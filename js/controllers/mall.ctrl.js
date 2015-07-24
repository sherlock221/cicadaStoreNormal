PointMall.controller("MallCtrl",["$state", "$stateParams", "$location", "$scope", "$timeout", "$rootScope", "$ionicLoading","$ionicScrollDelegate","$ionicPopup", "Util", "MallSev",function ($state, $stateParams, $location, $scope, $timeout, $rootScope, $ionicLoading,$ionicScrollDelegate,$ionicPopup, Util, MallSev) {
//        console.log($location.$$url);

    //当前url所带参数集合
    $rootScope.currentUrlParams;

    $rootScope.getUrlParams = function(){
        var paramsUrl;
        if ($location.$$absUrl.indexOf("#") == -1) {
            paramsUrl = $location.$$absUrl.substring($location.$$absUrl.indexOf("?") + 1, $location.$$absUrl.length);

        }
        else {
            paramsUrl = $location.$$absUrl.substring($location.$$absUrl.indexOf("?") + 1, $location.$$absUrl.indexOf("#"));
        }

       return Util.parseParams(paramsUrl);
    }



    //获得token
    var  paramList = $rootScope.currentUrlParams = $rootScope.getUrlParams();

    var token = Util.getParam("token", paramList);

    var productId = Util.getParam("productId", paramList);

    //全局机型
    $rootScope.MOBILE = {
        version : Util.getParam("version", paramList) || "",
        clientType : Util.getParam("clientType", paramList) || ""
    }

    if (!token) {
        alert("token为空!");
        return;
    }

    $rootScope.isLoadingVal = false;
    $rootScope.token = token;

    console.log("pId",productId);
    console.log("token",token);
    console.log("mobile",$rootScope.MOBILE );

    //是否ios
    $rootScope.IS_IOS = ionic.Platform.isIOS();


    $rootScope.user = {
        credit: ""
    }


    //返回某个state
    $rootScope.backToView = function (stateName) {
        Util.backToView(stateName);
    }

    $rootScope.go = function (stateName,param) {
        param = param || {};
        $state.go(stateName,param);
    }

    //全局弹出
    $rootScope.alert = function (title, template) {
        $ionicPopup.alert({
            title: title || "",
            template: template,
            okText: "确定"

        });
    }


    //返回到滚动条顶部
    $rootScope.scrollTopByName = function(scrollName){
        $ionicScrollDelegate.$getByHandle(scrollName).scrollTop();
    }

    //计算banner宽高比
    var screenWidth = document.body.clientWidth;
    var bannerScale = 750 / 301;
    $scope.bannerHeight = screenWidth / bannerScale;


    //获得用户活跃
    $rootScope.getUser = function (token) {
        $rootScope.isLoadingVal = true;
        MallSev.getUserCreadit(token).then(function (res) {
            $rootScope.isLoadingVal = false;
            $rootScope.user.credit = res.bizData.credit;

        }, function (err) {
            $rootScope.isLoadingVal = false;
        });
    }


    //获得用户列表
    $rootScope.getUser($rootScope.token);

    $rootScope.goCicadaVal = function () {

        if($rootScope.MOBILE.clientType == "iOS"){
            window.location="cicada://cicadaStore/gotoActiveValue";
//            cicadaStore.gotoActiveValue();
        }
        else{
            window.cicadaStore.gotoActiveValue();
        }

    }

    $rootScope.goCicadaBack = function () {
        if($rootScope.MOBILE.clientType == "iOS"){
            window.location="cicada://cicadaStore/back";
//            cicadaStore.back();
        }
        else{
            window.cicadaStore.back();
        }
    }


    //loading
    $rootScope.loading = function(toggle){
        if(toggle){
            $ionicLoading.show();
        }
        else{
            $ionicLoading.hide();
        }
    }


    $rootScope.back = function(toggle){
       Util.back();
    }

}]);