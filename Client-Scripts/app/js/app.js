angular.module('ui.bootstrap.demo', ['ui.bootstrap']);
angular.module('ui.bootstrap.demo').controller('ModalDemoCtrl', function ($scope, $modal, $log) {

  
  $scope.open = function (template, size) {

    var modalInstance = $modal.open({
      templateUrl: template,
      controller: 'ModalInstanceCtrl',
      size: size,
          });
    // Got rid of resolve (re:items) not sure what it could be used for in future

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.


