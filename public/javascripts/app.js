'use strict';

//TODO: update on server if using reverse proxy
//var SERVER_URI = 'https://zodo.asu.edu/zoophy';
var SERVER_URI = location.protocol + '//' + location.hostname + ':' + location.port;

// Main Angular App
var ZooPhyApp = angular.module('ZooPhy', ['angularUtils.directives.dirPagination']);

// Factory for sharing data between controllers
ZooPhyApp.factory('RecordData', function() {
  var recordData = {
    records: [],
    numSelected: 0,
    searchCount: 0,
    typeGenbank: true
  };
  return {
    getRecords: function() {
      return recordData.records;
    },
    setRecords: function (newRecords) {
      recordData.records = newRecords;
    },
    getNumSelected: function() {
      return recordData.numSelected;
    },
    setNumSelected: function(newNum) {
      recordData.numSelected = Number(newNum);
    },
    getSearchCount: function() {
      return recordData.searchCount;
    },
    incrementSearchCount: function() {
      recordData.searchCount++;
    },
    setTypeGenbank: function(newBoolVal) {
      recordData.typeGenbank = Boolean(newBoolVal);
    },
    isTypeGenbank: function() {
      return recordData.typeGenbank;
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
