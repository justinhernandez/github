<?php defined('SYSPATH') or die('No direct script access.');

return array(

	/**
	 * Default api user for login purposes
	 *
	 * DEFAULT: NULL
	 */
	'login' => '',

	/**
	 * API token key for github. Found under the account page
	 *
	 * DEFAULT: NULL
	 */
	'token' => '',

	/**
	 * Default format to return the data. Either xml or json.
	 *
	 * DEFAULT: json
	 */
	'format' => 'json',

	/**
	 * Display extra debug info? IN_PRODUCTION also has to be FALSE.
	 *
	 * DEFAULT: TRUE
	 */
	'debug' => TRUE,

);