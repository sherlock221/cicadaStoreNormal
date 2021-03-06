PointMall.controller("MallDetailCtrl",["$state","$stateParams","$scope","$rootScope","Util","AddressSev","MallSev","PROTOCOL",function($state,$stateParams,$scope,$rootScope,Util,AddressSev,MallSev,PROTOCOL){

    var pd;

   //判断当前来自于url 还是 list
    var proId =   Util.getParam("productId", $rootScope.currentUrlParams);
    console.log("detail : ",proId);


    //初始化
    var productInit  = function(product){
        //获得当前选择的商品
        product.comment =  JSON.parse(product.comment);


        $scope.post = product;



        //兑换状态
        $scope.notExchange = true;
        $scope.isExchangeMsg = "不足兑换";

        //判断是否能兑换
        if( product.status == PROTOCOL.product.status.no_start){
            $scope.notExchange = true;
            $scope.isExchangeMsg = "未开始";
        }
        else if(product.status == PROTOCOL.product.status.finish){
            $scope.notExchange = true;
            $scope.isExchangeMsg = "已结束";
        }
        else if($rootScope.user.credit   -  product.credit  >= 0){
            $scope.notExchange = false;
            $scope.isExchangeMsg = "兑换";
        }

        pd = product;
    }

    //来自活动等查看详情
    if(proId){

        $rootScope.whereFrom = "detail";

        console.log("productId 来自http");
        MallSev.getProductDetail(proId).then(function(res){
            if(res.rtnCode == "0000000"){
                productInit(res.bizData);
            }
            else{
                $rootScope.alert("提示",res.msg);
            }
        });
    }
    //来自list首页
    else{
        console.log("productId 来自localstorage");
        productInit(Util.getSgObj("product"));

    }


    //进入加载
    $scope.$on("$ionicView.beforeLeave", function () {
          console.log("leave");
        $rootScope.whereFrom = "";
    });

    //去相应流程
    $scope.goPage = function(){



        //判断商品类型
        switch (pd.productionType){
            //邮寄类
            case  1 :
                checkAddress();
                break;
            //自取
            case  2 :
                alert("自取");
                break;

            //电子卷
            case  3 :
                checkBook(pd);
                break;

            //虚拟话费
            case  4 :
                checkVirtual();
                break;
            default :
                alert("无");
                break;
        }
    }

    //检查地址
    var  checkAddress = function(){
       var  address = Util.getLgObj("address");
//       if(address){
//           $rootScope.go("mall.address.list");
//       }
//       else{
           //拉取address
           $rootScope.loading(true);
           AddressSev.getAddress($rootScope.token).then(function(res){
               $rootScope.loading(false);

               if(res.bizData.length > 0){

                   //更新本地缓存
                   Util.setLgObj("address",res.bizData);

                   //跳转list
                   $rootScope.go("mall.address.list");
               }
               else{

                   Util.removeLg("address");

                   //跳转添加
                   $rootScope.go("mall.address.add");
               }

           },function(){
               $rootScope.loading(false);
           });

//       }


    }

    //话费部分
    var  checkVirtual = function(){

        $rootScope.go("mall.virtual.input");
    }

    //电子卷部分
    var  checkBook = function(product){
        var comment = "";
        //兑换电子卷
        $rootScope.loading(true);
        MallSev.exchange($rootScope.token,product.productionId,product.productionType,comment).then(function(res){
            $rootScope.loading(false);
            if(res.rtnCode == "0000000"){
                res.bizData.productionName = product.productionName;
                Util.setSgObj("volume",res.bizData);
                $state.go("mall.volume");

            }
            else{
                $rootScope.alert("",res.msg);
            }
        },function(){
            $rootScope.loading(false);
        });


    }




}]);