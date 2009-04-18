<?php defined('SYSPATH') or die('No direct script access.');

/**
 * Default api user for login purposes
 *
 * DEFAULT: NULL
 */
$config['login'] = 'justinhernandez';

/**
 * API token key for github. Found under the account page
 *
 * DEFAULT: NULL
 */
$config['token'] = '114d9cb09dd6f22e8e7a70560eaafe0b';

/**
 * Default format to return the data. Either xml or json.
 *
 * DEFAULT: json
 */
$config['format'] = 'json';

/**
 * Display extra debug info? IN_PRODUCTION also has to be FALSE.
 *
 * DEFAULT: TRUE
 */
$config['debug'] = TRUE;