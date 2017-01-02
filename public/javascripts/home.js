'use strict';

angular.module('ZooPhy').controller('homeController', function ($scope, $http, $timeout) {

  $scope.viruses = [];
  $scope.hosts = [];
  $scope.genes = [];
  $scope.continents = [];
  $scope.countries = [];
  $scope.regions = [];

  $scope.fromYear = 1900;
  $scope.toYear = 2017;
  $scope.minSequenceLength = 0;
  $scope.virus = null;
  $scope.host = null;
  $scope.gene = null;
  $scope.continent = null;
  $scope.country = null;
  $scope.region = null;

  $scope.file = null;



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
