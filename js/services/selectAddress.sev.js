/**
 * websql省市区缓存
 * sherlock221b
 */

SelectPCA.constant("PCA_SQL", {

    CREATE: {
        TABLE: {
            PROVINCE: "create table if not exists cicada_province (id INTEGER PRIMARY KEY,code INTEGER,name TEXT)",
            CITY: "create table if not exists cicada_city (id INTEGER PRIMARY KEY  ,code INTEGER,name TEXT,province INTEGER  )",
            AREA: "create table if not exists cicada_area (id INTEGER PRIMARY KEY ,code INTEGER,name TEXT,city INTEGER  )"
        }

    },
    SELECT: {
        ALL_PROVINCE: "select * from cicada_province",
        CITY: "select * from cicada_city as c where c.province=?",
        AREA: "select * from cicada_area as a where a.city=?"
    },
    DROP: {
        TABLE: {
            PROVINCE: "drop table cicada_province",
            CITY: "drop table cicada_city",
            AREA: "drop table cicada_area"
        }
    }
})

SelectPCA
    .factory("AddressDataSourceSev", ["$http", "$q", "SERVER",function ($http, $q, SERVER) {
        return {
            getProvince: function () {
                var defer = $q.defer();
                $http.get(SERVER.url.resource + "/sql/p.sql").success(function (res) {
                    res = res.split(";");
                    defer.resolve(res);
                }).error(function (err) {
                        defer.reject();
                    });
                return defer.promise;
            },
            getCity: function () {
                var defer = $q.defer();
                $http.get(SERVER.url.resource+ "/sql/c.sql").success(function (res) {
                    res = res.split(";");
                    defer.resolve(res);
                }).error(function (err) {
                        defer.reject();
                    });
                return defer.promise;
            },
            getArea: function () {
                var defer = $q.defer();
                $http.get(SERVER.url.resource + "/sql/a.sql").success(function (res) {
                    res = res.split(";");
                    defer.resolve(res);
                }).error(function (err) {
                        defer.reject();
                    });
                return defer.promise;
            }
        }
    }]);

SelectPCA
    .factory("selectPCASev", ["$q", "$rootScope","PCA_SQL","Util","VERSION","AddressDataSourceSev","AddressSev",function ($q, $rootScope,PCA_SQL,Util,VERSION,AddressDataSourceSev,AddressSev) {

        var selectPCADao = function () {  }

        selectPCADao.prototype.check = function(callBack){

            var addressDataBase = Util.getLgObj("addressDataBase");
            //打开数据库
            try{
                this.db = window.openDatabase("cicadaStore", "2.0", "cicadaStore", 2*1024 * 1024);
                console.log("2.0 database");
            }
            catch(ex){
                //alert(""+ex);
                this.db = window.openDatabase("cicadaStore", "1.0", "cicadaStore", 2*1024 * 1024);
//                alert("请返回商城列表在试一次");
                $rootScope.loading(false);
            }

            if(!addressDataBase ||  addressDataBase.version != VERSION.ADDRESS_SOURCE_VERSION ){
                Util.loading(true);
                this.init(callBack);
            }
            else{
                console.log("地址已经缓存..");
                callBack();
            }
        }

        selectPCADao.prototype.init= function (callBack) {
            drop(this.db);
            initTable(this.db);
            initData(this.db,callBack);
        }


        selectPCADao.prototype.open = function(){
            this.db = window.openDatabase("cicadaStore", "2.0", "cicadaStore", 2*1024 * 1024);
        }


        /**
         * 查询省
         * @type {selectPCADao}
         */
        selectPCADao.prototype.getProvinceList = function(os){

            //ios 本地
            if(os == "iOS"){
                return  Util.selectSql(this.db,PCA_SQL.SELECT.ALL_PROVINCE);
            }

            var defer = $q.defer();
            var _this = this;
            AddressSev
                .getProvince().then(function(res){
                    if(res.rtnCode == "0000000"){
                        defer.resolve(_this.convertData("province",res.bizData));
                    }
                    else{
                        defer.reject(res.msg);
                    }
                });
            return defer.promise;
        }


        //数据接口转化
        selectPCADao.prototype.convertData  = function(type,serverData){
            var localDataList = [];

            for(var i=0;i<serverData.length;i++){
                var sData = serverData[i];

                var obj = {};

                if(type == "province"){
                    obj = {
                        name : sData.provinceName,
                        code : sData.provinceId
                    }
                }
                else if(type == "city"){
                    obj = {
                        name : sData.cityName,
                        code : sData.cityId
                    }
                }
                else{
                    obj = {
                        name : sData.districtName,
                        code : sData.districtId
                    }
                }

                localDataList.push(obj);
            }

            return localDataList;
        }



        /**
         * 查询市
         * @param provinceCode
         * @returns {*|void|SQLResultSet}
         */
        selectPCADao.prototype.getCityByProvince= function(os,provinceCode){

            //ios 本地
            if(os == "iOS"){
                return Util.selectSql(this.db,PCA_SQL.SELECT.CITY,[provinceCode])
            }

            //其他设备网络
            var defer = $q.defer();
            var _this = this;
            AddressSev
                .getProvince(provinceCode).then(function(res){
                    if(res.rtnCode == "0000000"){
                        defer.resolve(_this.convertData("city",res.bizData));
                    }
                    else{
                        defer.reject(res.msg);
                    }
                });
            return defer.promise;

        }

        /**
         * 查询区
         * @param cityCode
         * @returns {*|void|SQLResultSet}
         */
        selectPCADao.prototype.getAreaByCity= function(os,cityCode){

            //ios 本地
            if(os == "iOS"){
                return Util.selectSql(this.db,PCA_SQL.SELECT.AREA,[cityCode])

            }
            //其他设备网络
            var defer = $q.defer();
            var _this = this;
            AddressSev
                .getProvince(cityCode).then(function(res){
                    if(res.rtnCode == "0000000"){
                        defer.resolve(_this.convertData("area",res.bizData));
                    }
                    else{
                        defer.reject(res.msg);
                    }
                });
            return defer.promise;
        }


        /**
         * 创建表
         */
        var initTable = function(db){
            db.transaction(function (tx) {
                tx.executeSql(PCA_SQL.CREATE.TABLE.PROVINCE, [],
                    function (tx, result) {
                        console.log('创建province表成功', result);
                    },
                    function (tx, error) {
                        console.log('创建province表失败:' + error.message);
                    });
                tx.executeSql(PCA_SQL.CREATE.TABLE.CITY, [],
                    function (tx, result) {
                        console.log('创建CITY表成功', result);
                    },
                    function (tx, error) {
                        console.log('创建CITY表失败:' + error.message);
                    });
                tx.executeSql(PCA_SQL.CREATE.TABLE.AREA, [],
                    function (tx, result) {
                        console.log('创建AREA表成功', result);
                    },
                    function (tx, error) {
                        console.log('创建AREA表失败:' + error.message);
                    });
            });
        }

        /**
         * 初始化数据
         */
       var  initData = function (db,callBack) {
            var _this = this;

            $q.all({
                f1: AddressDataSourceSev.getProvince(),
                f2: AddressDataSourceSev.getCity(),
                f3: AddressDataSourceSev.getArea()
            })
            .then(function (res) {

                    db.transaction(function (tx) {
                        var addressSql  = res.f1.concat(res.f2).concat(res.f3);
                        var count = 0;
                        //数据量
                        var total = 3239;
                        var addCount = function(){
                            count++;
                            if(count >= total ){
                                Util.setLgObj("addressDataBase",{"isUpdate":"1","version":VERSION.ADDRESS_SOURCE_VERSION});
                                callBack();
                                Util.loading(false);
                                console.log("创建完成");

                            }
                        }

                        //数据容错处理
                        var  errorFn  = function(tx,error){
                            Util.loading(false);
                            console.log(tx);
                        }

                        //创建数据
                        for(var i =0; i <addressSql.length; i++){
                            var sql  = addressSql[i];
                            if(sql){
                                tx.executeSql(sql, [],addCount,errorFn)
                            }
                        }
                    });
            }, function (error) {
               Util.loading(false);
                console.log(error);
            })

        }

        /**
         * 删除表
         */
        var drop = function (db) {
             db.transaction(function (tx) {
                tx.executeSql(PCA_SQL.DROP.TABLE.PROVINCE, []);
                tx.executeSql(PCA_SQL.DROP.TABLE.CITY, []);
                tx.executeSql(PCA_SQL.DROP.TABLE.AREA, []);
            });
        }




        var pcaDao = new selectPCADao();
        return pcaDao;
    }])
