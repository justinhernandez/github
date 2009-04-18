<?php defined('SYSPATH') or die('No direct script access.');

class Quick_Demo_Controller extends Controller
{
	// don't allow in production
	const ALLOW_PRODUCTION = FALSE;

	// construct class - print method name at top
	public function __construct()
	{
		parent::__construct();

		print('<h1>'.Router::$method.'</h1>');
	}

	// nice index that lists methods
	public function index()
	{
		// base url
		$base = url::current();
		// get methods
		$methods = new ArrayIterator(get_class_methods($this));
		// methods to ignore
		$ignore = array(
							'__construct',
							'index',
							'__call',
							'_kohana_load_view',
							'd'
						);

		// print demo links
		while ($methods->valid())
		{
			$c = $methods->current();
			if (!in_array($c, $ignore))
				print "<a style='margin-left:25px' href='$base/$c'>".$c.'</a><br/>';
			$methods->next();
		}
	}

	public function d($input)
	{
		print Kohana::debug($input);
	}

}