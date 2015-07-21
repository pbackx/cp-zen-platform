 'use strict';

function cdBadgesDashboardCtrl($scope, cdBadgesService, utilsService, alertService, $translate) {
  $scope.badges = {};
  $scope.badgeInfo = {};
  $scope.badgeInfoIsCollapsed = {};
  var lastClicked = {};

  cdBadgesService.listBadges(function (response) {
    var badges = response.badges;

    //Filter badges because badgekit api doesn't support querying by tags.
    cdBadgesService.loadBadgeCategories(function (response) {
      $scope.categories = response.categories;
      _.each($scope.categories, function (category) {
        _.each(badges, function (badge) {
          var indexFound;
          var categoryFound = _.find(badge.tags, function (tag, index) {
            indexFound = index;
            return tag.value === category;
          });

          if(categoryFound) {
            var tmpBadge = angular.copy(badge);
            tmpBadge.tags.splice(indexFound, 1);
            if(!$scope.badges[category]) $scope.badges[category] = {};
            _.each(tmpBadge.tags, function (tag) {
              if(!$scope.badges[category][tag.value]) $scope.badges[category][tag.value] = [];
              $scope.badges[category][tag.value].push(badge);
            });
          }
        });
      });
    });
  });

  $scope.capitalizeFirstLetter = utilsService.capitalizeFirstLetter;

  $scope.showBadgeInfo = function (tag, badge) {
    if(lastClicked[tag] !== badge.id && $scope.badgeInfoIsCollapsed[tag]) {
      $scope.badgeInfo[tag] = badge;
    } else {
      $scope.badgeInfo[tag] = badge;
      $scope.badgeInfoIsCollapsed[tag] = !$scope.badgeInfoIsCollapsed[tag];
    }
    lastClicked[tag] = badge.id;
  }

  $scope.categorySelected = function () {
    lastClicked = {};
    $scope.badgeInfoIsCollapsed = {};
  }

  $scope.previewBadge = function (badgeClaimNumber) {
    cdBadgesService.loadBadgeByCode(badgeClaimNumber, function (response) {
      if(response.error) return alertService.showError(response.error);
      if(_.isEmpty(response)) {
        $scope.hideBadgePreview();
        return alertService.showAlert($translate.instant('Invalid Badge Claim Number.'));
      }
      $scope.previewBadgeData = response.badge;
      $scope.showBadgePreview = true;
    });
  }

  $scope.hideBadgePreview = function () {
    $scope.badgeClaimNumber = '';
    $scope.previewBadgeForm.submitted = false;
    $scope.previewBadgeForm.$setPristine();
    $scope.previewBadgeData = {};
    $scope.showBadgePreview = false;
  }

  $scope.claimBadge = function () {
    cdBadgesService.claimBadge($scope.previewBadgeData, function (response) {
      $scope.hideBadgePreview();
      if(response.error) return alertService.showError(response.error);
      return alertService.showAlert($translate.instant('You have successfully claimed a badge. It is now visible on your profile page.'));
    });
  }
    
}

angular.module('cpZenPlatform')
  .controller('badges-dashboard-controller', ['$scope', 'cdBadgesService', 'utilsService', 'alertService', '$translate', cdBadgesDashboardCtrl]);