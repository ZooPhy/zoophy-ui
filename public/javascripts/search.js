'use strict';

angular.module('ZooPhy').controller('searchController', function ($scope, $http, RecordData) {

  $scope.allowed_values = null;

  $scope.virus = 197911;
  $scope.hantaSub = 11599;
  $scope.fluAHs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  $scope.fluAH = 1;
  $scope.fluANs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  $scope.fluAN = 1;
  $scope.isH1N1 = true;
  $scope.genes = [];
  var completeGenes = "Complete";
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
  $scope.isPDMO9 = false;
  $scope.filename = 'none';
  $scope.fileToSend = null;
  
  $scope.fastaFilename = 'none';
  $scope.fastaFile = null;
  
  $scope.showDetails = false;
  $scope.selectedRecord = null;
  $scope.searchError = null;

  var ACCESSION_FILE_RE = /^(\w|-|\.){1,250}?\.txt$/;
  var FASTA_FILE_RE = /^([\w\s-\(\)]){1,250}?\.(txt|fasta)$/;
  var combinedRecords =[];

  $scope.reset = function() {
    $scope.searchError = null;
    $scope.virus = $scope.allowed_values.viruses[0].tax_id;
    $scope.hantaSub = 11599;
    $scope.fluAH = 1;
    $scope.fluAN = 1;
    $scope.isH1N1 = true;
    $scope.host = $scope.allowed_values.hosts[0].tax_id;
    $scope.avianHost = $scope.allowed_values.avian_hosts[0].tax_id;
    $scope.genes = $scope.allowed_values.viruses[0].genes.slice();
    // $scope.genes.push(completeGenes);
    $scope.selectedGenes = [];
    $scope.continent = 1;
    $scope.selectedCountries = [];
    $scope.countryHasRegions = false;
    $scope.selectedRegions = [];
    $scope.from = 0;
    $scope.to = Number(new Date().getFullYear());
    $scope.minimumSequenceLength = 0;
    $scope.isPDMO9 = false;
    $scope.filename = 'none';
    $scope.fileToSend = null;
    $scope.fastaFilename = 'none';
    $scope.fastaFile = null;
    };

  $scope.checkH1N1 = function() {
    $scope.isH1N1 = Boolean($scope.fluAH === 1 && $scope.fluAN === 1);
  };

  $scope.updateGenes = function() {
    var virusIndex = $('#virus')[0].selectedIndex;
    $scope.genes = $scope.allowed_values.viruses[virusIndex].genes.slice();
    if($scope.allowed_values.viruses[virusIndex].tax_id != 0) {
      $scope.genes.push(completeGenes);
      // $scope.search-btn = 
    } else {
      //search-btn

    }
  };

  $scope.updateCountries = function() {
    var tempCountries = [];
    if ($scope.continent === 1) {
      for (var i = 0; i < $scope.allowed_values.continents.length; i++) {
        tempCountries = tempCountries.concat($scope.allowed_values.continents[i].countries);
      }
    }
    else {
      for (var i = 0; i < $scope.allowed_values.continents.length; i++) {
        if ($scope.allowed_values.continents[i].geoname_id === $scope.continent) {
          tempCountries = tempCountries.concat($scope.allowed_values.continents[i].countries);
        }
      }
    }
    tempCountries.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
    $scope.countries = tempCountries;
    $scope.selectedCountries = [];
    $scope.updateRegions();
  };

  $scope.updateRegions = function() {
    var countryList = $scope.selectedCountries;
    $scope.regions = [];
    $scope.selectedRegions = [];
    var tempRegions = [];
    for (var i = 0; i < countryList.length; i++) {
      tempRegions = [];
      if (countryList[i].regions) {
        tempRegions = countryList[i].regions.slice();
        tempRegions.sort(function(a, b) {
          return a.name.localeCompare(b.name);
        });
        var allRegion = {
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

  $http.get(SERVER_URI+'/allowed').then(function(response) {
    if (response.status === 200) {
      $scope.allowed_values = response.data;
      $("#host").removeClass('hidden');
      $('#avian-host-container').removeClass('hidden');
      $('#regions-container').removeClass('hidden');
      $scope.virus = $scope.allowed_values.viruses[0].tax_id;
      $scope.genes = $scope.allowed_values.viruses[0].genes.slice();
      // if($scope.genes = $scope.allowed_values.viruses[virusIndex].tax_id != 0) {
      //   $scope.genes.push(completeGenes);
      // }
      $scope.updateCountries();
    }
    else {
      $scope.searchError = 'Search Setup Failed on Server. Please refresh and try again.';
    }
  });

  $scope.search = function() {
    $scope.searchError = null;
    var virus = Number($scope.virus);
    var pdmo9 = false;
    if (virus === 11598) {
      virus = Number($scope.hantaSub);
    }
    else if (virus === 197911) {
      var subH = Number($scope.fluAH);
      var subN = Number($scope.fluAN);
      virus = Number($scope.allowed_values.influenza_a_sub_type_ids[subH-1][subN-1]);
      if (subH === 1 && subN === 1) {
        pdmo9 = Boolean($scope.isPDMO9 === true);
      }
    }
    var host = Number($scope.host);
    if (host === 8782) {
      host = Number($scope.avianHost);
    }
    var query = 'TaxonID:'+virus+' AND HostID:'+host;
    if (pdmo9) {
      query += ' AND PH1N1:true';
    }
    var genes = $scope.selectedGenes;
    if (genes.length > 0) {
      var geneString = ' AND Gene:('+genes[0];
      for (var i = 1; i < genes.length; i++) {
        geneString += ' OR '+genes[i];
      }
      if (genes.indexOf(completeGenes) === -1) {
        geneString += ' NOT Complete';
      }
      geneString += ')';
      query += geneString;
    }
    var continent = Number($scope.continent);
    var countries = $scope.selectedCountries;
    var regions = $scope.selectedRegions;
    if (!(continent === 1 && countries.length === 0)) {
      var geoString = ' AND GeonameID:(';
      if (countries.length === 0) {
        geoString += continent;
      }
      else if (regions.length === 0) {
        geoString += Number(countries[0].geoname_id);
        for (var i = 1; i < countries.length; i++) {
          geoString += ' OR '+Number(countries[i].geoname_id);
        }
      }
      else {
        geoString += Number(regions[0].geoname_id);
        for (var i = 1; i < regions.length; i++) {
          geoString += ' OR '+Number(regions[i].geoname_id);
        }
      }
      geoString +=')';
      query += geoString;
    }
    if ($scope.minimumSequenceLength > 0) {
      var minLength = $scope.minimumSequenceLength+'';
      while (minLength.length < 5) {
        minLength = '0'+minLength;
      }
      query += ' AND SegmentLength:['+minLength+' TO 99999]';
    }
    if ($scope.from > 0) {
      var fromYear = $scope.from+'';
      var toYear = '';
      while (fromYear.length < 4) {
        fromYear = '0'+fromYear;
      }
      fromYear += '0000';
      if ($scope.to >= $scope.from) {
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
      var toYear = $scope.to + '';
      while (toYear.length < 4) {
        toYear = '0'+toYear;
      }
      query += ' AND Date:[00000000 TO '+toYear+'1231]';
    }
    query = encodeURIComponent(query.trim());
    $http.get(SERVER_URI+'/search?query='+query).then(function(response) {
      if (response.status === 200) {
        combinedRecords = combinedRecords.concat(response.data.records);
        RecordData.setRecords(combinedRecords);
        combinedRecords =[];
        RecordData.setTypeGenbank(true);
        RecordData.incrementSearchCount();
        if (response.data.records.length > 0) {
          $scope.$parent.switchTabs('results');
        }
        else {
          $scope.searchError = 'Search returned 0 results.';
        }
      }
      else {
        $scope.searchError = 'Search Failed on Server. Please refresh and try again.';
      }
    });
    $(window).scroll(function() {
      $("#detail-panel").stop().animate({"marginTop": ($(window).scrollTop()) + "px"}, "fast", "swing");
    });
  };

  $scope.uploadAccessions = function(rawFile) {
    $scope.searchError = null;
    var newFile = rawFile[0];
    if (newFile && newFile.size < 50000) { //5kb
      var filename = newFile.name.trim();
      if (ACCESSION_FILE_RE.test(filename)) {
        $scope.fileToSend = newFile;
        $scope.filename = String(filename).trim();
      }
      else {
        $scope.searchError = 'Invalid File Name. Must be .txt file.';
      }
    }
    else {
      $scope.searchError = 'Invalid File Size. Limit is 5kb.';
    }
    $scope.$apply();
  };

  $scope.sendAccessions = function() {
    $scope.searchError = null;
    if ($scope.fileToSend) {
      var form = new FormData();
      var uri = SERVER_URI+'/upload';
      form.append('accessionFile', $scope.fileToSend);
      $http.post(uri, form, {
          headers: {'Content-Type': undefined}
      }).then(function (response) {
        RecordData.setRecords(response.data.records);
        RecordData.setTypeGenbank(true);
        if (response.data.records.length > 0) {
          $scope.$parent.switchTabs('results');
        }
        else {
          $scope.searchError = 'Search returned 0 results.';
        }
        RecordData.incrementSearchCount();
      }, function(error) {
        if (error.status !== 500) {
          $scope.searchError = error.data.error;
        }
        else {
          $scope.searchError = 'Search Failed on Server. Please refresh and try again.';
        }
      });
    }
    else {
      $scope.searchError = 'No Accession File Selected';
    }
  };

  $scope.showHelp = function() {
    BootstrapDialog.show({
      title: 'Accession Upload Help',
      message: 'The Accession file needs to be a new line delimited .txt file containing 1 Accession per line. The current search limit is 2500 Accessions.'
    });
  };

  $scope.uploadFasta = function(rawFile) {
    $scope.searchError = null;
    var newFile = rawFile[0];
    if (newFile && newFile.size < 1000000) { //1mb
      var filename = newFile.name.trim();
      if (FASTA_FILE_RE.test(filename)) {
        $scope.fastaFile = newFile;
        $scope.fastaFilename = String(filename).trim();
      }
      else {
        $scope.searchError = 'Invalid File Name. Must be .txt file.';
      }
    }
    else {
      $scope.searchError = 'Invalid File Size. Limit is 1mb.';
    }
    $scope.$apply();
  };

  $scope.sendFasta = function() {
    $scope.searchError = null;
    if ($scope.fastaFile) {
      var form = new FormData();
      var uri = SERVER_URI+'/upfasta';
      form.append('fastaFile', $scope.fastaFile);
      console.log("Posting " + uri + " " + $scope.fastaFile.type)
      $http.post(uri, form, {
          headers: {'Content-Type': undefined}
      }).then(function (response) {
        RecordData.setRecords(response.data.records);
        RecordData.setTypeGenbank(false);
        if (response.data.records.length > 0) {
          $scope.$parent.switchTabs('results');
        }
        else {
          $scope.searchError = 'Processed 0 results.';
        }
        RecordData.incrementSearchCount();
      }, function(error) {
        if (error.status !== 500) {
          $scope.searchError = error.data.error;
        }
        else {
          $scope.searchError = 'Parsing Failed on Server. Please refresh and try again.';
        }
      });
    }
    else {
      $scope.searchError = 'No FASTA File Selected';
    }
  };

  $scope.sendFastaNgenbank = function() {
    $scope.searchError = null;
    if ($scope.fastaFile) {
      var form = new FormData();
      var uri = SERVER_URI+'/upfasta';
      form.append('fastaFile', $scope.fastaFile);
      $http.post(uri, form, {
          headers: {'Content-Type': undefined}
      }).then(function (response) {
        if (response.data.records.length > 0) {
          combinedRecords = response.data.records;
          $scope.search();
        }
        else {
          $scope.searchError = 'Processed 0 results.';
        }
        RecordData.incrementSearchCount();
      }, function(error) {
        if (error.status !== 500) {
          $scope.searchError = error.data.error;
        }
        else {
          $scope.searchError = 'Parsing Failed on Server. Please refresh and try again.';
        }
      });
    }
    else {
      $scope.searchError = 'No FASTA File Selected';
    }
  };

  $scope.showFastaHelp = function() {
    BootstrapDialog.show({
      title: 'FASTA Upload Help',
      message: 'The FILE file needs to have a metadata line preceded by the > symbol. It should be followed by a new line and the sequence string. The current file size limit is 10mb.'
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
