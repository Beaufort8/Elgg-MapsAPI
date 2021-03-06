<?php
/**
 * Elgg text input
 * Displays a text input field
 *
 * @package Elgg
 * @subpackage Core
 *
 * @uses $vars['class'] Additional CSS class
 */

$vars['class'] = (array) elgg_extract('class', $vars, []);
$vars['class'][] = 'elgg-input-range';

$defaults = array(
	'value' => '',
	'disabled' => false,
	'type' => 'range'
);

$vars = array_merge($defaults, $vars);

echo elgg_format_element('input', $vars);
