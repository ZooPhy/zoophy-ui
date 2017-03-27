angular.module('ZooPhy').controller('resultsController', function ($scope, $http, RecordData) {

  $scope.recordsPerPage = 25;
  $scope.pageNums = [25, 50, 100, 250, 500];
  $scope.groupIsSelected = false;
  $scope.numSelected = RecordData.getNumSelected();
  $scope.results = RecordData.getRecords();
  $scope.displayedResults = RecordData.getRecords();

  $scope.$watch(function () {return RecordData.getRecords();}, function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.results = newValue;
          $scope.groupIsSelected = false;
          $scope.loadDetails(newValue[0].accession);
        }
  }, true);

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
      $scope.results[i].includeInJob = $scope.groupIsSelected;
    }
    if ($scope.groupIsSelected) {
      $scope.numSelected = $scope.results.length;
    }
    else {
      $scope.numSelected = 0;
    }
    RecordData.setNumSelected($scope.numSelected);
  };

});

/*
Copyright 2017 ASU Biodesign Center for Environmental Security's ZooPhy Lab

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/