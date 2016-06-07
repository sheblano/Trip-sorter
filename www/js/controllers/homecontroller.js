app.controller('HomeController', ['$scope', '$state', 'Services', function($scope, $state, Services) {
	$scope.deals = [];

	Services.GetDeals().then(function(res) {
		$scope.deals = res;
		// the graph variable
		var g = new Graph();

		// allCities carry all cities names with repeatation
		var allCities = [];
		for (var i = 0; i < $scope.deals.length; i++) {
			allCities.push($scope.deals[i].departure);
		}
		// $scope.uniqueCities contails the filterd names of all cities without repeatation 
		$scope.uniqueCities = allCities.filter(function(item, i, ar) {
			return ar.indexOf(item) === i;
		});

		/**
		 * [objectNotExistsBefore check if object is added before in the array with the same arrival and departure]
		 * @param  {[Object]} object [the object to add]
		 * @param  {[Array]} array  [the array with filterd cities to check in]
		 * @return {[Boolean]}        [true/false]
		 */
		var objectNotExistsBefore = function(object, array) {
			for (var i = 0; i < array.length; i++) {
				if (object.arrival == array[i].arrival && object.departure == array[i].departure)
					return false;
			}
			return true;
		}

		/**
		 * [filterCities should filter the array first to keep only the cheapest or fastest]
		 * @param  {[String]} algorithm [cheapest/fastest]
		 * @return {[Array of Objects]}     [return array of filterd cities with the optimal values]
		 */
		var filterCities = function(algorithm) {
			if (algorithm == 'cheapest') {
				var filterdDeals = [];
				// filter by cheapest 
				for (var i = 0; i < $scope.deals.length; i++) {
					var currentObject = $scope.deals[i];
					for (var j = i; j < $scope.deals.length; j++) {
						if (currentObject.departure == $scope.deals[j].departure && currentObject.arrival == $scope.deals[j].arrival) {
							// apply the discount on the cost and choose the lowest value
							if (currentObject.discount != 0)
								var currentObjectFinalCost = Number(currentObject.cost) * (currentObject.discount / 100);
							else
								var currentObjectFinalCost = Number(currentObject.cost);
							if ($scope.deals[j].discount != 0)
								var tempObjectFinalCost = Number($scope.deals[j].cost) * ($scope.deals[j].discount / 100);
							else
								var tempObjectFinalCost = Number($scope.deals[j].cost);

							if (currentObjectFinalCost > tempObjectFinalCost)
								currentObject = $scope.deals[j];
						}
					}
					if (objectNotExistsBefore(currentObject, filterdDeals))
						filterdDeals.push(currentObject);
				}
				return filterdDeals;
			} else if (algorithm == 'fastest') {
				var filterdDeals = [];
				// filter by fastest
				for (var i = 0; i < $scope.deals.length; i++) {
					var currentObject = $scope.deals[i];
					for (var j = i; j < $scope.deals.length; j++) {
						if (currentObject.departure == $scope.deals[j].departure && currentObject.arrival == $scope.deals[j].arrival) {
							// calculate the time in minutes to compare the fastest
							var currentObjectDurationTime = Number(currentObject.duration.h) * 60 + Number(currentObject.duration.m);
							var tempObjectDurationTime = Number($scope.deals[j].duration.h) * 60 + Number($scope.deals[j].duration.m);

							if (currentObjectDurationTime > tempObjectDurationTime)
								currentObject = $scope.deals[j];
						}
					}
					if (objectNotExistsBefore(currentObject, filterdDeals))
						filterdDeals.push(currentObject);
				}
				return filterdDeals;
			}
		}

		/**
		 * [isEmpty check if object is empty or not]
		 * @param  {[object]}  obj [specefic object]
		 * @return {Boolean}     [if it has values or not]
		 */
		var isEmpty = function(obj) {
			for (var prop in obj) {
				if (obj.hasOwnProperty(prop))
					return false;
			}
			return true;
		}
		/**
		 * [buildGraph is the function to build the graph given specefic algorithm cheapest/fastest]
		 * @param  {[String]} algorithm [cheapest/fastest]
		 * @return {[String]}      [nothing but changes in graph value]
		 */
		var buildGraph = function(algorithm) {
				// filterdCites is an array of new filterd data
				$scope.filterdCites = [];
				//algorithm is cheapest or fastest
				if (algorithm == 'cheapest') {
					// filter the data with lowest value in cost
					$scope.filterdCites = filterCities('cheapest');
					// after filteration build the graph
					for (var i = 0; i < $scope.uniqueCities.length; i++) {
						var currentCityName = $scope.uniqueCities[i];
						var object = new Object;
						for (var j = 0; j < $scope.filterdCites.length; j++) {
							if ($scope.filterdCites[j].departure == currentCityName) {
								var arrivalName = $scope.filterdCites[j].arrival;
								var cost = $scope.filterdCites[j].cost;
								object[arrivalName] = cost;
							}
						}
						if (!isEmpty(object)) {
							g.addVertex(currentCityName, object);
						}
					}
				} else if (algorithm == 'fastest') {
					// filter the data with lowest value in time
					$scope.filterdCites = filterCities('fastest');
					// after filteration build the graph
					for (var i = 0; i < $scope.uniqueCities.length; i++) {
						var currentCityName = $scope.uniqueCities[i];
						var object = new Object;
						for (var j = 0; j < $scope.filterdCites.length; j++) {
							if ($scope.filterdCites[j].departure == currentCityName) {
								var arrivalName = $scope.filterdCites[j].arrival;
								var duration = Number($scope.filterdCites[j].duration.h) * 60 + Number($scope.filterdCites[j].duration.m);
								object[arrivalName] = duration;
							}
						}
						if (!isEmpty(object)) {
							g.addVertex(currentCityName, object);
						}
					}
				}
			}
		/**
		 * [findShortestPath the main function which the code will start from]
		 * @param  {[String]} from      [the city i will start from ex: London]
		 * @param  {[String]} to        [the destination city ex: Paris]
		 * @param  {[String]} algorithm [cheapest or fastest]
		 * @return {[String]}           [array of routes]
		 */
		$scope.findShortestPath = function(from, to, algorithm) {
			console.log('from:',from);
			console.log('to:',to);
			console.log('algorithm:',algorithm);
			g = new Graph();
			buildGraph(algorithm);
			var route = g.shortestPath(from, to).concat([from]).reverse();
			console.log(route);
			//console.log($scope.filterdCites);
			$scope.resultsArray = [];
			for (var i = 0; i < route.length-1; i++) {
				$scope.resultsArray.push( getDetails(route[i], route[i+1]) );
			};
			console.log($scope.resultsArray);
			return route;
		}
		var getDetails = function(from, to){
			for (var i = 0; i < $scope.filterdCites.length; i++) {
				 if($scope.filterdCites[i].departure == from && $scope.filterdCites[i].arrival == to)
				 	return $scope.filterdCites[i];
			};
		}

	});

}])