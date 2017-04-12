'use strict';

angular.module('ZooPhy').controller('runController', function ($scope, $http, RecordData) {

  var EMAIL_RE = /^[^@\s]+?@[^@\s]+?\.[^@\s]+?$/;

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
  };

  $scope.$watch(function () {return RecordData.getNumSelected();}, function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.warning = null;
      $scope.runError = null;
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
          var glm = Boolean($scope.useDefaultGLM | $scope.customPredictors);
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
                $scope.success = currentJobName;
              }
              else {
                $scope.success = response.data.message;
              }
              if (response.data.recordsRemoved.length > 0) {
                var warning = response.data.recordsRemoved.length+' Incomplete Records Excluded from Job: '+response.data.recordsRemoved[0];
                for (var i = 1; i < response.data.recordsRemoved.length; i++) {
                  warning += ', '+response.data.recordsRemoved[i];
                }
                $scope.warning = warning;
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
