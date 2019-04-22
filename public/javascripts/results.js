'use strict';

angular.module('ZooPhy').controller('resultsController', function ($scope, $http, RecordData) {

  $scope.pageNums = [25, 50, 100, 250, 500];
  $scope.groupIsSelected = false;
  $scope.numSelected = RecordData.getNumSelected();
  $scope.results = RecordData.getRecords();
  $scope.selectedRecord = null;
  $scope.downloadLink = null;
  $scope.generating = false;
  $scope.uploading = false;
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
  $scope.geoLocMap = null;
  $scope.viewLayerfeatures = [];
  $scope.accessionFile = null;
  $scope.accessionFileName = 'none';
  $scope.accessionUploadError = null;
  $scope.hideable_success = null;
  $scope.filterSubmitButton = false;
  $scope.searchQuery = null;
  $scope.canPlotLocation = true;
  $scope.showTips = true;
  $scope.distinctLocationsCountSelected = 0;
  $scope.completeRecordsCountSelected = 0;
  $scope.incompleteDateCountSelected = 0;
  $scope.onlyCountryInfoSelected = 0;
  $scope.missingHostCountSelected = 0;
  $scope.missingLocationCountSelected = 0;
  $scope.onlyYearUNdateSelected = 0;
  $scope.missingDateUNdateSelected = 0;
  $scope.missingDateSelected = 0;
  $scope.missingDateCount = 0;
  $scope.missingHostCount = 0;
  $scope.missingStateCount = 0;
  $scope.missingCountryCount = 0;
  $scope.moreStats = false;
  $scope.hideCharts = true;
  $scope.selectedStat = 'location';

  const SOURCE_GENBANK = 1;
  const SOURCE_FASTA = 2;
  const MAX_COLUMNS = 11;
  var FASTA_FILE_RE = /^([\w\s-\(\)]){1,250}?\.(txt|fasta)$/;
  var ACCESSION_FILE_RE = /^(\w|-|\.){1,250}?\.txt$/;
  var allRecords;
  var filteredRecords;
  var availableThumbnails = ['9606','9823','9913','9615','9641','9685','9793','9796','420550'];

  var XYchart = null;
  var PieChart = null;

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
      $scope.sampleAmount = 20;
      if(!RecordData.isFilter()){
        allRecords = RecordData.getRecords();
        $(".filterCheckBoxClass").prop('checked', false);
        $("#filerAllCheckBox").prop('checked', false);
        $scope.filterSubmitButton = false;
        filteredRecords = null;
        $scope.searchQuery = null;
      }
      if ($scope.results.length > 0) {
        $scope.searchedVirusName = $scope.results[0].virus;
        $scope.clearLayerFeatures();
        $scope.loadHeatmapLayer($scope.results);
        $scope.LoadDetails($scope.results[0]);
        $('#probThreshold').val(0);
        $('#probThrVal').text("0%");
        $scope.percentOfRecords = String(Math.floor($scope.results.length*($scope.sampleAmount/100.0)));
      }else{
        $scope.clearLayerFeatures();
        $scope.showDetails = false;
        $scope.percentOfRecords = 0;
      }
      if(RecordData.getMessage()!=null){
        $scope.hideable_success = "show";
        document.getElementById("success_message").innerHTML = RecordData.getMessage();
      }else{
        $scope.hideable_success = null;
      }
      $scope.groupIsSelected = false;
      $scope.numSelected = 0;
      RecordData.setNumSelected($scope.numSelected);
      $scope.downloadLink = null;
      $scope.generating = false;
      $scope.uploading = false;
      $scope.downloadFormat = "csv";
      $scope.warning = null;
      $scope.downloadError = null;
      $scope.sampleType = 'percent';
      $scope.combineResults = 'false';
      $scope.fastaFilename = 'none';
      $scope.fastaFile = null;
      $scope.fastaError = null;
      $scope.completeRecordsCountSelected = 0;
      $scope.distinctLocationsCountSelected = 0;
      $scope.incompleteDateCountSelected = 0;
      $scope.onlyCountryInfoSelected = 0;
      $scope.missingHostCountSelected = 0;
      $scope.missingLocationCountSelected = 0;
      $scope.onlyYearUNdateSelected = 0;
      $scope.missingDateUNdateSelected = 0;
      $scope.missingDateSelected = 0;
      $scope.missingDateCount = 0;
      $scope.missingHostCount = 0;
      $scope.missingStateCount = 0;
      $scope.missingCountryCount = 0;
      $scope.accessionFile = null;
      $scope.accessionFileName = 'none';
      $scope.accessionUploadError = null;
      $scope.moreStats = false;
      $scope.hideCharts = true;
      $scope.selectedStat = 'location';
      $('#more_stats').collapse('hide');
      $scope.allRecordStats();
      $scope.loadPieChart();
      $scope.loadXYChart();
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
      $scope.highlightLocation($scope.selectedRecord);
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
    $scope.selectedRecordStats();
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
    $scope.selectedRecordStats();
  };


  $scope.selectedRecordStats = function(){
    var locationMap = new Map();
    $scope.completeRecordsCountSelected = 0;
    $scope.incompleteDateCountSelected = 0;
    $scope.onlyCountryInfoSelected = 0;
    $scope.missingHostCountSelected = 0;
    $scope.missingLocationCountSelected = 0;
    $scope.onlyYearUNdateSelected = 0;
    $scope.missingDateUNdateSelected = 0;
    $scope.missingDateSelected = 0;
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
      }if(record.includeInJob && record.date !== "Unknown" && record.country !== "Unknown" ){
        $scope.completeRecordsCountSelected++;
      }if(record.includeInJob && !record.isCompleteDate){
        $scope.incompleteDateCountSelected++;
      }if(record.includeInJob && record.state == "Unknown"){
        $scope.onlyCountryInfoSelected++;
      }if(record.includeInJob && record.host == "Unknown"){
        $scope.missingHostCountSelected++;
      }if(record.includeInJob && record.country == "Unknown" && record.state == "Unknown"){
        $scope.missingLocationCountSelected++;
      }if(record.includeInJob){
        var splitDate = record.unNormalizedDate.split('-');
        if(record.unNormalizedDate == "Unknown"){
          $scope.missingDateSelected++;
        }else if(splitDate.length == 2){
          $scope.missingDateUNdateSelected++;
        }else if(splitDate.length == 1){
          $scope.onlyYearUNdateSelected++;
        }
      }
    }
    $scope.distinctLocationsCountSelected = locationMap.size;
    if(RecordData.getNumSelected() > 0){
      $scope.hideCharts = false;
      $scope.updateXYChartData();
      $scope.updatePieChartData($scope.selectedStat, false);
    }else{
      $scope.hideCharts = true;
    }
  }

  $scope.allRecordStats = function(){
    $scope.missingDateCount = 0;
    $scope.missingHostCount = 0;
    $scope.missingStateCount = 0;
    $scope.missingCountryCount = 0;
    for (var i = 0; i < $scope.results.length; i++) {
      var record = $scope.results[i];
      if(record.date === "Unknown" || !record.isCompleteDate){
        $scope.missingDateCount++;
      }
      if(record.host === "Unknown"){
        $scope.missingHostCount++;
      }
      if(record.state === "Unknown"){
        $scope.missingStateCount++;
      }
      if(record.country === "Unknown"){
        $scope.missingCountryCount++;
      }
    }
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
            if($scope.results[i].resourceSource === SOURCE_GENBANK){
              var downloadRecord = {
                id:$scope.results[i].accession,
                resourceSource:$scope.results[i].resourceSource
              }
            }else if($scope.results[i].resourceSource === SOURCE_FASTA){
              var downloadRecord = {
                id:$scope.results[i].accession,
                collectionDate:$scope.results[i].date,
                geonameID:$scope.results[i].geonameid,
                rawSequence:$scope.results[i].sequence,
                resourceSource:$scope.results[i].resourceSource
              }
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
          if(response.status === 413){
            $scope.downloadError = 'Too many records selected';
          }else{
            $scope.downloadError = 'Error generating download';
          }
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
        $scope.updateSelections($scope.results[i],true);
      }
      else {
        $scope.results[i].includeInJob = false;
        $scope.updateSelections($scope.results[i],false);
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
        $scope.uploading = true;
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
          var message = '<b>Successfully added '+ response.data.records.length+' records! </b>'
          if (response.data.invalidRecords.length > 0) {
            message += response.data.invalidRecords
          }
          $scope.groupIsSelected = false;
          RecordData.setMessage(message);
          $scope.toggleAll();
          RecordData.setFilter(false);
          RecordData.incrementSearchCount();
        }, function(error) {
          $scope.uploading = false;
          if(error.status === 413){
            $scope.fadeableErrorAlert('Payload Error: Too many records selected.');
          }
          else if (error.status !== 500) {
            $scope.fadeableErrorAlert(error.data.error);
          }
          else {
            $scope.fadeableErrorAlert('Parsing Failed on Server. Please refresh and try again.');
          }
        });
      }
      else {
        $scope.fadeableErrorAlert('No FASTA File Selected');
      }
    };

    $scope.showFastaHelp = function() {
      BootstrapDialog.show({
        title: 'FASTA Upload Help',
        message: 'The FILE file needs to have a metadata line preceded by the > symbol. It should be followed by a new line and the sequence string. The current file size limit is 10mb.'
      });
    };

    $scope.uploadAccessions = function(rawFile) {
      $scope.accessionUploadError = null;
      var newFile = rawFile[0];
      if (newFile && newFile.size < 4000000) { //4MB
        var filename = newFile.name.trim();
        if (ACCESSION_FILE_RE.test(filename)) {
          $scope.accessionFile = newFile;
          $scope.accessionFileName = String(filename).trim();
        }
        else {
          $scope.accessionUploadError = 'Invalid File Name. Must be .txt file.';
        }
      }
      else {
        $scope.accessionUploadError = 'Invalid File Size. Limit is 5kb.';
      }
      $scope.$apply();
    };

    $scope.sendAccessions = function() {
      $scope.accessionUploadError = null;
      if ($scope.accessionFile) {
        var form = new FormData();
        var uri = SERVER_URI+'/upload';
        form.append('accessionFile', $scope.accessionFile);
        $http.post(uri, form, {
            headers: {'Content-Type': undefined}
        }).then(function (response) {
          RecordData.setRecords(response.data.records);
          if (response.data.records.length > 0) {
            $scope.fadeableSuccessAlert('Successfully added '+ response.data.records.length+' records')
          }
          else {
            $scope.fadeableErrorAlert('Search returned 0 results.')
          }
          RecordData.setFilter(false);
          RecordData.setMessage(null);
          RecordData.incrementSearchCount();
        }, function(error) {
          if(error.status === 413){
            $scope.fadeableErrorAlert('Payload Error: Too many records selected.');
          }
          else if (error.status !== 500) {
            $scope.fadeableErrorAlert(error.data.error);
          }
          else {
            $scope.fadeableErrorAlert('Search Failed on Server. Please refresh and try again.');
          }
        });
      }
      else {
        $scope.fadeableErrorAlert('No Accession File Selected');
      }
    };

    $scope.showAccessionUploadHelp = function() {
      BootstrapDialog.show({
        title: 'Accession Upload Help',
        message: 'The Accession file needs to be a new line delimited .txt file containing 1 Accession per line. The current search limit is 2500 Accessions.'
      });
    };

    $scope.updatePercentOfRecords = function() {
      $scope.percentOfRecords = String(Math.floor($scope.results.length*($scope.sampleAmount/100.0)));
    };

    $scope.toggleFilter = function(type){
      if(type!=null && type === 'ALL'){
        if($("#filerAllCheckBox").prop('checked')){
          $(".filterCheckBoxClass").prop('checked', true);
          $scope.filterSubmitButton = true;
        }else{
          $(".filterCheckBoxClass").prop('checked', false);
          $scope.filterSubmitButton = false;
        }
      }else{
        if ($('.filterCheckBoxClass:checked').length == $('.filterCheckBoxClass').length ){
          $("#filerAllCheckBox").prop('checked', true);
        }else{
          $("#filerAllCheckBox").prop('checked', false);
        }
        if($('.filterCheckBoxClass:checked').length > 0){
          $scope.filterSubmitButton = true;
        }else{
          $scope.filterSubmitButton = false;
        }
      }
    }

    $scope.fadeableSuccessAlert = function(message){
      $('<div class="alert alert-success col-md-10 col-md-offset-1 text-center"> <b>'+message+'</b></div>').insertBefore('#warning-alert').delay(3000).fadeOut();  
    }

    $scope.fadeableErrorAlert = function(message){
      $('<div class="alert alert-danger col-md-10 col-md-offset-1 text-center"> <b> <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>  '+message+'</b></div>').insertBefore('#warning-alert').delay(3000).fadeOut();  
    }

    $scope.filterRecords = function(){
      filteredRecords = [];
      var filterMissingDate = $("input[value='Missing_Date']").prop('checked');
      var filterCountry = $("input[value='Country']").prop('checked');
      var filterState = $("input[value='State']").prop('checked');
      var filterGene = $("input[value='Gene']").prop('checked');
      var filterHost = $("input[value='Host']").prop('checked');
      var count =0;
      if(allRecords!=null){
        for (var i = 0; i < allRecords.length; i++) {
          var record = allRecords[i];
          if((filterMissingDate && (record.date === "Unknown" || !record.isCompleteDate)) || (filterCountry && record.country === "Unknown")
            || (filterState && record.state === "Unknown") || (filterGene && record.gene === "None") ||
            (filterHost && record.host === "Unknown")){
            //ignore
            count++;
          }else{
            filteredRecords.push(record);
          }
        }
      }
      if(count > 0){
        RecordData.setFilter(true);
        $scope.fadeableSuccessAlert("Successfully removed "+count+" incomplete records!")
        RecordData.setRecords(filteredRecords);
        $scope.groupIsSelected = false;
        $scope.toggleAll();
        RecordData.setMessage(null);
        RecordData.incrementSearchCount();
        $scope.searchQuery = null;
      }
      else{
        $scope.fadeableSuccessAlert("0 incomplete records!")
      }
    }

    $scope.filterReset = function(){
      $(".filterCheckBoxClass").prop('checked', false);
      $("#filerAllCheckBox").prop('checked', false);
      if(allRecords!=null && allRecords.length > 0){
        RecordData.setFilter(false);
        RecordData.setRecords(allRecords);
        $scope.groupIsSelected = false;
        $scope.toggleAll();
        RecordData.setMessage(null);
        RecordData.incrementSearchCount();
        filteredRecords = null;
      }
    }

    $scope.searchBarResult = function(){
      $("#basic-addon1").tooltip('hide');
      var records = [];
      var searchResult = [];
      if(RecordData.isFilter() && filteredRecords!=null){
        records = filteredRecords;
      }else{
        records = allRecords;
      }
      if(records!=null && $scope.searchQuery!=null){
        for (var i = 0; i < records.length; i++) {
          var record = records[i];
          if(record.state.toLowerCase().indexOf($scope.searchQuery.toLowerCase()) >= 0 || 
          record.country.toLowerCase().indexOf($scope.searchQuery.toLowerCase()) >= 0 ||
          record.accession.toLowerCase().indexOf($scope.searchQuery.toLowerCase()) >= 0 ||
          record.host.toLowerCase().indexOf($scope.searchQuery.toLowerCase()) >= 0){
            searchResult.push(record);
          }
        }
        RecordData.setRecords(searchResult);
        RecordData.setFilter(true);
        $scope.groupIsSelected = false;
        $scope.toggleAll();
        RecordData.setMessage(null);
        RecordData.incrementSearchCount();
      }
    }

    $('.dropdown-toggle').click(function(e) {
      e.preventDefault();
      var url = $(this).attr('href');
      if (url !== '#') {
        window.location.href = url;
      }
    });

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
        $scope.downloadColumnsCount += selected.length;
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
        $scope.downloadColumnsCount -= selected.length;
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
      $('#toSelectBox option').each(function(i, option){
        downloadColumns[i] = $(option).val();
      });
      $scope.setupDownload(downloadColumns);
    };

    $scope.toggleTips = function(){
      if($scope.showTips){
        $scope.showTips = false;
      }else{
        $scope.showTips = true;
      }
    };

    $scope.selectTip = function(number){
      $(window).scrollTop(0);
      switch(number){
        case 1: //filter
          $('#filterModel').modal('show'); 
          break;
        case 2: //search
          $("#basic-addon1").tooltip("show");
          $("#nav-searchbar").focus();
          break;
        case 3: //import
          //$("#nav_import").toggle()
          $('#fastaModel').modal('show'); 
          break;
      }
    }

    //-- Charts content starts --//

  $scope.updatePieChartData = function(type, toggle){
    if(toggle){
      $scope.moreStats = true;
      $('#more_stats').collapse('show');
    }
    $scope.selectedStat = type
    var data = [];
    if(type == 'host'){
      if($scope.missingHostCountSelected != 0){
        data.push({
          stat: "Records missing Host",
          count: $scope.missingHostCountSelected
        })
      }
      if($scope.numSelected - $scope.missingHostCountSelected !=0){
        data.push({
          stat: "Records with Host",
          count: $scope.numSelected - $scope.missingHostCountSelected
        })
      }
      PieChart.data = data;
    }
    if(type == 'location'){
      if($scope.missingLocationCountSelected != 0){
        data.push({
          stat: "No location info available",
          count: $scope.missingLocationCountSelected
        })
      }
      if($scope.onlyCountryInfoSelected != 0){
        data.push({
          stat: "Missing State info",
          count: $scope.onlyCountryInfoSelected
        })
      }
      if($scope.numSelected - $scope.onlyCountryInfoSelected - $scope.missingLocationCountSelected != 0){
        data.push({
          stat: "Complete Location info",
          count: $scope.numSelected - $scope.onlyCountryInfoSelected - $scope.missingLocationCountSelected
        })
      }
      PieChart.data = data;
    }
    if(type == 'date'){
      if($scope.onlyYearUNdateSelected != 0){
        data.push({
          stat: "Only Year",
          count: $scope.onlyYearUNdateSelected
        })
      }
      if($scope.missingDateUNdateSelected != 0){
        data.push({
          stat: "Month and year",
          count: $scope.missingDateUNdateSelected
        })
      }
      if($scope.missingDateSelected != 0){
        data.push({
          stat: "Missing Date",
          count: $scope.missingDateSelected
        })
      }
      if($scope.numSelected - $scope.onlyYearUNdateSelected - $scope.missingDateUNdateSelected - $scope.missingDateSelected != 0){
        data.push({
          stat: "Complete Date",
          count: $scope.numSelected - $scope.onlyYearUNdateSelected - $scope.missingDateUNdateSelected - $scope.missingDateSelected
        })
      }
      PieChart.data = data
    }
  }

  $scope.updateXYChartData = function(){
    XYchart.data = [{
      "stat": "Selected Records",
      "count": $scope.numSelected
    },{
      "stat": "Complete Records",
      "count": $scope.completeRecordsCountSelected
    },{
      "stat": "Distinct Locations",
      "count": $scope.distinctLocationsCountSelected
    },{
      "stat": "Country Level",
      "count": $scope.onlyCountryInfoSelected
    }];
  }

  $scope.loadXYChart = function(){
    if(XYchart != null){
      //$scope.updateXYChartData();
    }else{
      //am4core.useTheme(am4themes_animated);
      XYchart = am4core.create("chartXYdiv", am4charts.XYChart);
  
      XYchart.data = [{
        "stat": "Selected Records",
        "count": 10
      }, {
        "stat": "Complete Records",
        "count": 2
      }, {
        "stat": "Distinct Locations",
        "count": 5
      }, {
        "stat": "Country Level",
        "count": 5
      }];
      
      var categoryAxis = XYchart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "stat";
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 30;

      categoryAxis.renderer.labels.template.tooltipText = "{category}";
      categoryAxis.tooltip.label.wrap = true
      categoryAxis.tooltip.label.adapter.add("textOutput", function(text) {
        if(text == 'Complete Records'){
          return "Records that are not missing date and location information"
        }
        if(text == 'Distinct Locations'){
          return "This is an approximate count of number of distinct locations among the selected records." 
          + " Actual count might vary once the job is run. Select at least 2 and up to 25 distinct locations" 
          + " for the job to run successfully."
        }
        if(text == 'Country Level'){
          return "Records with country level location information only. For better results select records"
          + " with atleast state information."
        }
        return text;
      });

      categoryAxis.renderer.labels.template.tooltipPosition = "pointer";
  
      categoryAxis.renderer.labels.template.adapter.add("dy", function(dy, target) {
        if (target.dataItem && target.dataItem.index & 2 == 2) {
          return dy + 25;
        }
        return dy;
      });
      var valueAxis = XYchart.yAxes.push(new am4charts.ValueAxis());
      // Create series
      var series = XYchart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = "count";
      series.dataFields.categoryX = "stat";
      series.name = "count";
      series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
      series.columns.template.fillOpacity = .8;
  
      var columnTemplate = series.columns.template;
      columnTemplate.strokeWidth = 2;
      columnTemplate.strokeOpacity = 1;
    }
  }

  $scope.loadPieChart = function(){
    if(PieChart != null){
      //$scope.updatePieChartData();
    }else{
      am4core.useTheme(am4themes_material);
      am4core.useTheme(am4themes_animated);

      PieChart = am4core.create("chartPiediv", am4charts.PieChart3D);
      PieChart.hiddenState.properties.opacity = 0; // this creates initial fade-in
      PieChart.radius = am4core.percent(80);
      PieChart.innerRadius = am4core.percent(40);

      PieChart.data = [{
        stat: "Complete Location info",
        count: 10
      },{
        stat: "No location info available",
        count: 2
      },{
        stat: "Missing State info",
        count: 5
      }]

      var series = PieChart.series.push(new am4charts.PieSeries3D());
      series.labels.template.text = "{category} ({value})";

      series.labels.template.tooltipText = "{category}";
      series.tooltip.label.wrap = true
      series.tooltip.label.adapter.add("textOutput", function(text) {
        if(text == 'Only Year'){
          return "Records with only year in GenBank"
        }
        if(text == 'Month and year'){
          return "Records with only month and year in GenBank" 
        }
        if(text == 'Missing Date'){
          return "Records missing date information in GenBank"
        }
        if(text == 'Complete Date'){
          return "Records complete date information in GenBank"
        }
        return text;
      });

      series.labels.template.tooltipPosition = "pointer";

      series.labels.template.wrap = true;
      series.labels.template.maxWidth = 100;
      series.colors.list = [
        am4core.color("#845EC2"),
        am4core.color("#D65DB1"),
        am4core.color("#FF6F91"),
        am4core.color("#FF9671"),
        am4core.color("#FFC75F"),
        am4core.color("#F9F871"),
      ];
      series.dataFields.value = "count";
      series.dataFields.category = "stat";
    }
  }

    //-- Charts content ends --//
    
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
  
      // selection layer
      var featureStyle = new ol.style.Style({
        text: new ol.style.Text({
          text: '\uf041',
          font: 'normal 22px FontAwesome',
          textBaseline: 'bottom',
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
      $('#probThreshold').hide();
      $('#probThrVal').hide();
  
      // Put all layers together in the map
      $scope.geoLocMap = new ol.Map({
        layers: [raster, heatmapLayer, selectionLayer],
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

    $scope.removeLayerMap = function(host){
      var isSameHost = null;
      var layerToRemove = null;
      $scope.geoLocMap.getLayers().forEach(function (layer) {
        if (layer.get('zodolayer') != undefined && layer.get('zodolayer') === 'view') {
          layerToRemove = layer;
          if (layer.get('host') != undefined && layer.get('host') == host) {
            isSameHost = true;
          }
        }
      });
      if(isSameHost){
        return false;
      }else{
        if(layerToRemove){
          $scope.geoLocMap.removeLayer(layerToRemove);
        }
        return true;
      }
    }

    $scope.addLayerToMap = function(host) {
      console.log("host",host)
      // highlight layer
      var featureStyle = new ol.style.Style({
        text: new ol.style.Text({
          text: '\uf041',
          font: 'normal 20px FontAwesome',
          textBaseline: 'bottom',
          fill: new ol.style.Fill({
            color: 'black'
          })
        })
      });
      if(host != 'Unknown' && availableThumbnails.includes(host)){
        featureStyle = new ol.style.Style({ 
          image: new ol.style.Icon ({ 
            scale:'0.4', 
            src: 'images/host/'+host+'.png' 
          }) 
        });
      }
      var vectorSource = new ol.source.Vector({features: []});
      var highlightLayer = new ol.layer.Vector({
        source: vectorSource,
        style: [featureStyle]
      })
      highlightLayer.set('host', host);
      highlightLayer.set('zodolayer','view');
      var addNewLayer = $scope.removeLayerMap(host);
      if(addNewLayer){
        $scope.geoLocMap.addLayer(highlightLayer);
      }
    }

    $scope.clearLayerFeatures = function() {
      // console.log("clearing features");
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
      console.log("loading heatmap with "+records.length+ " records");
      var mapLayers = $scope.geoLocMap.getLayers().getArray();
      mapLayers.forEach(function (layer, i) {
        if (layer instanceof ol.layer.Heatmap) {
          var features= [];
          var count = 0
          for (var i=0; i< records.length; i++){
            var record = records[i]
            var longitude = parseFloat(record.longitude);
            var latitude = parseFloat(record.latitude);
            if(record.location=="unknown"||record.location=="Unknown"||isNaN(longitude)||isNaN(latitude)||
               longitude<-180||longitude>180||latitude<-90||latitude>90){
              // ignore such records
              count += 1
              // console.log("Ignoring:"+record.location+":"+longitude+":"+longitude)
            } else {
              var coord = ol.proj.transform([parseFloat(record.longitude),
                                             parseFloat(record.latitude)],
                                             'EPSG:4326', 'EPSG:3857');
              var pointonmap = new ol.Feature(new ol.geom.Point(coord));
              pointonmap.setId(record.accession);
              features.push(pointonmap);
            }
          }
          console.log(count+" records from " + records.length + " ignored")
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
      $scope.addLayerToMap(record.hostId);
      var features = [];
      var center = [0,0];
      var longitude = parseFloat(record.longitude);
      var latitude = parseFloat(record.latitude);
      if(record.location=="unknown"||record.location=="Unknown"||isNaN(longitude)||isNaN(longitude)||
              longitude<-180||longitude>180||latitude<-90||latitude>90){
                console.log("Missing location info for highlighted record");
                $scope.canPlotLocation = false;
                var mapLayers = $scope.geoLocMap.getLayers().getArray();
                mapLayers.forEach(function (layer, i) {
                if (layer.get('zodolayer')=='view'){
                  layer.getSource().clear();
                }
              });
      }else{
        $scope.canPlotLocation = true;
        var coord = ol.proj.transform([parseFloat(record.longitude), parseFloat(record.latitude)], 'EPSG:4326', 'EPSG:3857');
        var pointonmap = new ol.Feature(new ol.geom.Point(coord));
        pointonmap.set('name',record.location);
        pointonmap.set('accession',record.accession);
        features.push(pointonmap);
        center = coord;
        $scope.viewLayerfeatures = features;
        var mapLayers = $scope.geoLocMap.getLayers().getArray();
        mapLayers.forEach(function (layer, i) {
          if (layer.get('zodolayer')=='view'){
            // console.log("updating view layer");
            layer.getSource().clear();
            layer.getSource().addFeatures(features);
            // $scope.geoLocMap.getView().setCenter(center);
            $scope.geoLocMap.getView().animate({
              center: center,
              duration: 1000
            });
            //$scope.geoLocMap.getView().setZoom(3);
          }
        });
      }
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
      var mapLayers = $scope.geoLocMap.getLayers().getArray();
      mapLayers.forEach(function (layer, i) {
        if (layer.get('zodolayer')=='selection'){
         // console.log("updating selection layer");
          if(add){
            var longitude = parseFloat(record.longitude);
            var latitude = parseFloat(record.latitude);
            if(record.location=="unknown"||record.location=="Unknown"||isNaN(longitude)||isNaN(latitude)||
               longitude<-180||longitude>180||latitude<-90||latitude>90){
              //console.log("No coordinates found for " + record.accession);
            }else{
              console.log("record selected " + record.accession +", " +record.longitude+", " +record.latitude+ " " + add);
              var coord = ol.proj.transform([parseFloat(record.longitude), parseFloat(record.latitude)], 'EPSG:4326', 'EPSG:3857');
              var pointonmap = new ol.Feature(new ol.geom.Point(coord));
              console.log('name: '+record.location);
              pointonmap.setId(record.accession);
              pointonmap.set('name',record.location);
              pointonmap.set('accession',record.accession);
              layer.getSource().addFeature(pointonmap);
              $scope.geoLocMap.getView().setCenter(coord);
            }
          } else {
            if(layer.getSource().getFeatureById(record.accession))
              layer.getSource().removeFeature(layer.getSource().getFeatureById(record.accession)); 
          }
        }
      });
    };
  
    $scope.updateAllSelections = function(records, add) {
      // console.log("records selected " + records.length + " " + add);
      var mapLayers = $scope.geoLocMap.getLayers().getArray();
      mapLayers.forEach(function (layer, i) {
        if (layer.get('zodolayer')==='selection'){
          if(add){
            var features = [];
            for(var j=0; j<records.length; j++){
              var record = records[j];
              var longitude = parseFloat(record.longitude);
              var latitude = parseFloat(record.latitude);
              if(record.location=="unknown"||record.location=="Unknown"||isNaN(longitude)||isNaN(latitude)||
                 longitude<-180||longitude>180||latitude<-90||latitude>90){
                // console.log("No coordinates found for " + record.accession);
              }else{
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
              }
            }
            // var vectorSource = new ol.source.Vector({features: features});
            // layer.setSource(vectorSource); 
            layer.getSource().clear(); 
            layer.getSource().addFeatures(features);
          } else {
            layer.getSource().clear(); 
          }
          // console.log("Done");
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
