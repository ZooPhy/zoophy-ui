'use strict';

angular.module('ZooPhy').controller('homeController', function ($scope) {

  $scope.tab = 'search';

  $scope.switchTabs = function(tab) {
    $scope.tab = tab;
  };

});
