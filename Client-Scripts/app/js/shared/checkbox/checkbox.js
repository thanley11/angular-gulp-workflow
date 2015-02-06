angular.module('ui.bootstrap.demo').controller('checkBoxController', function ($scope, $http, $timeout) {

            $http.get('json/executables.json').success(function(data) {
                $scope.execs = data;
            }); 
            $http.get('json/prids.json').success(function(data) {
                $scope.prids= data;
            }); 
            $http.get('json/servers.json').success(function(data) {
                $scope.servers= data;
            });

     // Initial states
    $scope.isServerSelection = false;
    $scope.isServersToDeploy = false;
    $scope.disableButton = false;
    $scope.isLoader = false;
    $scope.isComplete= false; 

    // Sets ng-show to true, which reveals select boxes
    function startServerSelect(){
        $scope.isServerSelection = true;
    }

    $scope.selectedServers = [];

    // toggle selection for a given server by name
    
    function toggleSelection(serverName, serverNum, serverAlias) {
 
// Pass in variable of serverNum, which will allow you to return the "key" - key,
// So if key = "301", i.e serverNum, then you will grab the index of the object that "key" is in. 
// You specified the variables below, key, value, and alias.
// If it doesn't find a key, it will return '-1'

    pos = $scope.selectedServers.map(function(e) { return e.key; }).indexOf(serverNum);

   // need to check based on location of object in selectedServers array 
     // is currently selected
     if (pos > -1) {
       $scope.selectedServers.splice(pos, 1);
       checkServerCount();
     }

     // is newly selected
     else {
       $scope.selectedServers.push(
               {
                   key: serverNum,
                   value: serverName,
                   alias: serverAlias
               });
        checkServerCount();
        }
   }

    $scope.deploys=[]; 

    
    function collectDeployInfo(exec, prid){
        $scope.deploys.push(exec);
        $scope.deploys.push(prid);
        $scope.deploys.push($scope.selectedServers);
        
        console.log($scope.deploys);
    }

    function submitForm(isValid) {
        $scope.submitted = true;
        if (isValid && $scope.selectedServers.length > 0){
            collectDeployInfo($scope.exec.value, $scope.prid.value);
            $scope.disableButton = true;
            $scope.isLoader = true;
            $timeout(function(){
                $scope.isLoader = false;
                $scope.isComplete = true;
                }, 1000);
        }
        else{
            return;
        }
    }

    function checkServerCount(){
        if ($scope.selectedServers.length > 0){
               $scope.isServersToDeploy = true;
        }
        else{
            $scope.isServersToDeploy = false;
        }
    }

    $scope.startServerSelect = startServerSelect;
    $scope.toggleSelection = toggleSelection;
    $scope.collectDeployInfo = collectDeployInfo;
    $scope.submitForm = submitForm;
    $scope.checkServerCount = checkServerCount;
});
