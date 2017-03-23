angular.module('ZooPhy').controller('resultsController', function ($scope, RecordData) {

  //TODO fix updating data via factory

  $scope.recordsPerPage = 25;
  $scope.pageNums = [25, 50, 100, 250, 500];
  $scope.groupIsSelected = false;
  $scope.numSelected = RecordData.getNumSelected();
  $scope.results = RecordData.getRecords();
  $scope.displayedResults = RecordData.getRecords();

  $scope.loadDetails = function(accession) {
    $http.get(SERVER_URI+'/record?accession='+accession.trim()).then(function(response) {
      if (response.status === 200) {
        $scope.selectedRecord = response.data.record;
        $scope.showDetails = true;
      }
      else {
        console.log('Could not load record: ', response.data.error);
      }
    });
  };

  $scope.toggleRecord = function(record) {
    if (record.includeInJob) {
      $scope.numSelected--;
    }
    else {
      $scope.numSelected++;
    }
    record.includeInJob = !record.includeInJob;
    RecordData.setNumSelected($scope.numSelected);
  };

  $scope.toggleAll = function() {
    for (let i = 0; i < $scope.results.length; i++) {
      $scope.results[i].includeInJob = !$scope.groupIsSelected;
    }
    if ($scope.groupIsSelected) {
      $scope.numSelected = 0;
    }
    else {
      $scope.numSelected = $scope.results.length;
    }
    $scope.groupIsSelected = !$scope.groupIsSelected;
    RecordData.setNumSelected($scope.numSelected);
  };


});
