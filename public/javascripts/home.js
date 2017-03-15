'use strict';

angular.module('ZooPhy').controller('homeController', function ($scope, $http) {

  $scope.allowed_values = null;

  $scope.genes = [];
  const allGenes = "All";
  const completeGenes = "Complete";
  $scope.countries = [];
  $scope.regions = [];

  $scope.selectedGenes = [];
  $scope.selectedCountries = [];
  $scope.selectedRegions = [];

  $scope.from = 0;
  $scope.to = Number(new Date().getFullYear());
  $scope.minimumSequenceLength = 0;

  $scope.hostIsAvian = false;
  $scope.countryHasRegions = false;

  function setCountries(country_list) {
    country_list.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
    let allCountry = {
      name: 'All',
      geoname_id: Number($('#continent').val())
    };
    country_list.splice(0, 0, allCountry);
    $scope.countries = country_list.slice();
    $scope.selectedCountries = [$scope.countries[0]];
  }

  function setRegions(country_list) {
    $scope.regions = [];
    let temp_regions = [];
    for (let i = 0; i < country_list.length; i++) {
      temp_regions = [];
      if (country_list[i].regions) {
        temp_regions = country_list[i].regions.slice();
        temp_regions.sort(function(a, b) {
          return a.name.localeCompare(b.name);
        });
        let allRegion = {
          name: 'All '+country_list[i].name,
          geoname_id: Number(country_list[i].geoname_id)
        };
        temp_regions.splice(0, 0, allRegion);
        $scope.regions = $scope.regions.concat(temp_regions);
      }
    }
    if ($scope.regions.length > 0) {
      $scope.selectedRegions = [$scope.regions[0]];
      $scope.countryHasRegions = true;
    }
    else {
      $scope.selectedRegions = [];
      $scope.countryHasRegions = false;
    }
  }

  $scope.$watch('selectedCountries', function (newVal, oldVal) {
    let wasChanged = false;
    if (newVal.length === oldVal.length) {
      let tempNew = newVal.slice();
      tempNew.sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });
      let tempOld = oldVal.slice();
      tempOld.sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });
      for (let i = 0; i < newVal.length; i++) {
        if (Number(newVal[i].geoname_id) != Number(oldVal[i].geoname_id)) {
          wasChanged = true;
          i = newVal.length;
        }
      }
    }
    else {
      wasChanged = true;
    }
    if (wasChanged) {
      setRegions(newVal);
    }
  });

  $("#host").change(function() {
    if (Number($("#host").val()) === 8782) {
      $scope.hostIsAvian = true;
      console.log('host has avian')
      //TODO: fix the ng-show issue -> note: it updates when the country box is clicked
    }
    else {
      $scope.hostIsAvian = false;
    }
  });

  $http.get(SERVER_URI+'/allowed').then(function(response) {
    if (response.status === 200) {
      $scope.allowed_values = response.data;
      $("#host").removeClass('hidden');
      $('#avian-host-container').removeClass('hidden');
      $('#regions-container').removeClass('hidden');
      $scope.genes = $scope.allowed_values.viruses[0].genes;
      let temp_countries = [];
      for (let i = 0; i < $scope.allowed_values.continents.length; i++) {
        temp_countries = temp_countries.concat($scope.allowed_values.continents[i].countries);
      }
      setCountries(temp_countries.slice());
    }
    else {
      console.log('Could not load necessary values: ', response.data.error);
    }
  });

  $scope.search = function() {
    let host = Number($("#host").val());
    let virus = Number($("#virus").val());
    let continent = Number($("#continent").val());
    let query = 'TaxonID:'+virus+' AND HostID:'+host;
    if ($scope.minimumSequenceLength > 0) {
      let minLength = $scope.minimumSequenceLength+'';
      while (minLength.length < 5) {
        minLength = '0'+minLength;
      }
      query += ' AND SegmentLength:['+minLength+' TO 99999]';
    }
    if ($scope.from > 0) {
      let fromYear = $scope.from+'';
      let toYear = '';
      while (fromYear.length < 4) {
        fromYear = '0'+fromYear;
      }
      if ($scope.to > $scope.from) {
        toYear = $scope.to + '';
        while (toYear.length < 4) {
          toYear = '0'+toYear;
        }
      }
      else {
        $scope.to = Number(new Date().getFullYear());
        toYear = $scope.to + '';
      }
      query += 'Date:['+fromYear+' TO '+toYear+'1231]';
    }
    else if ($scope.to > 0) {
      let toYear = $scope.to + '';
      while (toYear.length < 4) {
        toYear = '0'+toYear;
      }
      query += 'Date:[0000 TO '+toYear+'1231]';
    }
    query = encodeURI(query.trim());
    $http.get(SERVER_URI+'/search?query='+query).then(function(response) {
      if (response.status === 200) {
        console.log(response.data);
        // updateResults(response.data);
      }
      else {
        console.log('Could not load necessary values: ', response.data.error);
      }
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
