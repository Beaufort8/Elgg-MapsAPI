define(function (require) {
    var elgg = require('elgg');
    var $ = require('jquery');
    require("amap_ma_oms_js");
    require("rangeslider");

	// Initialize rangeSlider
	var $element = $('input[type="range"]');
	var $output = $('#output');

    // Initialize map vars
    var map_settings = require("amap_maps_api/settings");
    var gm = google.maps;
    var map;
    var mapTypeIds = [];
    var markers = [];
    var markerBounds = new google.maps.LatLngBounds();
    var mc;
    var circle = new google.maps.Circle();

    // retrieve available map layers
    var layer_x = map_settings['layers'];
    $.each($.parseJSON(layer_x), function (item, value) {
        mapTypeIds.push(value);
    });

    $('#my_location').click(function () {
        if ($('#my_location').is(':checked')) {
            $('#autocomplete').val($('#user_location').val());
        } else {
            $('#autocomplete').val('');
        }
    });

    // store zoom-level for reset
    var zoomlevel = false;

    // store initial load for reset
    var stril = $('#initial_load').val();
    // reset initial load to 'newest', if browser-history-back;
    if(!stril){
    	stril='newest';
    	$('#initial_load').val(stril);
    }

    $(document).ready(function () {

		function updateOutput(el, val) {
		  el.textContent = val;
		}

		$element
		  .rangeslider({
			polyfill: false,
			onInit: function() {
			  updateOutput($output[0], this.value);
			}
		  })
		  .on('input', function() {
			updateOutput($output[0], this.value);
		  });

		// enable submit with enter

		$('form.elgg-form-amap-maps-api-nearby input').on('keyup',function (e) {
			if (e.which == 13) {
				e.preventDefault();
				$("#nearby_btn").trigger('click');
				return false;
			}
		});

		// reset-button

		$("#reset_btn").click(function(){

			$('#autocomplete').val('');
			$('#s_radius').val('');
			$('#s_keyword').val('');
			$('#initial_load').val(stril);
			/*
			var s_action = $('#s_action').val();
			var noofusers = $('#noofusers').val();
			var change_title = $('#change_title').val();
			var group_guid = $('#group_guid').val();
			var s_change_title = $('#s_change_title').val();
			*/
			$(this).hide();
			$("#nearby_btn").trigger('click');

		})

        // Initialize map vars
        infowindow = new google.maps.InfoWindow();
        var myLatlng = new google.maps.LatLng(map_settings['d_location_lat'],map_settings['d_location_lon']);
        var mapOptions = {
            zoom: parseInt(map_settings['default_zoom']),
            center: myLatlng,
            mapTypeControlOptions: {
                mapTypeIds: mapTypeIds
            },
        };

        map = new gm.Map(document.getElementById("map"), mapOptions);
        map.setMapTypeId(map_settings['default_layer']);

        map.mapTypes.set("OSM", new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                // See above example if you need smooth wrapping at 180th meridian
                return map_settings['osm_base_layer'] + zoom + "/" + coord.x + "/" + coord.y + ".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OpenStreetMap",
            maxZoom: 18
        }));

        // trigger the search button for making the initial search
        setTimeout(function() {
            $("#nearby_btn").trigger('click');
        },10);

        return false;
    });

    $('#nearby_btn').click(function () {
        // reset markers
        if (markers.length > 0) {
            for (var i = 0; i < markers.length; i++) {
              markers[i].setMap(null);
            }
            markers = [];
            markerBounds = new google.maps.LatLngBounds();

            if (map_settings['cluster']) {
                mc.clearMarkers();
            }
        }

        // reset search area, in case it exists
        circle.setMap(null);

        var btn_text = $(this).val();
        $(this).prop('value', 'Searching...');
        $(this).css("opacity", 0.7);

        // Spiderfier feature
        var oms = new OverlappingMarkerSpiderfier(map,{markersWontMove: true, markersWontHide: true, keepSpiderfied: true});
		/* mod */
		oms.addListener('spiderfy', function(spidered, unspidered) {
			for (var i = 0; i < spidered.length; i++) {
				if(spidered[i].title !== undefined){
					spidered[i].setOptions({
						icon: spidered[i].storeicon
						//icon: elgg.normalize_url('/mod/membersmap/graphics/green.png')
					});
				}
			}
		});
		oms.addListener('unspiderfy', function(spidered, unspidered) {
			for (var i = 0; i < spidered.length; i++) {
				if(spidered[i].title !== undefined){
					spidered[i].setOptions({
						icon: elgg.normalize_url('/mod/amap_maps_api/graphics/members-plus.png')
					});
				}
			}
		});
		var initialreset = 0;
		/* /mod */
        var s_location = $('#autocomplete').val();
        var s_radius = $('#s_radius').val();
        var s_keyword = $('#s_keyword').val();
        var s_action = $('#s_action').val();
        var initial_load = $('#initial_load').val();
        var noofusers = $('#noofusers').val();
        var change_title = $('#change_title').val();
        var group_guid = $('#group_guid').val();
        var s_change_title = $('#s_change_title').val();
        var showradius;
        if ($('#showradius').is(':checked'))
            showradius = 1;
        else
            showradius = 0;

        if (isNaN(s_radius)) {
            elgg.register_error(elgg.echo('amap_maps_api:search:error:radius_invalid'));
            initSearchBtn(btn_text);
            return false;
        } else if (s_action == 'undefined' || s_action.length === 0) {
            elgg.register_error(elgg.echo('amap_maps_api:search:error:action_undefined'));
            initSearchBtn(btn_text);
            return false;
        } else {

            elgg.action(s_action, {
                data: {
                    s_location: s_location,
                    s_radius: s_radius,
                    s_keyword: s_keyword,
                    showradius: showradius,
                    initial_load: initial_load,
                    noofusers: noofusers,
                    s_change_title: s_change_title,
                    group_guid: group_guid
                },
                success: function (result) {
                    if (result.error) {
                        elgg.register_error(result.msg);
                    } else {
                    	initialreset = 1;
                        if (result.change_title) {
                            $('.elgg-heading-main').html(result.title);
                        }
                        $('#map_location').html(result.location);
                        $('#map_radius').html(result.radius);

                        if (s_location) {
                            $('#s_radius').val(result.s_radius);
                        }
                        if (change_title != 0) {
                            $('.elgg-heading-main').html(result.title);
                        }

                        if (initial_load == 'location') {
                            $('#my_location').prop('checked', true);
                        }

 						if(initial_load==''){
 							$('#reset_btn').show();
 						}

                        if (s_location && result.s_location_lat && result.s_location_lng) {
                            var myLatlng = new google.maps.LatLng(result.s_location_lat,result.s_location_lng);
                            var marker = new google.maps.Marker({
                                map: map,
                                position: myLatlng,
                                icon: elgg.normalize_url('/mod/amap_maps_api/graphics/flag.png')
                            });
                            map.setCenter(marker.getPosition());

                            google.maps.event.addListener(marker, 'click', function() {
                                infowindow.setContent('Search address: '+s_location+'<br />Search radius: '+result.s_radius+' '+map_settings['unitmeas']);
                                infowindow.open(map, this);
                            });
                            markerBounds.extend(myLatlng);
                            oms.addMarker(marker);  // Spiderfier feature
                            markers.push(marker);
							
                            if (showradius && result.s_radius_no > 0) {
                                circle = new google.maps.Circle({
                                  map: map,
                                  radius: result.s_radius_no,
                                  fillColor: 'yellow',
                                  fillOpacity: 0.2
                                });
                                // Bind circle and marker
                                circle.bindTo('center', marker, 'position');
                                map.fitBounds(circle.getBounds());
                            }
                        }

                        var result_x = result.map_objects;

						if(result_x=='[]'){
							elgg.system_message(elgg.echo('No search resulsts. Please try another location or keyword.'));
						}

                        $.each($.parseJSON(result_x), function (item, value) {

                            var myLatlng = new google.maps.LatLng(value.lat,value.lng);
                            var marker = new google.maps.Marker({
                                map: map,
                                position: myLatlng,
                                title: value.title,
                                icon: value.map_icon,
                                storeicon: value.map_icon,
                                id: 'marker_'+value.guid
                            });

                            google.maps.event.addListener(marker, 'click', function() {
                                infowindow.setContent('<div class="infowindow">'+value.info_window+'</div>');
                                infowindow.open(map, this);
                            });


                            oms.addMarker(marker);  // Spiderfier feature
                            markers.push(marker);

                            if (!showradius)    {
                                markerBounds.extend(myLatlng);
                                map.fitBounds(markerBounds);
                            }

                        });

                        if (map_settings['cluster']) {
                            mcOptions = {
                                styles: [
                                    {
                                        height: 53,
                                        url: elgg.normalize_url('/mod/amap_maps_api/vendors/js-marker-clusterer/images/m1.png'),
                                        width: 53
                                    },
                                    {
                                        height: 56,
                                        url: elgg.normalize_url('/mod/amap_maps_api/vendors/js-marker-clusterer/images/m2.png'),
                                        width: 56
                                    },
                                    {
                                        height: 66,
                                        url: elgg.normalize_url('/mod/amap_maps_api/vendors/js-marker-clusterer/images/m3.png'),
                                        width: 66
                                    },
                                    {
                                        height: 78,
                                        url: elgg.normalize_url('/mod/amap_maps_api/vendors/js-marker-clusterer/images/m4.png'),
                                        width: 78
                                    },
                                    {
                                        height: 90,
                                        url: elgg.normalize_url('/mod/amap_maps_api/vendors/js-marker-clusterer/images/m5.png'),
                                        width: 90
                                    }
                                ],
                                maxZoom: map_settings['cluster_zoom']
                            };
                            //init clusterer with your options
                            mc = new MarkerClusterer(map, markers, mcOptions);
                        }

                        if (result.sidebar) {
                            $('#map_side_entities').html(result.sidebar);

                            $('.map_entity_block').click(function() {
                                var tmp_attr = $(this).find('a.entity_m');
                                var object_id = tmp_attr.attr('id');
                                for (var i = 0; i < markers.length; i++) {
                                    if (markers[i].id === "marker_" + object_id) {
                                        var latLng = markers[i].getPosition(); // returns LatLng object
                                        google.maps.event.trigger(markers[i], 'click');
                                        break;
                                    }
                                }
                            });

                            $('.map_entity_block a.entity_m').click(function() {
                                var object_id = $(this).attr('id');
                                for (var i = 0; i < markers.length; i++) {
                                    if (markers[i].id === "marker_" + object_id) {
                                        var latLng = markers[i].getPosition(); // returns LatLng object
                                        google.maps.event.trigger(markers[i], 'click');
                                        break;
                                    }
                                }
                            });
                        }
						/* mod */
						google.maps.event.addListener(map,'idle', function() {
							// reset initial
							if(initialreset==1){
								resetClusters();
								initialreset = 0;
							}
							// reset on zoom
							var zoomlevelact =  map.getZoom();
							if(zoomlevel!=zoomlevelact) {
								zoomlevel = zoomlevelact;
								resetClusters();
							}
						});
						function resetClusters() {
							var markers = oms.markersNearAnyOtherMarker();
							var ii = 0;
							$.each(markers, function (i, marker) {
								google.maps.event.trigger(markers[i], 'click');
								ii++;
							});
							// close last
							if(ii){
								infowindow.close(map, markers[(ii-1)]);
								oms.unspiderfy();
							}
						}
 						/* /mod */
                    }
                },
                complete: function () {
                    // bring search button to normal
                    initSearchBtn(btn_text);

                    // set empty the initial input so it will not be used by search form
                    $('#initial_load').val('');
                 }

            });
        }

        return false;
    });

});

function initSearchBtn(btn_text) {
    $("#nearby_btn").prop('value', btn_text);
    $("#nearby_btn").css("opacity", 1);
}
