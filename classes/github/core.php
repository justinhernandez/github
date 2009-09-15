<?php defined('SYSPATH') or die('No direct script access.');
/*
 * Github api library for Kohana V3
 *
 * @package    Github
 * @author     Justin Hernandez <justin@transphorm.com>
 * @version    0.4
 * @license    http://transphorm.com/license.txt
 */

class Github_Core
{

	// return data format - json, xml, yaml
	private $format;
	// url to process
	private $url;
	// http status code
	private $status;
	// last api call
	private $last;
	// api token
	private $token;
	// api user
	private $login;
	// callback method
	private $callback;


	/**
	 * Github class constructor
	 *
	 * @param   string  $login
	 * @param   string  $project
	 * @param   stting  $format
	 * @return  object
	 */
	function __construct($format, $login, $token)
	{
		// set default values
		$this->format = ($format) ? $format : (Kohana::config('github')->format);
		$this->login = ($login) ? $login : (Kohana::config('github')->login);
		$this->token = ($token) ? $token : (Kohana::config('github')->token);

		// Define api urls here
		define('GH_BASE_API', 'http://github.com/api/v2');
		define('GH_USER_API', '/user');
		define('GH_ISSUE_API', '/issues');
		define('GH_NETWORK_API', 'http://github.com');
		define('GH_REPO_API', '/repos');
		define('GH_COMMIT_API', '/commits');
		define('GH_TREE_API', '/tree');
		define('GH_BLOB_API', '/blob');
	}

	/**
	 * Singleton instance of Github
	 *
	 * @staticvar  object  $instance
	 * @param      string  $login
	 * @param      string  $project
	 * @param      stting  $format
	 * @return     object
	 */
	public static function instance($format = NULL , $login = NULL, $token = NULL)
	{
		static $instance;

		// Create the instance if it does not exist
		empty($instance) and $instance = new Github($format, $login, $token);

		return $instance;
	}

	/**
	 * Constructs and returns a new Github object.
	 *
	 * @param   string  $login
	 * @param   string  $project
	 * @param   stting  $format
	 * @return  object
	 */
	public static function factory($format = NULL , $login = NULL, $token = NULL)
	{
		return new Github($format, $login, $token);
	}
	

	/* USER METHODS */


	/**
	 * Search for users specified by string
	 *
	 * @param   string  $user
	 * @return  string
	 */
	public function user_search($user)
	{
		$this->url = GH_USER_API.'/search/'.$user;
		
		return $this->connect();
	}

	/**
	 * Return info for specified user. If user name is NULL then authenticated
	 * user info will be returned
	 *
	 * @param   string  $user
	 * @return  string
	 */
	public function user($user = NULL)
	{
		if (!$user)
		{
			$user = $this->login;
			$authenticate = TRUE;
		}
		else
		{
			$authenticate = FALSE;
		}
		$this->url = GH_USER_API.'/show/'.$user;

		return $this->connect($authenticate);
	}

	/**
	 * Update user information.
	 * Options are name, email, blog, company, location.
	 * i.e. $options['name'] = 'Conway Twitty';
	 *
	 * @param   array  $options
	 * @return  string
	 */
	public function update_user($options)
	{
		$this->url = GH_USER_API.'/'.$this->login;

		return $this->connect(TRUE, $options);
	}

	/**
	 * Return list of followers for specified user.
	 *
	 * @param   string  $user
	 * @return  string
	 */
	public function followers($user)
	{
		$this->url = GH_USER_API.'/show/'.$user.'/followers';

		return $this->connect();
	}

	/**
	 * Return list of people that user is following.
	 *
	 * @param   string  $user
	 * @return  string
	 */
	public function following($user)
	{
		$this->url = GH_USER_API.'/show/'.$user.'/following';

		return $this->connect();
	}

	/**
	 * Start following the specified user.
	 *
	 * @param   string  $user
	 * @return  string
	 */
	public function follow($user)
	{
		$this->url = GH_USER_API.'/follow/'.$user;

		return $this->connect(TRUE);
	}

	/**
	 * Stop following the specified user.
	 *
	 * @param   string  $user
	 * @return  string
	 */
	public function unfollow($user)
	{
		$this->url = GH_USER_API.'/unfollow/'.$user;

		return $this->connect(TRUE);
	}

	/**
	 * Return list of ssh keys for authenticated user.
	 *
	 * @return  string
	 */
	public function user_keys()
	{
		$this->url = GH_USER_API.'/keys';

		return $this->connect(TRUE);
	}

	/**
	 * Add an ssh key.
	 *
	 * @param   string  $title
	 * @param   string  $key
	 * @return  string
	 */
	public function add_user_key($title, $key)
	{
		$this->url = GH_USER_API.'/key/add';
		$data = array(
						'title' => $title,
						'key'  => $key,
					);

		return $this->connect(TRUE, $data);
	}

	/**
	 * Remove ssh key with the specified id.
	 *
	 * @param   int     $id
	 * @return  string
	 */
	public function remove_user_key($id)
	{
		$this->url = GH_USER_API.'/key/remove';
		$data['id'] = $id;

		return $this->connect(TRUE, $data);
	}

	/**
	 * Return list of email addresses associated with authenticated user.
	 *
	 * @return  string
	 */
	public function emails()
	{
		$this->url = GH_USER_API.'/emails';

		return $this->connect(TRUE);
	}

	/**
	 * Add email address
	 *
	 * @param   string  $email
	 * @return  string
	 */
	public function add_email($email)
	{
		$this->url = GH_USER_API.'/email/add';
		$data['email'] = $email;

		return $this->connect(TRUE, $data);
	}

	/**
	 * Remove email address
	 *
	 * @param   string  $email
	 * @return  string
	 */
	public function remove_email($email)
	{
		$this->url = GH_USER_API.'/email/remove';
		$data['email'] = $email;

		return $this->connect(TRUE, $data);
	}


	/* ISSUE METHODS */


	/**
	 * Return a list of issues for specified user and repository. Status can
	 * either be 'open' or 'closed'.
	 *
	 * @param   string  $status
	 * @return  string
	 */
	public function list_issues($status)
	{
		$this->url = GH_ISSUE_API.'/list/'.$this->repo_user.'/'.$this->repo_proj.'/'.$status;

		return $this->connect();
	}

	/**
	 * Return a list of issues for specified user and repository. Status can
	 * either be 'open' or 'closed'.
	 *
	 * @param   int     $id
	 * @return  string
	 */
	public function issue($id)
	{
		$this->url = GH_ISSUE_API.'/show/'.$this->repo_user.'/'.$this->repo_proj.'/'.$id;

		return $this->connect();
	}

	/**
	 * Create a new issue for specified repo. Must authenticate.
	 *
	 * @param   string  $title
	 * @param   string  $body
	 * @return  string
	 */
	public function new_issue($title, $body)
	{
		$this->url = GH_ISSUE_API.'/open/'.$this->repo_user.'/'.$this->repo_proj;
		$data = array(
						'title' => $title,
						'body'  => $body,
					);

		return $this->connect(TRUE, $data);
	}

	/**
	 * Close issue specified by repo. Must authenticate.
	 *
	 * @param   int     $id
	 * @return  string
	 */
	public function close_issue($id)
	{
		$this->url = GH_ISSUE_API.'/close/'.$this->repo_user.'/'.$this->repo_proj.'/'.$id;

		return $this->connect(TRUE);
	}

	/**
	 * Re-open issue specified by repo. Must authenticate.
	 *
	 * @param   int     $id
	 * @return  string
	 */
	public function reopen_issue($id)
	{
		$this->url = GH_ISSUE_API.'/reopen/'.$this->repo_user.'/'.$this->repo_proj.'/'.$id;

		return $this->connect(TRUE);
	}

	/**
	 * Edit issue for specified repo.
	 *
	 * @param   string  $id
	 * @param   string  $title
	 * @param   string  $body
	 * @return  string
	 */
	public function edit_issue($id, $title, $body)
	{
		$this->url = GH_ISSUE_API.'/edit/'.$uthis->repo_ser.'/'.$this->repo_proj.'/'.$id;
		$data = array(
						'title' => $title,
						'body'  => $body,
					);

		return $this->connect(TRUE, $data);
	}

	/**
	 * Add label to specified ticket id. Returns list of labels for that ticket.
	 *
	 * @param   string  $label
	 * @param   string  $id
	 * @return  string
	 */
	public function add_label($label, $id)
	{
		$this->url = GH_ISSUE_API.'/label/add/'.$this->repo_user.'/'.$this->repo_proj.'/'.$label.'/'.$id;

		return $this->connect(TRUE);
	}

	/**
	 * Remove label for specified ticket id.
	 * Returns list of labels for that ticket.
	 *
	 * @param   string  $label
	 * @param   string  $id
	 * @return  string
	 */
	public function remove_label($label, $id)
	{
		$this->url = GH_ISSUE_API.'/label/remove/'.$this->repo_user.'/'.$this->repo_proj.'/'.$label.'/'.$id;

		return $this->connect(TRUE);
	}


	/* NETWORK METHODS */


	/**
	 * This API is sort of an outlier. It is only available in JSON and does not
	 * follow the rest of the routing rules. It is the API used by our Network
	 * Graph and provides a lot of useful information that may be useful.
	 *
	 *  @return  string
	 */
	public function network_meta()
	{
		$this->url = GH_NETWORK_API.'/'.$this->repo_user.'/'.$this->repo_proj.'/network_meta';

		return $this->connect();
	}

	/**
	 * To get network data, you’ll need to provide the ‘nethash’ parameter that
	 * you get from the network_meta call so the data is always consistent. To
	 * get network data, call the network_data_chunk URI with the given nethash
	 * to get the first 100 commits by branch.
	 *
	 * @return  string
	 */
	public function network_data($nethash)
	{
		$this->url = GH_NETWORK_API.'/'.$this->repo_user.'/'.$this->repo_proj;
		$this->url .= '/network_data_chunk?nethash='.$nethash;

		return $this->connect();
	}


	/* REPOSITORY METHODS */


	/**
	 * Search for users specified by string
	 *
	 * @param   string  $user
	 * @return  string
	 */
	public function repo_search($repo)
	{
		$this->url = GH_REPO_API.'/search/'.$repo;

		return $this->connect();
	}

	/**
	 * Show info for specified repo.
	 *
	 * @param   string  $name
	 * @param   string  $repo
	 * @return  string
	 */
	public function repo_info($user, $repo)
	{
		$this->url = GH_REPO_API.'/show/'.$user.'/'.$repo;

		return $this->connect();
	}

	/**
	 * List all repos for specified user
	 *
	 * @param   string  $name
	 * @return  string
	 */
	public function list_repos($user)
	{
		$this->url = GH_REPO_API.'/show/'.$user;

		return $this->connect();
	}

	/**
	 * Watch repo. Must be authenticated.
	 *
	 * @return  string
	 */
	public function watch()
	{
		$this->url = GH_REPO_API.'/watch/'.$this->repo_user.'/'.$this->repo_proj;

		return $this->connect(TRUE);
	}

	/**
	 * Unwatch repo. Must be authenticated.
	 *
	 * @return  string
	 */
	public function unwatch()
	{
		$this->url = GH_REPO_API.'/unwatch/'.$this->repo_user.'/'.$this->repo_proj;

		return $this->connect(TRUE);
	}

	/**
	 * Fork repo. Must be authenticated.
	 *
	 * @return  string
	 */
	public function fork()
	{
		$this->url = GH_REPO_API.'/fork/'.$this->repo_user.'/'.$this->repo_proj;

		return $this->connect(TRUE);
	}

	/**
	 * Create new repository. Name is required. Description, homepage and
	 * public are optional.
	 * Public - 1 for public, 0 for private
	 *
	 * @param   mixed  $data
	 * @return  string
	 */
	public function create_repo($options)
	{
		$this->url = GH_REPO_API.'/create';
		if (!is_array($options))
		{
			$data['name'] = $options;
		}
		else
		{
			$data = $options;
		}

		return $this->connect(TRUE, $data);
	}

	/**
	 * Delete repository with specfied name.
	 * You can also delete a repository with a POST which will give you back a
	 * token in the ‘delete_token’ field of the response, which you then have to
	 * post back to the same url again (in the ‘delete_token’ POST var) to
	 * complete the deletion.
	 *
	 * @param   string  $repo
	 * @return  string
	 */
	public function delete_repo($delete_token = NULL)
	{
		$repo = $this->repo_name($this->repo_proj);
		$this->url = GH_REPO_API.'/delete/'.$repo;

		// if delete token is passed post it
		if ($delete_token)
		{
			$data['delete_token'] = $delete_token;
			return $this->connect(TRUE, $data);
		}
		else
		{
			return $this->connect(TRUE);
		}
	}

	/**
	 * Set repo as private
	 *
	 * @param   string  $repo
	 * @return  string
	 */
	public function set_private()
	{
		$repo = $this->repo_name($this->repo_proj);
		$this->url = GH_REPO_API.'/set/private/'.$repo;

		return $this->connect(TRUE);
	}

	/**
	 * Set repo as public.
	 *
	 * @param   string  $repo
	 * @return  string
	 */
	public function set_public()
	{
		$repo = $this->repo_name($this->repo_proj);
		$this->url = GH_REPO_API.'/set/public/'.$repo;

		return $this->connect(TRUE);
	}

	/**
	 * Return list of deploy keys for repo
	 *
	 * @param   string  $repo
	 * @return  string
	 */
	public function deploy_keys()
	{
		$this->url = GH_REPO_API.'/keys/'.$this->repo_proj;

		return $this->connect(TRUE);
	}

	/**
	 * Add an ssh key.
	 *
	 * @param   string  $repo
	 * @param   string  $title
	 * @param   string  $key
	 * @return  string
	 */
	public function add_deploy_key($title, $key)
	{
		$this->url = GH_REPO_API.'/key/'.$$this->repo_proj.'/add';
		$data = array(
						'title' => $title,
						'key'  => $key,
					);

		return $this->connect(TRUE, $data);
	}

	/**
	 * Remove ssh key with the specified id.
	 *
	 * @param   string  $repo
	 * @param   int     $id
	 * @return  string
	 */
	public function remove_deploy_key($id)
	{
		$this->url = GH_REPO_API.'/key/'.$$this->repo_proj.'/remove';
		$data['id'] = $id;

		return $this->connect(TRUE, $data);
	}

	/**
	 * Return list collaborators for a previously specified repo
	 *
	 * @return  string
	 */
	public function collaborators()
	{
		$this->url = GH_REPO_API.'/show/'.$this->repo_user.'/'.$this->repo_proj.'/collaborators';

		return $this->connect(TRUE);
	}

	/**
	 * Return list collaborators for a previously specified repo
	 *
	 * @param   string  $user
	 * @return  string
	 */
	public function add_collaborator($user)
	{
		$this->url = GH_REPO_API.'/collaborators/'.$this->repo_proj.'/add/'.$user;

		return $this->connect(TRUE);
	}

	/**
	 * Return list collaborators for a previously specified repo
	 *
	 * @param   string  $user
	 * @return  string
	 */
	public function remove_collaborator($user)
	{
		$this->url = GH_REPO_API.'/collaborators/'.$this->repo_proj.'/remove/'.$user;

		return $this->connect(TRUE);
	}

	/**
	 * Network info about previously specified repo
	 *
	 * @return  string
	 */
	public function repo_network()
	{
		$this->url = GH_REPO_API.'/show/'.$this->repo_user.'/'.$this->repo_proj.'/network';

		return $this->connect(TRUE);
	}

	/**
	 * List of tags for previously specified repo
	 *
	 * @return  string
	 */
	public function repo_tags()
	{
		$this->url = GH_REPO_API.'/show/'.$this->repo_user.'/'.$this->repo_proj.'/tags';

		return $this->connect(TRUE);
	}

	/**
	 * List of branches for previously specified repo
	 *
	 * @return  string
	 */
	public function repo_branches()
	{
		$this->url = GH_REPO_API.'/show/'.$this->repo_user.'/'.$this->repo_proj.'/branches';

		return $this->connect(TRUE);
	}


	/* COMMIT METHODS */


	/**
	 * Return list of commits for a branch of a previously specified repo
	 *
	 * @param   string  $branch
	 * @return  string
	 */
	public function list_commits($branch)
	{
		$this->url = GH_COMMIT_API.'/list/'.$this->repo_user.'/'.$this->repo_proj.'/'.$branch;

		return $this->connect(TRUE);
	}

	/**
	 * Return list of commits for a specific file from $branch of a previously
	 * specified repo
	 *
	 * @param   string  $branch
	 * @param   string  $path
	 * @return  string
	 */
	public function list_commits_for($branch, $path)
	{
		$this->url = GH_COMMIT_API.'/list/'.$this->repo_user.'/'.$this->repo_proj.'/'.$branch.'/'.$path;

		return $this->connect(TRUE);
	}

	/**
	 * Return list of commits for a specific file from $branch of a previously
	 * specified repo
	 *
	 * @param   string  $branch
	 * @param   string  $path
	 * @return  string
	 */
	public function show_commit($commit_hash)
	{
		$this->url = GH_COMMIT_API.'/show/'.$this->repo_user.'/'.$this->repo_proj.'/'.$commit_hash;

		return $this->connect(TRUE);
	}


	/* OBJECT METHODS */


	/**
	 * Can get the contents of a tree by tree hash
	 *
	 * @param    string  $tree_hash
	 * @return
	 */
	public function tree($tree_hash)
	{
		$this->url = GH_TREE_API.'/show/'.$this->repo_user.'/'.$this->repo_proj.'/'.$tree_hash;

		return $this->connect(TRUE);
	}

	/**
	 * Get blob data with supplied tree hash, path for previously supplied repo
	 *
	 * @param    string  $tree_hash
	 * @param    string  $path
	 * @return
	 */
	public function blob($tree_hash, $path)
	{
		$this->url = GH_BLOB_API.'/show/'.$this->repo_user.'/'.$this->repo_proj.'/'.$tree_hash.'/'.$path;

		return $this->connect(TRUE);
	}

	/**
	 * You can get the contents of a blob with the blob's hash.
	 * It is important to note that it doesn’t matter which type you specify
	 * (yaml, xml, json), the output will simply be the raw output.
	 *
	 * @param    string  $hash
	 * @return
	 */
	public function raw($hash)
	{
		$this->url = GH_BLOB_API.'/show/'.$this->repo_user.'/'.$this->repo_proj.'/'.$hash;

		return $this->connect(TRUE);
	}
	

	/* CLASS METHODS */


	/**
	 * Specify user repository. This alleviates the need to keep sending the
	 * same repo info over and over.
	 *
	 * @param   string  $user
	 * @param   string  $project
	 * @return  object
	 */
	public function repo($user, $project)
	{
		$this->repo_user = $user;
		$this->repo_proj = $project;

		return $this;
	}

	/**
	 *
	 * @param   string  $foramt
	 * @return  object
	 */
	public function format($format)
	{
		$this->format = $format;

		return $this;
	}

	/**
	 *
	 * @param <type> $cb
	 */
	public function callback($callback)
	{
		$this->callback = $callback;

		return $this;
	}
	
	/**
	 * cURL connection function
	 *
	 * @return  string
	 */
	private function connect($authenticate = FALSE, $post_data = array())
	{
		// construct url here so format can be dynamic
		$this->url = GH_BASE_API.'/'.$this->format.$this->url;

		// connection options
		$url_params = array();
		
		// add callback method if it exists
		if ($this->callback) $url_params['callback'] = $this->callback;

		// add url options to url
		// $this->url .= '?'.http_build_query($options);
		
		// init curl options array
		$curl_options = array(
							CURLOPT_RETURNTRANSFER  => TRUE,
							CURLOPT_URL             => $this->url
						);

		// if we need to login
		if ($authenticate)
		{
			$post_data['login'] = $this->login;
			$post_data['token'] = $this->token;
			$curl_options[CURLOPT_POST] = TRUE;
		}

		// curl init
		$curl = curl_init();

		// add post data
		if (count($post_data)>0) $curl_options[CURLOPT_POSTFIELDS] = $post_data;
		
		// set options
		curl_setopt_array($curl, $curl_options);
		
		// retrieve data
		$data = curl_exec($curl);
		// set curl http status
		$this->status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		// set last call
		$this->last = $this->url;
		// clear settings
		$this->url = '';
		$this->callback = '';

		// debug output
		if (!IN_PRODUCTION AND Kohana::config('github')->debug) $this->debugo($data);

		return $data;
	}

	/**
	 * Convert repo name to github readable
	 *
	 * @param   string  $repo
	 * @return  string
	 */
	private function repo_name($repo)
	{
		return strtolower(str_replace(' ', '-', $repo));
	}

	/**
	 * Debug function
	 *
	 * @param  string  $data  Data returned from cURL connection.
	 * @param  array   $post  Post data array
	 */
	private function debugo($data)
	{
		print '<a href="'.request::$referrer.'">Back</a><br/>';
		print '<h3>Status:</h3>'.$this->status;
		print '<h3>Url:</h3>'.$this->last;
		print '<h3>Format:</h3>'.$this->format;
		print '<h3>Response Data:</h3>';

		// print data
		if ($this->format == 'json')
		{
			print Kohana::debug(json_decode($data));
		}
		else if ($this->format == 'xml')
		{
			print nl2br(htmlentities($data));
		}
		else
		{
			print $data;
		}

		// call Profiler
		new CodeBench;
	}

}