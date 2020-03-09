'use strict';

angular.module('ZooPhy').controller('runController', function ($scope, $http, RecordData) {

  var PREDICTOR_FILE_RE = /.{1,250}?\.tsv$/;
  var templateString = "";

  $scope.numSelected = RecordData.getNumSelected();
  $scope.runError = null;
  $scope.running = false;
  $scope.success = null;
  $scope.useDefaultGLM = false;
  $scope.customPredictors = null;
  $scope.chainLength = 10000000;
  $scope.subSampleRate = 1000;
  $scope.availableSubstitutionModels = ['HKY','GTR'];
  $scope.substitutionModel = 'HKY';
  $scope.invariantSites = false;
  $scope.gamma = false;
  $scope.availableClockModels = ['Strict','Relaxed'];
  $scope.clockModel = 'Strict';
  $scope.availablePriors = ['Constant', 'Skyline', 'Skygrid']
  $scope.treePrior = 'Constant';
  $scope.geospatialUncertainties = false;
  $scope.availableDisjoinerLevels = ['Auto', 'PCL', 'ADM1', 'ADM2'];
  $scope.disjoinerLevel = 'Auto';
  $scope.warning = 'Too Few Records, Minimum is 5';
  $scope.fileToSend = null;
  $scope.filename = 'none';
  $scope.glmButtonClass = null;
  $scope.generating = false;
  $scope.downloadLink = null;
  $scope.successWithExclusion = null;
  $scope.currentJobName = null;
  $scope.ExcludedRecordDownloadLink = null;
  $scope.ExcludedRecordCount = null;
  
  $scope.reset = function() {
    $scope.useDefaultGLM = false;
    $scope.customPredictors = null;
    $scope.chainLength = 10000000;
    $scope.subSampleRate = 1000;
    $scope.substitutionModel = 'HKY';
    $scope.invariantSites = false;
    $scope.gamma = false;
    $scope.clockModel = 'Strict';
    $scope.treePrior = 'Constant';
    $scope.geospatialUncertainties = false;
    $scope.disjoinerLevel = 'Auto';
    $scope.jobName = null;
    $scope.runError = null;
    $scope.running = false;
    $scope.success = null;
    $scope.fileToSend = null;
    $scope.filename = 'none';
    $scope.glmButtonClass = null;
    $scope.numSelected = RecordData.getNumSelected();
    $scope.downloadLink = null;
    $scope.successWithExclusion = null;
    $scope.currentJobName = null;
    $scope.ExcludedRecordDownloadLink = null;
    $scope.ExcludedRecordCount = null;
    grecaptcha.reset();
  };

  $scope.$watch(function () {return RecordData.getNumSelected();}, function(newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.warning = null;
      $scope.runError = null;
      $scope.success = null;
      $scope.successWithExclusion = null;
      $scope.numSelected = newValue;
      if ($scope.numSelected < 5) {
        $scope.warning = 'Too Few Records, Minimum is 5';
      }
      else if ($scope.numSelected > 1000) {
        $scope.warning = 'Too Many Records, Maximum is 1000';
      }else if($scope.countryCount() > 25){
        $scope.warning = 'Too many Countries selected.';
      }
    }
  });

  $scope.countryCount = function(){
    var records = RecordData.getRecords();
    var countryMap = new Map();

    for (var i = 0; i < records.length; i++) {
      if (records[i].includeInJob) {
        var count = countryMap.get(records[i].country);
        if(count!=null){
          countryMap.set(records[i].country,++count);
        }else{
          countryMap.set(records[i].country,1);
        }
      }
    }
    return countryMap.size;
  }

  $scope.$watch(function () {return RecordData.getSearchCount();}, function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.reset();
    }
  });

  $scope.runJob = function() {
    if ($scope.running === false) {
      grecaptcha.reset();
      $scope.runError = null;
      $scope.running = true;
      $scope.success = null;
      $scope.warning = null;
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
          var subModel = String($scope.substitutionModel);
          var clockModel = String($scope.clockModel);
          var gamma = Boolean($scope.gamma);
          var invariantSites = Boolean($scope.invariantSites);
          var prior = String($scope.treePrior).trim();
          var chain = Number($scope.chainLength);
          var rate = Number($scope.subSampleRate);
          var geospatialUncertainties = Boolean($scope.geospatialUncertainties);
          var disjoinerLevel = String($scope.disjoinerLevel);
          var jobData = {
            replyEmail: email,
            jobName: currentJobName,
            records: jobSequences,
            useGLM: glm,
            predictors: predictors,
            xmlOptions: {
              substitutionModel: subModel,
              gamma: gamma,
              invariantSites: invariantSites,
              clockModel: clockModel,
              treePrior: prior,
              chainLength: chain,
              subSampleRate: rate,
              geospatialUncertainties: geospatialUncertainties,
              disjoinerLevel: disjoinerLevel
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
              if (response.data.accessionsRemoved) {
                $scope.success = null;
                $scope.successWithExclusion = true;
                $scope.currentJobName = currentJobName;
                $scope.ExcludedRecordCount = $scope.numSelected - response.data.jobSize;
                $scope.ExcludedRecordDownloadLink = SERVER_URI+response.data.downloadPath;
                document.getElementById("ExclusionList").innerHTML = response.data.accessionsRemoved;
              }
            }
            else {
              $scope.runError = 'Job Validation Failed: '+response.data.error;
            }
          }, function failure(response) {
            $scope.running = false;
            if(response.status === 413){
              $scope.runError = 'Job Validation Failed: Network Error(Payload) ' ;
            }else{
              $scope.runError = 'Job Validation Failed: ' +  response.data.error;
            }
          });
      }
    }
  };

  $scope.resetPredictorTemplate = function() {
    $scope.customPredictors = null;
    $scope.downloadLink = null;
  };

  $scope.uploadPredictors = function(rawFile) {
    console.log("upload");
    $scope.runError = null;
    $scope.success = null;
    var newFile = rawFile[0];
    if (newFile && newFile.size < 50000) { //50kb
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

  $scope.setupGLMTemplate = function() {
    if ($scope.generating === false && $scope.running === false) {
      $scope.generating = true;
      $scope.downloadLink = null;
      $scope.runError = null;
      $scope.success = null;
      $scope.warning = null;
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
      for (var [loc, count] of locationMap) {
        templateString += loc + delimiter;
        templateString += locationValueMap.get(loc).latitude + delimiter;
        templateString += locationValueMap.get(loc).longitude + delimiter;
        templateString += count + delimiter;
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

  $scope.verifyCaptcha = function(){
    var response = grecaptcha.getResponse();
    var captchaUri = SERVER_URI+'/job/siteverify';
    if(response.length > 0){
      var CaptchaVerify = {
        recaptchRes: response
      }
      $http.post(captchaUri, CaptchaVerify).then(function success(response) {
        if (response.status === 200) {
          $scope.runJob();
        }
        else {
          $scope.runError = 'Captcha Validation Failed: '+response.error;   
        }
      }, function failure(response) {
        $scope.runError = 'Captcha Validation Failed';
      });
    }else{
      $scope.runError = 'Captcha Validation Required to Run the Job';
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
