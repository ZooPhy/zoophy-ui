'use strict';

angular.module('ZooPhy').controller('runController', function ($scope, $http, RecordData) {

  var EMAIL_RE = /^[^@\s]+?@[^@\s]+?\.[^@\s]+?$/;
  var PREDICTOR_FILE_RE = /.{1,250}?\.tsv$/;
  var JOB_NAME_RE = /^[-\w\ ]{3,225}$/;
  var templateString = "";

  $scope.numSelected = RecordData.getNumSelected();
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
  $scope.generating = false;
  $scope.downloadLink = null;

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
    $scope.downloadLink = null;
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
      if(JOB_NAME_RE.test($scope.jobName.trim())){
      if ($scope.jobEmail && EMAIL_RE.test($scope.jobEmail.trim())) {
        var jobAccessions = [];
        var records = RecordData.getRecords();
        var isGenbankJob = Boolean(RecordData.isTypeGenbank());
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
          //Submit the job to appropriate URL
            var jobSequences = [];
            for (var i = 0; i < records.length; i++) {
              if (records[i].includeInJob) {
                var jobSequence = {
                  id:records[i].accession,
                  collectionDate:records[i].date,
                  geonameID:records[i].geonameid,
                  rawSequence:records[i].sequence,
                  resourceSource:records[i].resourceSource
                }
                jobSequences.push(jobSequence);
              }
            }
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
              records: jobSequences,
              useGLM: glm,
              predictors: predictors,
              isGenbankJob: isGenbankJob,
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
    }else{
      $scope.runError = 'Invalid Job Name';
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
        setPredictors();
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

  function setPredictors() {
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
      $scope.downloadLink = null;
      $scope.runError = null;
    }
    else {
      $scope.glmButtonClass = null;
    }
  };

  $scope.setupNewGLMTemplate = function() {
    if ($scope.generating === false && $scope.running === false) {
      $scope.generating = true;
      $scope.downloadLink = null;
      $scope.runError = null;
      $scope.success = null;
      $scope.warning = null;
      var locationList = [];

      var locationMap = new Map();
      var locationValueMap = new Map();
      var examplePredictor = "123.456";
      var delimiter = "\t";
      templateString = "state" + delimiter + "lat" + delimiter + "long" +
       delimiter + "SampleSize" + delimiter + "ExamplePredictor" + "\n";

      var records = RecordData.getRecords();
      for (var i = 0; i < records.length; i++) {
        if (records[i].includeInJob) {
          var glmTemplateObject = {
            location: "",
            latitude: 0,
            longitude: 0
          };
          glmTemplateObject.location = records[i].location;
          glmTemplateObject.latitude = records[i].latitude;
          glmTemplateObject.longitude = records[i].longitude;

          var count = locationMap.get(records[i].location);
          if(count!=null){
            locationMap.set(records[i].location,++count);
          }else{
            locationMap.set(records[i].location,1);
          }
          locationValueMap.set(records[i].location,glmTemplateObject); 
        }
      }
      for (var [key, value] of locationMap) {
        templateString += key + delimiter;
        templateString += locationValueMap.get(key).latitude + delimiter;
        templateString += locationValueMap.get(key).longitude + delimiter;
        templateString += value + delimiter;
        templateString += examplePredictor + "\n";
      }
      $scope.generating = false;
      $scope.downloadLink = true;
    }
  };

  $scope.downloadGLMTemplate = function() {
    var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(templateString));
      element.setAttribute('download', "ZooPhyPredictors.tsv");
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  }

  $scope.showHelp = function() {
    BootstrapDialog.show({
      title: 'Custom Predictors Upload Help',
      message: 'Follow the steps below to use custom GLM predictors for your ZooPhy Job:\n 1) Generate .tsv template with Job locations\n 2) Fill template with your own Predictor data\n 3) Upload completed template\n\nFor more details on Predictor file formatting, visit the <a target="_new" href="https://github.com/djmagee5/BEAST_GLM#predictor-data-file-requirements">BEAST_GLM</a> page.'
    });
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
