'use strict';

angular.module('ZooPhy').controller('searchController', function ($scope, $http, RecordData) {

  $scope.allowed_values = null;

  $scope.virus = 197911;
  $scope.genes = [];
  const completeGenes = "Complete";
  $scope.selectedGenes = [];
  $scope.host = 1;
  $scope.avianHost = 8782;
  $scope.continent = 1;
  $scope.countries = [];
  $scope.selectedCountries = [];
  $scope.countryHasRegions = false;
  $scope.regions = [];
  $scope.selectedRegions = [];

  $scope.from = 0;
  $scope.to = Number(new Date().getFullYear());
  $scope.minimumSequenceLength = 0;

  $scope.showDetails = false;
  $scope.selectedRecord = null;
  $scope.searchError = null;

  $scope.reset = function() {
    $scope.virus = $scope.allowed_values.viruses[0].tax_id;
    $scope.host = $scope.allowed_values.hosts[0].tax_id;
    $scope.avianHost = $scope.allowed_values.avian_hosts[0].tax_id;
    $scope.genes = $scope.allowed_values.viruses[0].genes;
    $scope.selectedGenes = [];
    $scope.continent = 1;
    $scope.selectedCountries = [];
    $scope.countryHasRegions = false;
    $scope.selectedRegions = [];
    $scope.from = 0;
    $scope.to = Number(new Date().getFullYear());
    $scope.minimumSequenceLength = 0;
    setTimeout(resetSelects, 10);
  };

  function resetSelects() {
    $('.selectpicker').selectpicker('render');
  }

  $scope.updateGenes = function() {
    let virusIndex = $('#virus')[0].selectedIndex;
    $scope.genes = $scope.allowed_values.viruses[virusIndex].genes;
  };

  $scope.updateCountries = function() {
    let tempCountries = [];
    if ($scope.continent === 1) {
      for (let i = 0; i < $scope.allowed_values.continents.length; i++) {
        tempCountries = tempCountries.concat($scope.allowed_values.continents[i].countries);
      }
    }
    else {
      for (let i = 0; i < $scope.allowed_values.continents.length; i++) {
        if ($scope.allowed_values.continents[i].geoname_id === $scope.continent) {
          tempCountries = tempCountries.concat($scope.allowed_values.continents[i].countries);
        }
      }
    }
    $scope.countries = tempCountries;
    $scope.selectedCountries = [];
    $scope.updateRegions();
  };

  $scope.updateRegions = function() {
    let countryList = $scope.selectedCountries;
    $scope.regions = [];
    $scope.selectedRegions = [];
    let tempRegions = [];
    for (let i = 0; i < countryList.length; i++) {
      tempRegions = [];
      if (countryList[i].regions) {
        tempRegions = countryList[i].regions.slice();
        tempRegions.sort(function(a, b) {
          return a.name.localeCompare(b.name);
        });
        let allRegion = {
          name: 'All '+countryList[i].name,
          geoname_id: Number(countryList[i].geoname_id)
        };
        tempRegions.splice(0, 0, allRegion);
        $scope.regions = $scope.regions.concat(tempRegions);
      }
    }
    if ($scope.regions.length > 0) {
      $scope.countryHasRegions = true;
    }
    else {
      $scope.countryHasRegions = false;
    }
  };

  function setCountries(countryList) {
    countryList.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
    let allCountry = {
      name: 'All',
      geoname_id: Number($('#continent').val())
    };
    countryList.splice(0, 0, allCountry);
    $scope.countries = countryList.slice();
    $scope.selectedCountries = [$scope.countries[0]];
  };

  $http.get(SERVER_URI+'/allowed').then(function(response) {
    if (response.status === 200) {
      $scope.allowed_values = response.data;
      $("#host").removeClass('hidden');
      $('#avian-host-container').removeClass('hidden');
      $('#regions-container').removeClass('hidden');
      $scope.virus = $scope.allowed_values.viruses[0].tax_id;
      $scope.genes = $scope.allowed_values.viruses[0].genes;
      $scope.updateCountries();
    }
    else {
      console.log('Could not load necessary values: ', response.data.error);
    }
  });

  $scope.search = function() {
    let virus = Number($scope.virus);
    let host = Number($scope.host);
    if (host === 8782) {
      host = Number($scope.avianHost);
    }
    let query = 'TaxonID:'+virus+' AND HostID:'+host;
    let genes = $scope.selectedGenes;
    if (genes.length > 0) {
      let geneString = ' AND Gene:('+genes[0];
      for (let i = 1; i < genes.length; i++) {
        geneString += ' OR '+genes[i];
      }
      if (genes.indexOf(completeGenes) === -1) {
        geneString += ' NOT Complete';
      }
      geneString += ')';
      query += geneString;
    }
    let continent = Number($scope.continent);
    let countries = $scope.selectedCountries;
    let regions = $scope.selectedRegions;
    console.log(continent);
    console.log(countries);
    console.log(regions);
    if (!(continent === 1 && countries.length === 0)) {
      let geoString = ' AND GeonameID:(';
      if (countries.length === 0) {
        geoString += continent;
      }
      else if (regions.length === 0) {
        geoString += Number(countries[0].geoname_id);
        for (let i = 1; i < countries.length; i++) {
          geoString += ' OR '+Number(countries[i].geoname_id);
        }
      }
      else {
        geoString += Number(regions[0].geoname_id);
        for (let i = 1; i < regions.length; i++) {
          geoString += ' OR '+Number(regions[i].geoname_id);
        }
      }
      geoString +=')';
      query += geoString;
    }
    if ($scope.minimumSequenceLength > 0) {
      let minLength = $scope.minimumSequenceLength+'';
      while (minLength.length < 4) {
        minLength = '0'+minLength;
      }
      query += ' AND SegmentLength:['+minLength+' TO 9999]';
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
      query += ' AND Date:['+fromYear+' TO '+toYear+'1231]';
    }
    else if ($scope.to > 0) {
      let toYear = $scope.to + '';
      while (toYear.length < 4) {
        toYear = '0'+toYear;
      }
      query += ' AND Date:[0000 TO '+toYear+'1231]';
    }
    console.log(query);
    query = encodeURIComponent(query.trim());
    $http.get(SERVER_URI+'/search?query='+query).then(function(response) {
      if (response.status === 200) {
        let searchResults = response.data.records;
        console.log('search call finished with '+searchResults.length+' results.')
        if (searchResults.length > 0) {
          RecordData.setRecords(searchResults);
          $scope.$parent.switchTabs('results');
        }
        else {
          $scope.searchError = 'Search returned 0 results';
        }
      }
      else {
        console.log('Could not load necessary values: ', response.data.error);
        $scope.searchError = 'Search Failed on Server. Please refresh and try again.';
      }
    });
    $(window).scroll(function() {
      $("#detail-panel").stop().animate({"marginTop": ($(window).scrollTop()) + "px"}, "fast", "swing");
    });
    RecordData.setNumSelected(0);
    RecordData.incrementSearchCount();
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
