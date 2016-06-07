app.factory('Services', function($http) {
  var BASE_URL = "js/response.json";
  var deals = [];
  return {
    GetDeals: function() {
      return $http.get(BASE_URL).then(function(response) {
        deals = response.data.deals;
        return deals;
      });
    }
  }

})