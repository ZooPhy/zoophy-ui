angular.module('ZooPhy').controller('runController', function ($scope, $http, RecordData) {

  const EMAIL_RE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  $scope.numSelected = RecordData.getNumSelected();
  $scope.jobEmail;
  $scope.jobName;

  $scope.$watch(function () {return RecordData.getNumSelected();}, function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.numSelected = newValue;
        }
  });

  $scope.runJob = function() {
    if ($scope.jobEmail && EMAIL_RE.test($scope.jobEmail)) {
      let jobAccessions = [];
      let records = RecordData.getRecords();
      for (let i = 0; i < records; i++) {
        if (records[i].includeInJob) {
          jobAccessions.push(records[i].accession);
        }
      }
      let runUri = SERVER_URI+'/job/run';
      let jobData = {
        replyEmail: $scope.jobEmail,
        jobName: $scope.jobName,
        accessions: jobAccessions,
        useGLM: false,
        predictors: null
      };
      //$http.post(runUri, jobData)
      console.log('job started...');
    }
    else {
      console.log('invalid email')
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
