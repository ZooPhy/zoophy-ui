'use strict';

angular.module('ZooPhy').controller('resultsController', function ($scope, $http, RecordData) {

  $scope.pageNums = [25, 50, 100, 250, 500];
  $scope.groupIsSelected = false;
  $scope.numSelected = RecordData.getNumSelected();
  $scope.results = RecordData.getRecords();
  $scope.selectedRecord = null;
  $scope.downloadLink = null;
  $scope.generating = false;
  $scope.downloadFormat = "csv";
  $scope.downloadError = null;
  $scope.sortField = 'accession';
  $scope.sortReverse = false;
  $scope.recordsPerPage = 25;
  $scope.warning = null;
  $scope.sampleType = 'percent';
  $scope.combineResults = 'false';
  $scope.sampleAmount = 20;
  $scope.fastaFilename = 'none';
  $scope.fastaFile = null;
  $scope.fastaError = null;
  $scope.percentOfRecords = String(Math.floor($scope.results.length*($scope.sampleAmount/100.0)));
  $scope.downloadColumnsCount = 0;
  $scope.searchedVirusName = null;
  $scope.completeRecordsCount = 0;
  $scope.distinctLocationsCount = 0;
  $scope.geoLocMap = null;
  $scope.viewLayerfeatures = [];

  const SOURCE_GENBANK = 1;
  const SOURCE_FASTA = 2;
  const MAX_COLUMNS = 8;
  var FASTA_FILE_RE = /^([\w\s-\(\)]){1,250}?\.(txt|fasta)$/;

  if($scope.geoLocMap == null){
    console.log('initializing map');
    initMap();
  }

  $scope.updateSort = function(field) {
    if (field === $scope.sortField) {
      $scope.sortReverse = !$scope.sortReverse;
    }
    else {
      $scope.sortField = field;
    }
  };

  $scope.$watch(function () {return RecordData.getSearchCount();}, function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.results = RecordData.getRecords();
      if ($scope.results.length > 0) {
        var totalRecords = $scope.results.length
        $scope.searchedVirusName = $scope.results[totalRecords-1].virus;
        $scope.clearLayerFeatures();
        $scope.LoadDetails($scope.results[totalRecords-1]);
        $scope.loadHeatmapLayer($scope.results);
        $('#probThreshold').val(0);
        $('#probThrVal').text("0%");
      }
      $scope.groupIsSelected = false;
      $scope.numSelected = 0;
      RecordData.setNumSelected($scope.numSelected);
      $scope.downloadLink = null;
      $scope.generating = false;
      $scope.downloadFormat = "csv";
      $scope.warning = null;
      $scope.downloadError = null;
      $scope.sampleType = 'percent';
      $scope.combineResults = 'false';
      $scope.sampleAmount = 20;
      $scope.fastaFilename = 'none';
      $scope.fastaFile = null;
      $scope.fastaError = null;
      $scope.percentOfRecords = String(Math.floor($scope.results.length*($scope.sampleAmount/100.0)));
      $scope.completeRecordsCount = 0;
      $scope.distinctLocationsCount = 0;
    }
  });

  $scope.LoadDetails = function(selrecord) {
    var resourceSource = selrecord.resourceSource;
    if(resourceSource === SOURCE_GENBANK){
      $scope.warning = null;
      $http.get(SERVER_URI+'/record?accession='+selrecord.accession.trim()).then(function(response) {
        if (response.status === 200) {
          $scope.selectedRecord = response.data.record;
          $scope.showDetails = true;
          $scope.showCustDetails = false;
          $scope.highlightLocation($scope.selectedRecord);
        }
        else {
          $scope.warning = 'Could not load record: '+selrecord;
        }
      });
    } else {
      $scope.selectedRecord = selrecord;
      $scope.showDetails = false;
      $scope.showCustDetails = true;
}
  };

  $scope.toggleRecord = function(record) {
    if (record.includeInJob) {
      $scope.numSelected--;
      $scope.groupIsSelected = false;
      $scope.updateSelections(record,false);
    }
    else {
      $scope.numSelected++;
      $scope.updateSelections(record,true);
      if ($scope.numSelected === $scope.results.length) {
        $scope.groupIsSelected = true;
      }
    }
    record.includeInJob = !record.includeInJob;
    RecordData.setNumSelected($scope.numSelected);
    $scope.recordStats();
  };

  $scope.toggleAll = function() {
    for (var i = 0; i < $scope.results.length; i++) {
      $scope.results[i].includeInJob = $scope.groupIsSelected;
    }
    if ($scope.groupIsSelected) {
      $scope.numSelected = $scope.results.length;
    }
    else {
      $scope.numSelected = 0;
    }
    $scope.updateAllSelections($scope.results, $scope.groupIsSelected);
    RecordData.setNumSelected($scope.numSelected);
    $scope.recordStats();
  };


  $scope.recordStats = function(){
    var locationMap = new Map();
    $scope.completeRecordsCount = 0;
    for (var i = 0; i < $scope.results.length; i++) {
      var record = $scope.results[i];
      if(record.includeInJob && record.country !== "Unknown" ){           //location count
        var locationString = record.geonameid;
        var count = locationMap.get(locationString);
        if(count!=null){
          locationMap.set(locationString,++count);
        }else{
          locationMap.set(locationString,1);
        }
      }if(record.includeInJob && record.date !== "Unknown" && record.country !== "Unknown" ){   //complete record
        $scope.completeRecordsCount++;
      }
    }
    $scope.distinctLocationsCount = locationMap.size;
  }

  $scope.goToRun = function() {
    $scope.$parent.switchTabs('run');
  };

  $scope.setupDownload = function(downloadColumns) {
    $scope.warning = null;
    if (!$scope.generating) {
      var format = String($scope.downloadFormat);
      $scope.generating = true;
      $scope.downloadLink = null;
      $scope.downloadError = null;
      if ($scope.results.length < 1 || $scope.numSelected < 1) {
        $scope.generating = false;
        $scope.downloadError = 'No Results to Download';
      }else if(downloadColumns.length<1){
        $scope.generating = false;
        $scope.downloadError = 'No Column selected for Download';
      }
      else if (format === 'csv' || format === 'fasta') {
        $scope.downloadFormat = format;
        var downloadRecords = [];
        for (var i = 0; i < $scope.results.length; i++) {
          if($scope.results[i].includeInJob){
            downloadAccessions.push($scope.results[i].accession);
            var downloadRecord = {
              id:$scope.results[i].accession,
              collectionDate:$scope.results[i].date,
              geonameID:$scope.results[i].geonameid,
              rawSequence:$scope.results[i].sequence,
              resourceSource:$scope.results[i].resourceSource
            }
            downloadRecords.push(downloadRecord);
          }
        }
        var downloadURI = SERVER_URI+'/download/'+format;
        var downloadList = {
          accessions: downloadRecords,
          columns: downloadColumns};
        $http.post(downloadURI, downloadList).then(function success(response) {
          $scope.generating = false;
          if (response.status === 200) {
            $scope.downloadLink = SERVER_URI+response.data.downloadPath;
          }
          else {
            $scope.downloadError = 'Error generating download';
          }
        }, function failure(response) {
          $scope.generating = false;
          $scope.downloadError = 'Error generating download';
        });
      }
      else {
        $scope.generating = false;
        $scope.downloadError = 'Invalid Download Format';
      }
    }
  };

  $scope.validateDownSample = function() {
    var sampleType = String($scope.sampleType);
    var sampleAmount = Number($scope.sampleAmount);
    var check_for_validInput=false;
    if (sampleType === 'percent' ) { 
      if (sampleAmount > 0 && sampleAmount <= 100) { 
        check_for_validInput=true;  
      }
    }
    else if (sampleType === 'number' ) { 
      if(sampleAmount > 0 && sampleAmount <= $scope.results.length){ 
        check_for_validInput=true;  
      }
    }
    if(check_for_validInput === false) { 
      $scope.warning = 'Invalid Downsample'; 
    }
    else {
      $scope.warning = null;
      if (sampleType === 'percent') {
        $scope.downSamplePercent(sampleAmount);
      }
      else {
        $scope.downSampleAmount(sampleAmount);
      }
    }
  };

  $scope.downSamplePercent = function(percentage) {
    var numToSelect =  Math.floor($scope.results.length*(percentage/100.0));
    $scope.downSampleAmount(numToSelect);
  };

  $scope.downSampleAmount = function(amount) {
    var recs = $scope.results.slice();
    if (amount < recs.length) {
      $scope.groupIsSelected = false;
    }
    var samples = [];
    var index = -1;
    while (amount > 0 && recs.length > 0) {
      index = Math.floor(Math.random()*(recs.length));
      samples.push(recs[index].accession);
      recs.splice(index, 1);
      amount--;
    }
    $scope.numSelected = 0;
    for (var i = 0; i < $scope.results.length; i++) {
      if (samples.indexOf($scope.results[i].accession) > -1) {
        $scope.results[i].includeInJob = true;
        $scope.numSelected++;
      }
      else {
        $scope.results[i].includeInJob = false;
      }
    }
    RecordData.setRecords($scope.results);
    RecordData.setNumSelected($scope.numSelected);
  };

  $scope.uploadFasta = function(rawFile) {
    $scope.fastaError = null;
    $scope.warning = null;
    var newFile = rawFile[0];
    if (newFile && newFile.size < 10000000) { //10mb
      var filename = newFile.name.trim();
      if (FASTA_FILE_RE.test(filename)) {
        $scope.fastaFile = newFile;
        $scope.fastaFilename = String(filename).trim();
      }
      else {
        $scope.fastaError = 'Invalid File Name. Must be .txt file.';
      }
    }
    else {
      $scope.fastaError = 'Invalid File Size. Limit is 1mb.';
    }
    $scope.$apply();
  };

  $scope.confirmSendFasta = function(){
    var combinedSearch = String($scope.combineResults);
    if($scope.results.length>0 && combinedSearch==='false'){
      $('#confirmFastaModel').modal('show'); 
    }else{
      $scope.sendFasta();      
    }
  }

  $scope.sendFasta = function() {
    $('#fastaModel').modal('toggle');
    var combinedSearch = String($scope.combineResults);
      $scope.fastaError = null;
      if ($scope.fastaFile) {
        var form = new FormData();
        var uri = SERVER_URI+'/upfasta';
        form.append('fastaFile', $scope.fastaFile);
        console.log("Posting " + uri + " " + $scope.fastaFile.type)
        $http.post(uri, form, {
            headers: {'Content-Type': undefined}
        }).then(function (response) {
          var AccessionRecords =  RecordData.getRecords();
          RecordData.setRecords(response.data.records);
          var CombinedRecords = RecordData.getRecords();
          if(combinedSearch === 'true'){
            CombinedRecords = CombinedRecords.concat(AccessionRecords);
          }
          RecordData.setRecords(CombinedRecords);
          RecordData.setTypeGenbank(false);
          if (response.data.records.length > 0) {
            $scope.$parent.switchTabs('results');
            $('<div id="warning-alert" class="alert alert-warning col-md-10 col-md-offset-1 text-center">Successfully added '+ response.data.records.length+' records</div>').insertBefore('#warning-alert').delay(3000).fadeOut();  
          }
          else {
            $scope.warning = 'Processed 0 results.';
          }
          $scope.groupIsSelected = false;
          $scope.toggleAll();
          RecordData.incrementSearchCount();
        }, function(error) {
          if (error.status !== 500) {
            $scope.warning = error.data.error;
          }
          else {
            $scope.warning = 'Parsing Failed on Server. Please refresh and try again.';
          }
        });
      }
      else {
        $scope.warning = 'No FASTA File Selected';
      }
    };

    $scope.showFastaHelp = function() {
      BootstrapDialog.show({
        title: 'FASTA Upload Help',
        message: 'The FILE file needs to have a metadata line preceded by the > symbol. It should be followed by a new line and the sequence string. The current file size limit is 10mb.'
      });
    };

    $scope.updatePercentOfRecords = function() {
      $scope.percentOfRecords = String(Math.floor($scope.results.length*($scope.sampleAmount/100.0)));
    };

    $scope.columnUp = function() {
      let $selected = $('#toSelectBox').find('option:selected');
      $selected.insertBefore($selected.prev());
    };

    $scope.columnDown = function() {
      let $selected = $('#toSelectBox').find('option:selected');
      $selected.insertAfter($selected.next());
    };

    $scope.columnAdd = function() {
      var selected = $('#fromSelectBox option:selected');
      if(selected.length>0){
        $('#toSelectBox').append($(selected).clone());
        $(selected).remove();
        $scope.downloadColumnsCount++;
      }
    };

    $scope.columnAddAll = function() {
      var selected = $('#fromSelectBox option');
      if(selected.length>0){
        $('#toSelectBox').append($(selected).clone());
        $(selected).remove();
        $scope.downloadColumnsCount = MAX_COLUMNS;
      }
    };

    $scope.columnRemove = function() {
      var selected = $('#toSelectBox option:selected');
      if(selected.length>0){
        $('#fromSelectBox').append($(selected).clone());
        $(selected).remove();
        $scope.downloadColumnsCount--;
      }
    };

    $scope.columnRemoveAll = function() {
      var selected = $('#toSelectBox option');
      if(selected.length>0){
        $('#fromSelectBox').append($(selected).clone());
        $(selected).remove();
        $scope.downloadColumnsCount = 0;
      }
    };

    $scope.downloadColumn = function() {
      var downloadColumns = [];
      var selected = $('#toSelectBox option').each(function(i, option){
        downloadColumns[i] = $(option).text();
      });
      $scope.setupDownload(downloadColumns);
    };

    //--- Map content starts ---//
    function initMap() {
      var heatmapLayer = new ol.layer.Heatmap();
      heatmapLayer.set('zodolayer','heatmap');
  
      var raster = new ol.layer.Tile({
        source: new ol.source.XYZ({
        attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                      'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
        })
      });
      raster.set('zodolayer','tile');
  
      // highlight layer
      var featureStyle = new ol.style.Style({
        text: new ol.style.Text({
          text: '\uf041',
          font: 'normal 20px FontAwesome',
          textBaseline: 'Bottom',
          fill: new ol.style.Fill({
            color: 'black'
          })
        })
      });
      var vectorSource = new ol.source.Vector({features: []});
      var highlightLayer = new ol.layer.Vector({
        source: vectorSource,
        style: [featureStyle]
      })
      highlightLayer.set('zodolayer','view');
  
      // selection layer
      var featureStyle = new ol.style.Style({
        text: new ol.style.Text({
          text: '\uf041',
          font: 'normal 22px FontAwesome',
          textBaseline: 'Bottom',
          fill: new ol.style.Fill({
            color: 'blue'
          })
        })
      });
      var vectorSource = new ol.source.Vector({features: []});
      var selectionLayer = new ol.layer.Vector({
        source: vectorSource,
        style: [featureStyle]
      })
      selectionLayer.set('zodolayer','selection');
  
      // Put all layers together in the map
      $scope.geoLocMap = new ol.Map({
        layers: [raster, heatmapLayer, selectionLayer, highlightLayer],
        target: 'geolocmap',
        view: new ol.View({
          center: [0, 0],
          zoom: 1.5
        })
      });
  
      var info = $('#info');
      setTooltip(info);
  
      $('#probThreshold').on('input', function() {
        $('#probThrVal').text($('#probThreshold').val()+"%");
        $scope.updateThreshold($('#probThreshold').val()/100);
      });
    };

    $scope.clearLayerFeatures = function() {
      console.log("clearing features");
      var mapLayers = $scope.geoLocMap.getLayers().getArray();
      mapLayers.forEach(function (layer, i) {
        if (layer.get('zodolayer')!='tile'){
          if(layer.getSource()){
            layer.getSource().clear();
          }
        }
      });
    }
    
    $scope.updateThreshold = function(threshold) {
      console.log("Updating threshold " + threshold);
      var mapLayers = $scope.geoLocMap.getLayers().getArray();
      mapLayers.forEach(function (layer, j) {
        if (layer.get('zodolayer')=='view'){
          console.log("updating view layer");
          var features = [];
          for(var i=0; i< $scope.viewLayerfeatures.length; i++){
            var feature = $scope.viewLayerfeatures[i];
            if(feature.get('probability')>threshold){
              features.push(feature);
            }
          }
          layer.getSource().clear();
          layer.getSource().addFeatures(features);
        }
      });
    }

    $scope.loadHeatmapLayer = function(records) {
      console.log("loading heatmap "+records.length);
      var mapLayers = $scope.geoLocMap.getLayers().getArray();
      mapLayers.forEach(function (layer, i) {
        if (layer instanceof ol.layer.Heatmap) {
          var features= [];
          for (var i=0; i< records.length; i++){
            var coord = ol.proj.transform([parseFloat(records[i].longitude), parseFloat(records[i].latitude)], 'EPSG:4326', 'EPSG:3857');
            var pointonmap = new ol.Feature(new ol.geom.Point(coord));
            pointonmap.setId(records[i].accession);
            features.push(pointonmap);
          }
          var heatmapSource = new ol.source.Vector({
            features: features
          });
          layer.setSource(heatmapSource);
          layer.setRadius(5);
          layer.setBlur(15);
          $scope.showHeatmap=true;
        }
      });
    };

    $scope.highlightLocation = function(record) {
      console.log("record highlighted "+$scope.printObject(record));
      var features = [];
      var center = [0,0];
      if(record.possibleLocations.length>0){
        console.log("Got some " + record.possibleLocations.length);
        var maxProb = 0;
        for(var i=0; i<record.possibleLocations.length;i++){
          var posLoc = record.possibleLocations[i];
          var coord = ol.proj.transform([parseFloat(posLoc.longitude), parseFloat(posLoc.latitude)], 'EPSG:4326', 'EPSG:3857');
          var pointonmap = new ol.Feature(new ol.geom.Point(coord));
          console.log(i+"\t--------"+$scope.printObject(posLoc));
          pointonmap.set('name',posLoc.location);
          pointonmap.set('accession',record.accession);
          pointonmap.set('probability',posLoc.probability);
          features.push(pointonmap);
          if(posLoc.probability>maxProb){
            center = coord; maxProb = posLoc.probability;
          }
        }
        $('#probThreshold').show();
        $('#probThrVal').show();
      } else {
        var coord = ol.proj.transform([parseFloat(record.longitude), parseFloat(record.latitude)], 'EPSG:4326', 'EPSG:3857');
        var pointonmap = new ol.Feature(new ol.geom.Point(coord));
        pointonmap.set('name',record.location);
        pointonmap.set('accession',record.accession);
        features.push(pointonmap);
        center = coord;
        $('#probThreshold').hide();
        $('#probThrVal').hide();
      }
      $scope.viewLayerfeatures = features;
      var mapLayers = $scope.geoLocMap.getLayers().getArray();
      mapLayers.forEach(function (layer, i) {
        if (layer.get('zodolayer')=='view'){
          console.log("updating view layer");
          layer.getSource().clear();
          layer.getSource().addFeatures(features);
          $scope.geoLocMap.getView().setCenter(center);
          //$scope.geoLocMap.getView().setZoom(3);
        }
      });
    };

    function setTooltip(info) {
      info.tooltip({animation: false, trigger: 'manual'});
      var displayFeatureInfo = function(pixel) {
        var feature = $scope.geoLocMap.forEachFeatureAtPixel(pixel, function(feature) {
          return feature;
        });
        if (feature && feature.get('accession')) {
          var leftpos = $scope.geoLocMap.getTargetElement().getBoundingClientRect().left;
          var toppos = $scope.geoLocMap.getTargetElement().getBoundingClientRect().top;
          info.css({
            left: (pixel[0]) + 'px',
            top: (toppos + pixel[1] - 110) + 'px'
          });
          var displayText = feature.get('accession') + '\n' + feature.get('name');
          if(feature.get('probability')){
            displayText += '\n' + (parseFloat(feature.get('probability'))*100).toFixed(2) + '%';
          }
          info.tooltip('hide')
              .attr('data-original-title', displayText)
              .tooltip('fixTitle')
              .tooltip('show');
        } else {
          info.tooltip('hide');
        }
      };
      $scope.geoLocMap.on('pointermove', function(evt) {
        if (evt.dragging) {
          info.tooltip('hide');
          return;
        }
        displayFeatureInfo($scope.geoLocMap.getEventPixel(evt.originalEvent));
      });
      $scope.geoLocMap.on('click', function(evt) {
        displayFeatureInfo(evt.pixel);
      });
    }

    $scope.updateSelections = function(record, add) {
      console.log("record selected " + record.accession + " " + add);
      var mapLayers = $scope.geoLocMap.getLayers().getArray();
      mapLayers.forEach(function (layer, i) {
        if (layer.get('zodolayer')=='selection'){
          console.log("updating selection layer");
          if(add){
            var coord = ol.proj.transform([parseFloat(record.longitude), parseFloat(record.latitude)], 'EPSG:4326', 'EPSG:3857');
            var pointonmap = new ol.Feature(new ol.geom.Point(coord));
            console.log('name: '+record.location);
            pointonmap.setId(record.accession);
            pointonmap.set('name',record.location);
            pointonmap.set('accession',record.accession);
            layer.getSource().addFeature(pointonmap);
            $scope.geoLocMap.getView().setCenter(coord);
          } else {
            layer.getSource().removeFeature(layer.getSource().getFeatureById(record.accession)); 
          }
        }
      });
    };
  
    $scope.updateAllSelections = function(records, add) {
      console.log("records selected " + records.length + " " + add);
      var mapLayers = $scope.geoLocMap.getLayers().getArray();
      mapLayers.forEach(function (layer, i) {
        if (layer.get('zodolayer')==='selection'){
          if(add){
            var features = [];
            for(var j=0; j<records.length; j++){
              var record = records[j];
              if(record.latitude!='Unknown' && record.longitude!='Unknown'){
                var longitude = parseFloat(record.longitude);
                var latitude = parseFloat(record.latitude);
                if(isNaN(longitude)||isNaN(longitude)||longitude<-180||longitude>180||latitude<-90||latitude>90)
                  console.log('Ignoring ' + record.accession + ' = ' + record.longitude + ' : ' + record.latitude);
                var coord = ol.proj.transform([parseFloat(record.longitude), parseFloat(record.latitude)], 'EPSG:4326', 'EPSG:3857');
                var pointonmap = new ol.Feature(new ol.geom.Point(coord));
                pointonmap.setId(record.accession);
                pointonmap.set('name',record.location);
                pointonmap.set('accession',record.accession);
                features.push(pointonmap);
              } else {
                console.log("No coordinates found for " + record.accession);
              }
            }
            // var vectorSource = new ol.source.Vector({features: features});
            // layer.setSource(vectorSource); 
            layer.getSource().clear(); 
            layer.getSource().addFeatures(features);
          } else {
            layer.getSource().clear(); 
          }
          console.log("Done");
        }
      });
    };  

    $scope.printObject = function(object) {
      var output = '';
      for (var property in object) {
        output += property + ': ' + object[property]+'; ';
      }
      console.log(output);
    };

    $scope.toggleHeatmap = function() {
      console.log("Show Heatmap : " + $scope.showHeatmap);
      var mapLayers = $scope.geoLocMap.getLayers().getArray();
      mapLayers.forEach(function (layer, i) {
        if (layer instanceof ol.layer.Heatmap) {
          layer.setVisible($scope.showHeatmap);
        }
      });
    };
    //--- Map content ends ---//
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
