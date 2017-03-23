angular.module('ZooPhy').controller('runController', function ($scope, RecordData) {

  $scope.numSelected = RecordData.getNumSelected();

});
