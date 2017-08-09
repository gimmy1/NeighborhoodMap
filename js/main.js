// Initialize the map
var map;
// initialize the infoWindows
var infoWindow;

// Set up the ViewModel
var ViewModel = function() {
    'use strict';

    var self = this;
    self.locations = ko.observableArray([]);
    // perform live update
    self.query = ko.observable('');
    self.ajaxError = ko.observable(false);
    // self.filterLocations = ko.observableArray([]);


    // Create the google map zoomed in on Denver
    self.initMap = function() {
        infoWindow = new google.maps.InfoWindow();
        var mapCanvas = document.getElementById('google-map');
        var cenLatLng = new google.maps.LatLng(40.7413549, -73.9980244);
        var mapOptions = {
            center: cenLatLng,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(mapCanvas, mapOptions);
    };

    // Create the list of brewery locations from the model
    self.createMarkers = function() {
        tribeca.forEach(function(location) {
            self.locations.push(new Location(location));
            // bounds.extend(marker.position);
        });
    };

    // Set up event listener
    self.openInfoWindow = function() {
        self.locations().forEach(function(location) {
            google.maps.event.addListener(location.marker(), 'click', function() {
                self.populateInfoWindow(location);
            });
        });
    };

    self.populateInfoWindow = function(marker) {
        infoWindow.marker = marker;
        infoWindow.setContent('<div>' + marker.title() + '<p id="four"></p></div>');
        self.getFourSquare(marker.lat(), marker.lng(), marker.marker());
        // infoWindow.open(map, marker.marker());

        map.panTo(new google.maps.LatLng(marker.lat(), marker.lng()));
        self.setAnimation(marker);
    };

    self.setAnimation = function(marker) {
        marker.marker().setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.marker().setAnimation(null);
        }, 1400);
    };

    // Search
    // Filter list
    self.filteredLocations = ko.computed(function() {
        var filter = self.query().toLowerCase();

        if (filter === null) {
            return self.locations();
        } else {
            return ko.utils.arrayFilter(self.locations(), function(item) {
                if (item.title().toLowerCase().indexOf(filter) !== -1) {
                    item.marker().setMap(map);
                    item.marker().setVisible(true);
                    return true;
                } else {
                    item.marker().setMap(null);
                    item.marker().setVisible(false);
                    return false;
                }
            });
        }
    });

    self.getFourSquare = function(loc1, loc2, marker) {
        var d = new Date();
        // var date = d.getFullYear().toString() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
        var date = '20170420';
        var clientId = 'XCPHQKTMT3N2NWZMWG2BCQ40GHHRD0LBBVZRU354ZVMEUZ25';
        // var clientId = 'XCPHQKTMT3N2NWZMWG2BCQ40GHHRD0LBBVZRU354ZVMEUZ2';
        var clientSecret = 'ZC53KE1SVSTOSKR2FPQXIMSGEXC3BVCZTRGBGRUGZZWXLJHE';
        var url = 'https://api.foursquare.com/v2/venues/search?ll=' + loc1 + ',' + loc2 + '&client_id=' + clientId + '&client_secret=' + clientSecret + '&v=' + date;

        // AJAX CALL
        var settings = {
            url: url,
            success: function(results) {
                // self.ajaxError(false);
                var four = results.response.venues[0].url;
                if (!four) {
                    four = 'Company does not have a website!';
                    infoWindow.setContent('<p>' + four + '</a>');
                    infoWindow.open(map, marker);
                } else {
                    infoWindow.setContent('<a href="' + four + '">' + four + '</a>');
                    infoWindow.open(map, marker);
                }
            },
            error: function(XMLHttpRequest, textResponse, errorThrown) {
                self.ajaxError(true);
            }
        };
        $.ajax(settings);
    };
};
// Constructor to create Tribeca markers
var Location = function(data) {
    'use strict';

    // Set all the properties as knockout observables
    var marker;
    this.title = ko.observable(data.title);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.id = ko.observable(data.id);


    var bounds = new google.maps.LatLngBounds();
    // Google Maps Marker for this location
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.lat(), this.lng()),
        map: map,
        title: this.title(),
        animation: google.maps.Animation.DROP
    });

    // Set the marker as a knockout observable
    this.marker = ko.observable(marker);
};

function googleMapsError() {
    alert("Failed to load Google Maps.");
}

function initialize() {
    viewModel = new ViewModel();

    viewModel.initMap();
    viewModel.createMarkers();
    viewModel.openInfoWindow();
    viewModel.filteredLocations();


    // Activate Knockout
    ko.applyBindings(viewModel);
}
