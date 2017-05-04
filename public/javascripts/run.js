'use strict';

angular.module('ZooPhy').controller('runController', function ($scope, $http, RecordData) {

  var EMAIL_RE = /^[^@\s]+?@[^@\s]+?\.[^@\s]+?$/;
  var PREDICTOR_FILE_RE = /^(\w|-|\.){1,250}?\.tsv$/;

  $scope.numSelected = RecordData.getNumSelected();
  $scope.jobEmail = null;
  $scope.jobName = null;
  $scope.runError = null;
  $scope.running = false;
  $scope.success = null;
  $scope.useDefaultGLM = false;
  $scope.customPredictors = null;
  $scope.chainLength = 10000000;
  $scope.subSampleRate = 1000;
  $scope.availableModels = ['HKY'];
  $scope.substitutionModel = 'HKY';
  $scope.availablePriors = ['Constant']
  $scope.treePrior = 'Constant';
  $scope.warning = 'Too Few Records, Minimum is 5';
  $scope.fileToSend = null;
  $scope.filename = 'none';
  $scope.glmButtonClass = null;

  $scope.reset = function() {
    $scope.useDefaultGLM = false;
    $scope.customPredictors = null;
    $scope.chainLength = 10000000;
    $scope.subSampleRate = 1000;
    $scope.substitutionModel = 'HKY';
    $scope.treePrior = 'Constant';
    $scope.jobName = null;
    $scope.runError = null;
    $scope.running = false;
    $scope.success = null;
    $scope.warning = 'Too Few Records, Minimum is 5';
    $scope.fileToSend = null;
    $scope.filename = 'none';
    $scope.glmButtonClass = null;
    $scope.numSelected = RecordData.getNumSelected();
  };

  $scope.$watch(function () {return RecordData.getNumSelected();}, function(newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.warning = null;
      $scope.runError = null;
      $scope.success = null;
      $scope.numSelected = newValue;
      if ($scope.numSelected < 5) {
        $scope.warning = 'Too Few Records, Minimum is 5';
      }
      else if ($scope.numSelected > 1000) {
        $scope.warning = 'Too Many Records, Maximum is 1000';
      }
    }
  });

  $scope.$watch(function () {return RecordData.getSearchCount();}, function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.reset();
    }
  });

  $scope.runJob = function() {
    if ($scope.running === false) {
      $scope.runError = null;
      $scope.running = true;
      $scope.success = null;
      $scope.warning = null;
      if ($scope.jobEmail && EMAIL_RE.test($scope.jobEmail.trim())) {
        var jobAccessions = [];
        var records = RecordData.getRecords();
        for (var i = 0; i < records.length; i++) {
          if (records[i].includeInJob) {
            jobAccessions.push(records[i].accession);
          }
        }
        if (jobAccessions.length < 5) {
          $scope.runError = 'Too Few Records, Minimun is 5';
          $scope.running = false;
        }
        else if (jobAccessions.length > 1000) {
          $scope.runError = 'Too Many Records, Maximum is 1000';
          $scope.running = false;
        }
        else {
          var runUri = SERVER_URI+'/job/run';
          var email = String($scope.jobEmail).trim();
          var currentJobName = null;
          if ($scope.jobName) {
            currentJobName = String($scope.jobName).trim();
          }
          var hasCustomPredictors = Boolean(!($scope.customPredictors === null || $scope.customPredictors === undefined));
          var glm = Boolean($scope.useDefaultGLM || hasCustomPredictors);
          var predictors = $scope.customPredictors;
          var chain = Number($scope.chainLength);
          var rate = Number($scope.subSampleRate);
          var model = String($scope.substitutionModel);
          var prior = String($scope.treePrior).trim();//TODO enable in job services
          var jobData = {
            replyEmail: email,
            jobName: currentJobName,
            accessions: jobAccessions,
            useGLM: glm,
            predictors: predictors,
            xmlOptions: {
              chainLength: chain,
              subSampleRate: rate,
              substitutionModel: model
            }
          };
          $http.post(runUri, jobData).then(function success(response) {
            $scope.running = false;
            if (response.status === 202) {
              if (currentJobName) {
                $scope.success = 'Successfully Started the ZooPhy Job: '+currentJobName;
              }
              else {
                $scope.success = response.data.message;
              }
              if (response.data.recordsRemoved.length > 0) {
                var success = 'Successfully Started the ZooPhy Job: '+currentJobName+'. The following '+response.data.recordsRemoved.length+' incomplete records were excluded from this job: '+response.data.recordsRemoved[0];
                for (var i = 1; i < response.data.recordsRemoved.length; i++) {
                  success += ', '+response.data.recordsRemoved[i];
                }
                $scope.success = success;
              }
            }
            else {
              $scope.runError = 'Job Validation Failed: '+response.data.error;
            }
          }, function failure(response) {
            $scope.running = false;
            $scope.runError = 'Job Validation Failed due to Unknown Error';
          });
        }
      }
      else {
        $scope.runError = 'Invalid Email';
        $scope.running = false;
      }
    }
  };

  $scope.uploadPredictors = function(rawFile) {
    $scope.runError = null;
    $scope.success = null;
    var newFile = rawFile[0];
    if (newFile && newFile.size < 500000) { //50kb
      var filename = newFile.name.trim();
      if (PREDICTOR_FILE_RE.test(filename)) {
        $scope.fileToSend = newFile;
        $scope.filename = String(filename).trim();
        var fileUploader = $('#data-upload');
        fileUploader[0].files = null; // TODO not working /:
        fileUploader[0].value = null;
      }
      else {
        $scope.runError = 'Invalid File Name. Must be .tsv file.';
      }
    }
    else {
      $scope.runError = 'Invalid File Size. Limit is 50kb.';
    }
    $scope.$apply();
  };

  $scope.setPredictors = function() {
    $scope.runError = null;
    $scope.success = null;
    if ($scope.fileToSend) {
      var form = new FormData();
      var uri = SERVER_URI+'/job/predictors';
      form.append('predictorsBatchFile', $scope.fileToSend);
      $http.post(uri, form, {
          headers: {'Content-Type': undefined}
      }).then(function (response) {
        $scope.customPredictors = response.data.predictors;
      }, function(error) {
        if (error.status !== 500) {
          $scope.runError = error.data.error;
        }
        else {
          $scope.runError = 'Upload Failed on Server.';
        }
      });
    }
    else {
      $scope.runError = 'No Predictor File Selected';
    }
  };

  $scope.toggleDefaultGLM = function() {
    $scope.useDefaultGLM = !$scope.useDefaultGLM;
    if ($scope.useDefaultGLM) {
      $scope.glmButtonClass = 'btn-success';
      $scope.fileToSend = null;
      $scope.filename = 'none';
      $scope.customPredictors = null;
      $scope.runError = null;
    }
    else {
      $scope.glmButtonClass = null;
    }
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
