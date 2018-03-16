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
  $scope.combineSearch = 'false';
  $scope.sampleAmount = 20;
  $scope.fastaFilename = 'none';
  $scope.fastaFile = null;
  $scope.fastaError = null;
  $scope.percentOfRecords = String(Math.floor($scope.results.length*($scope.sampleAmount/100.0)));

  const SOURCE_GENBANK = 1;
  const SOURCE_FASTA = 2;
  var FASTA_FILE_RE = /^([\w\s-\(\)]){1,250}?\.(txt|fasta)$/;

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
        $scope.LoadDetails($scope.results[0]);
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
      $scope.combineSearch = 'fasle';
      $scope.sampleAmount = 20;
      $scope.fastaFilename = 'none';
      $scope.fastaFile = null;
      $scope.fastaError = null;
      $scope.percentOfRecords = String(Math.floor($scope.results.length*($scope.sampleAmount/100.0)));
    }
  });

  $scope.LoadDetails = function(selrecord) {
    var resourceSource = selrecord.resourceSource;
    if(resourceSource === SOURCE_GENBANK){
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
      if ($scope.results.length < 1 || $scope.numSelected < 1) {
        $scope.generating = false;
        $scope.downloadError = 'No Results to Download';
      }
      else if (format === 'csv' || format === 'fasta') {
        $scope.downloadFormat = format;
        var downloadAccessions = [];
        for (var i = 0; i < $scope.results.length; i++) {
          if($scope.results[i].includeInJob){
            downloadAccessions.push($scope.results[i].accession);
          }
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

  $scope.uploadFasta = function(rawFile) {
    $scope.fastaError = null;
    $scope.warning = null;
    var newFile = rawFile[0];
    if (newFile && newFile.size < 1000000) { //1mb
      var filename = newFile.name.trim();
      if (FASTA_FILE_RE.test(filename)) {
        $scope.fastaFile = newFile;
        $scope.fastaFilename = String(filename).trim();
      }
      else {
        $scope.fastaError = 'Invalid File Name. Must be .txt file.';
      }
    }
    else {
      $scope.fastaError = 'Invalid File Size. Limit is 1mb.';
    }
    $scope.$apply();
  };

  $scope.sendFasta = function() {
    var combinedSearch = String($scope.combineSearch);
      $scope.fastaError = null;
      if ($scope.fastaFile) {
        var form = new FormData();
        var uri = SERVER_URI+'/upfasta';
        form.append('fastaFile', $scope.fastaFile);
        console.log("Posting " + uri + " " + $scope.fastaFile.type)
        $http.post(uri, form, {
            headers: {'Content-Type': undefined}
        }).then(function (response) {
          var AccessionRecords =  RecordData.getRecords();
          RecordData.setRecords(response.data.records);
          var CombinedRecords = RecordData.getRecords();
          if(combinedSearch === 'true'){
            CombinedRecords = CombinedRecords.concat(AccessionRecords);
          }
          RecordData.setRecords(CombinedRecords);
          RecordData.setTypeGenbank(false);
          if (response.data.records.length > 0) {
            $scope.$parent.switchTabs('results');
          }
          else {
            $scope.warning = 'Processed 0 results.';
          }
          RecordData.incrementSearchCount();
        }, function(error) {
          if (error.status !== 500) {
            $scope.warning = error.data.error;
          }
          else {
            $scope.warning = 'Parsing Failed on Server. Please refresh and try again.';
          }
        });
      }
      else {
        $scope.warning = 'No FASTA File Selected';
      }
    };

    $scope.showFastaHelp = function() {
      BootstrapDialog.show({
        title: 'FASTA Upload Help',
        message: 'The FILE file needs to have a metadata line preceded by the > symbol. It should be followed by a new line and the sequence string. The current file size limit is 10mb.'
      });
    };

    $scope.updatePercentOfRecords = function() {
      $scope.percentOfRecords = String(Math.floor($scope.results.length*($scope.sampleAmount/100.0)));
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
