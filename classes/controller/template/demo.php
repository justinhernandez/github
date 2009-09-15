<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Template_Demo extends Controller_Template
{

	// template
	public $template = false;
	// autoload
	public $auto_render = false;

	// construct class - print method name at top
	public function before()
	{
		parent::before();

		print('<h1>'.$this->request->action.'</h1>');
	}

	// nice index that lists methods
	public function action_index()
	{
		// base url
		$base = $this->request->uri;
		// get methods
		$methods = new ArrayIterator(get_class_methods($this));
		// methods to ignore
		$ignore = array(
							'__construct',
							'action_index',
							'__call',
							'_kohana_load_view',
							'd',
							'before',
							'after',
						);

		// print demo links
		while ($methods->valid())
		{
			$c = $methods->current();
			$c = str_replace('action_', '', $c);
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