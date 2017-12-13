'use strict';

angular.module('ZooPhy').controller('resultsController', function ($scope, $http, RecordData) {

  $scope.pageNums = [25, 50, 100, 250, 500];
  $scope.groupIsSelected = false;
  $scope.numSelected = RecordData.getNumSelected();
  $scope.results = RecordData.getRecords();
  $scope.selectedRecord = null;
  $scope.downloadLink = null;
  $scope.generating = false;
  $scope.downloadFormat = null;
  $scope.downloadError = null;
  $scope.sortField = 'accession';
  $scope.sortReverse = false;
  $scope.recordsPerPage = 25;
  $scope.warning = null;
  $scope.sampleType = 'percent';
  $scope.sampleAmount = 20;

  $scope.updateSort = function(field) {
    if (field === $scope.sortField) {
      $scope.sortReverse = !$scope.sortReverse;
    }
    else {
      $scope.sortField = field;
    }
  };

  $scope.$watch(function () {return RecordData.getSearchCount();}, function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.results = RecordData.getRecords();
      if ($scope.results.length > 0) {
        $scope.loadDetails($scope.results[0]);
      }
      $scope.groupIsSelected = false;
      $scope.numSelected = 0;
      RecordData.setNumSelected($scope.numSelected);
      $scope.downloadLink = null;
      $scope.generating = false;
      $scope.downloadFormat = null;
      $scope.warning = null;
      $scope.downloadError = null;
      $scope.sampleType = 'percent';
      $scope.sampleAmount = 20;
    }
  });

  $scope.loadDetails = function(selrecord) {
    var isGenbankJob = Boolean(RecordData.isTypeGenbank());
    if(isGenbankJob){
      $scope.warning = null;
      $http.get(SERVER_URI+'/record?accession='+selrecord.accession.trim()).then(function(response) {
        if (response.status === 200) {
          $scope.selectedRecord = response.data.record;
          $scope.showDetails = true;
          $scope.showCustDetails = false;
        }
        else {
          $scope.warning = 'Could not load record: '+selrecord;
        }
      });
    } else {
      $scope.selectedRecord = selrecord;
      $scope.showDetails = false;
      $scope.showCustDetails = true;
}
  };

  $scope.toggleRecord = function(record) {
    if (record.includeInJob) {
      $scope.numSelected--;
      $scope.groupIsSelected = false;
    }
    else {
      $scope.numSelected++;
      if ($scope.numSelected === $scope.results.length) {
        $scope.groupIsSelected = true;
      }
    }
    record.includeInJob = !record.includeInJob;
    RecordData.setNumSelected($scope.numSelected);
  };

  $scope.toggleAll = function() {
    for (var i = 0; i < $scope.results.length; i++) {
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

  $scope.goToRun = function() {
    $scope.$parent.switchTabs('run');
  };

  $scope.setupDownload = function(format) {
    $scope.warning = null;
    if (!$scope.generating) {
      $scope.generating = true;
      $scope.downloadLink = null;
      $scope.downloadFormat = null;
      $scope.downloadError = null;
      if ($scope.results.length < 1) {
        $scope.generating = false;
        $scope.downloadError = 'No Results to Download';
      }
      else if (format === 'csv' || format === 'fasta') {
        $scope.downloadFormat = format;
        var downloadAccessions = [];
        for (var i = 0; i < $scope.results.length; i++) {
          downloadAccessions.push($scope.results[i].accession);
        }
        var downloadURI = SERVER_URI+'/download/'+format;
        var downloadList = {accessions: downloadAccessions};
        $http.post(downloadURI, downloadList).then(function success(response) {
          $scope.generating = false;
          if (response.status === 200) {
            $scope.downloadLink = SERVER_URI+response.data.downloadPath;
          }
          else {
            $scope.downloadError = 'Error generating download';
          }
        }, function failure(response) {
          $scope.generating = false;
          $scope.downloadError = 'Error generating download';
        });
      }
      else {
        $scope.generating = false;
        $scope.downloadError = 'Invalid Download Format';
      }
    }
  };

  $scope.validateDownSample = function() {
    var sampleType = String($scope.sampleType);
    var sampleAmount = Number($scope.sampleAmount);
    var check_for_validInput=false;
    if (sampleType === 'percent' ) { 
      if (sampleAmount > 0 && sampleAmount <= 100) { 
        check_for_validInput=true;  
      }
    }
    else if (sampleType === 'number' ) { 
      if(sampleAmount > 0 && sampleAmount <= $scope.results.length){ 
        check_for_validInput=true;  
      }
    }
    if(check_for_validInput === false) { 
      $scope.warning = 'Invalid Downsample'; 
    }
    else {
      $scope.warning = null;
      if (sampleType === 'percent') {
        $scope.downSamplePercent(sampleAmount);
      }
      else {
        $scope.downSampleAmount(sampleAmount);
      }
    }
  };

  $scope.downSamplePercent = function(percentage) {
    var numToSelect =  Math.floor($scope.results.length*(percentage/100.0));
    $scope.downSampleAmount(numToSelect);
  };

  $scope.downSampleAmount = function(amount) {
    var recs = $scope.results.slice();
    if (amount < recs.length) {
      $scope.groupIsSelected = false;
    }
    var samples = [];
    var index = -1;
    while (amount > 0 && recs.length > 0) {
      index = Math.floor(Math.random()*(recs.length));
      samples.push(recs[index].accession);
      recs.splice(index, 1);
      amount--;
    }
    $scope.numSelected = 0;
    for (var i = 0; i < $scope.results.length; i++) {
      if (samples.indexOf($scope.results[i].accession) > -1) {
        $scope.results[i].includeInJob = true;
        $scope.numSelected++;
      }
      else {
        $scope.results[i].includeInJob = false;
      }
    }
    RecordData.setRecords($scope.results);
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
