// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    window.user = JSON.parse(localStorage.getItem("user"));

  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.home', {
      url: '/home',
      views: {
        'tab-home': {
          templateUrl: 'templates/tab-home.html',
          controller: 'HomeCtrl'
        }
      }
    })

    .state('tab.observations', {
      url: '/observations',
      views: {
        'tab-observations': {
          templateUrl: 'templates/tab-observations.html',
          controller: 'ObservationsCtrl'
        }
      }
    })

    .state('tab.observation', {
      url: '/observation/:mobileObservationID',
      views: {
        'tab-observations': {
          templateUrl: 'templates/observation.html',
          controller: 'ObservationCtrl'
        }
      }
    })

    .state('tab.selectchildren', {
      url: '/selectchildren/:mobileObservationID',
      views: {
        'tab-observations': {
          templateUrl: 'templates/children.html',
          controller: 'ChildrenCtrl'
        }
      }
    })

    .state('tab.evidence', {
      url: '/evidence',
      views: {
        'tab-evidence': {
          templateUrl: 'templates/tab-evidence.html',
          controller: 'EvidenceCtrl'
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});

