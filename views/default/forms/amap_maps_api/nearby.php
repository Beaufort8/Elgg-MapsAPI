<?php
/**
 * Elgg AgoraMap Maps Api plugin
 * @package amap_maps_api 
 */


elgg_require_js("amap_maps_api/amap_autocomplete");
elgg_require_js("amap_maps_api/amap_search");

$output = '';
$output .= '<div class="nearby_search_form">';
$output .= '<div class="nsf_element nsf_medium">';
$output .= elgg_view('input/text', array(
    'name' => 's_location', 
    'placeholder' => elgg_echo("amap_maps_api:search:location"),	
    //'id' => 's_location', 
    'id' => 'autocomplete',
    'class' => 'elgg-input-text txt_medium', 
    'value' => (isset($vars['initial_location'])?$vars['initial_location']:''),
    //'value' => (isset($vars['initial_load']) && $vars['initial_load'] == 'location' && isset($vars['user_location'])?$vars['user_location']:''),
));
if (isset($vars['my_location'])) {
    $output .= '<label class="mtm float-alt">'.elgg_view('input/checkbox', array('name' => 'my_location', 'value' => 'show', 'id' => 'my_location')).elgg_echo("amap_maps_api:search:my_location").'</label>';
}
$output .= '</div>';

// radius
/*
<input
    type="range"
    min="10"                    // default 0
    max="1000"                  // default 100
    step="10"                   // default 1
    value="300"                 // default min + (max-min)/2
    data-orientation="vertical" // default horizontal
>
*/
$output .= '<div class="nsf_element nsf_medium">';

$output .= '<div style="display:inline-block;width:200px;">';
$output .= elgg_view('input/range', array(
	'name' => 's_radius', 
	// 'placeholder' => amap_ma_get_unit_of_measurement_string(AMAP_MA_PLUGIN_ID),	
	'id' => 's_radius', 
	'class' => 'elgg-input-range', 
	'value' => (isset($vars['initial_radius'])?$vars['initial_radius']:''),
    'min'=>'50',
    'max'=>'500',
    'step'=>'50',
    'data-orientation'=>'horizontal'
));
$output .= '</div>';

$output .= '<label class="mtm float-alt" style="margin-top:20px">';
$output .= elgg_view('input/checkbox', array('name' => 'showradius', 'value' => 'show', 'id' => 'showradius'));
$output .= 'Show search area: <span id="output"></span> km&nbsp';
$output .= '</label>';

$output .= '</div>';

$output .= '<div class="nsf_element nsf_small">';
$output .= elgg_view('input/text', array(
    'name' => 's_keyword', 
    'placeholder' => elgg_echo("amap_maps_api:search:keyword"),	
    'id' => 's_keyword', 
    'class' => 'elgg-input-text txt_small', 
    'value' => $vars['initial_keyword'], 
));
$output .= '</div>';

$output .= '<div class="nsf_element">';
$output .= elgg_view('input/hidden', array(
	'name' => 's_action', 
	'id' => 's_action', 
	'value' => $vars['s_action'] 
));
if (isset($vars['my_location'])) {
    $output .= elgg_view('input/hidden', array(
        'name' => 'user_location', 
        'id' => 'user_location', 
        'value' => $vars['my_location'], 
    ));
}

if (isset($vars['initial_load'])) {
    $output .= elgg_view('input/hidden', array(
        'name' => 'initial_load', 
        'id' => 'initial_load', 
        'value' => $vars['initial_load'], 
    ));
}
$output .=  elgg_view('input/button', array(
	'value' => elgg_echo('amap_maps_api:search:submit'),
	'class' => 'elgg-button elgg-button-submit nearby_btn', 
	'id' => 'nearby_btn', 
));
$output .= '</div>';
$output .= '</div>';

echo $output;
	