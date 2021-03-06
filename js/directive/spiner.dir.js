PointMall.directive("spinner", function () {

        return {
            restrict : "E",
            template : "<div></div>",
            scope : {
                type : "@"
            },
            link : function(scope,element,attr){
                var ripple = '<svg version="1.1" id="loading-svg"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 64 64"> <g fill="none" fill-rule="evenodd" stroke-width="3"><circle cx="32" cy="32" r="9.42876"><animate attributeName="r" begin="0s" dur="2s" values="0;24" keyTimes="0;1" keySplines="0.1,0.2,0.3,1" calcMode="spline" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" begin="0s" dur="2s" values=".2;1;.2;0" repeatCount="indefinite"></animate></circle><circle cx="32" cy="32" r="22.335"><animate attributeName="r" begin="-1s" dur="2s" values="0;24" keyTimes="0;1" keySplines="0.1,0.2,0.3,1" calcMode="spline" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" begin="-1s" dur="2s" values=".2;1;.2;0" repeatCount="indefinite"></animate></circle></g> </svg>';
                if(scope.type == "ripple"){
                    element.html(ripple);
                }
            }

        }
});