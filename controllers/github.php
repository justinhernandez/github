<?php defined('SYSPATH') or die('No direct script access.');

class Github_Controller extends Quick_Demo_Controller
{

	public function __construct()
	{
		parent::__construct();

		// github info can be passed by reference or set in config
		// Github::instance($format, $user, $token)
		$this->g = Github::instance();
	}

	public function user_search()
	{
		$this->g->user_search('justin');
	}

	public function user()
	{
		// if user name string is passed then will return info for that user
		$this->g->user('shadowhand');
	}

	public function user_authenticated()
	{
		// if no user name is passed then it will return authenticated user
		$this->g->user();
	}

	// if user is passed an array then it will update user properties
	// as of 4-17-09 it gives a 404 error
	public function update_user()
	{
		/*
		 * KEY OPTIONS
		 * 
		 * name
		 * email
		 * blog
		 * company
		 * location
		 */
		$array = array(
						'name' => 'Testing API',
						'location' => 'Kohanaville',
					);
					
		$this->g->update_user($array);
	}

	public function followers()
	{
		$this->g->followers('kohana');
	}

	public function following()
	{
		$this->g->following('geertdd');
	}

	public function follow()
	{
		$this->g->follow('kohana');
	}

	// as of 4-17-09 doesn't seem to work
	public function unfollow()
	{
		$this->g->unfollow('kohana');
	}

	// retrieve keys from authenticated.
	public function user_keys()
	{
		$this->g->user_keys();
	}

	public function add_user_key()
	{
		$key = 'ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAIEAxBMcq75vmnWnTFDVOkNnqJzAj9JfEqqN4m5/7kxcey7ZxKswGlYDZpkETce6INXfiGU9Xd1GY4WCenqN6iWu99lNqvMrJoAH/L1v6r6UPEjpc7QE1SeSQvdTYzx9xgXtCxg3JbAXykjUcDbsRngHy1AglkKvJr6UWu8csifM2yM=';
		$this->g->add_user_key('Test Key', $key);
	}

	public function remove_user_key()
	{
		$this->g->remove_user_key(102634);
	}

	public function emails()
	{
		$this->g->emails();
	}

	public function add_email()
	{
		$this->g->add_email('testing_api@kohanagithub.com');
	}

	public function remove_email()
	{
		$this->g->remove_email('testing_api@kohanagithub.com');
	}

	public function list_issues()
	{
		$this->g->repo('justinhernandez', 'github-v1')->list_issues('open');
	}

	public function issue()
	{
		// the last param is the issue id
		$this->g->repo('justinhernandez', 'github-v1');
		$this->g->issue(1);
	}

	public function new_issue()
	{
		$this->g->repo('justinhernandez', 'github-v1');
		$this->g->new_issue('my new issue', 'the problem is the user!');
	}

	public function close_issue()
	{
		$this->g->repo('justinhernandez', 'github-v1');
		$this->g->close_issue(2);
	}

	public function reopen_issue()
	{
		$this->g->repo('justinhernandez', 'github-v1');
		$this->g->reopen_issue(2);
	}

	public function edit_issue()
	{
		$this->g->repo('justinhernandez', 'github-v1');
		$this->g->edit_issue(2, 'my new issue', 'EDITED: the problem is the user!');
	}

	public function add_label()
	{
		$this->g->repo('justinhernandez', 'github-v1');
		$this->g->add_label('Testing', 2);
	}

	public function remove_label()
	{
		$this->g->repo('justinhernandez', 'github-v1');
		$this->g->remove_label('Testing', 2);
	}

	public function network_meta()
	{
		$this->g->repo('justinhernandez', 'github-v1')->network_meta();
	}

	/**
	 * To get network data, you’ll need to provide the ‘nethash’ parameter that
	 * you get from the network_meta call so the data is always consistent. To
	 * get network data, call the network_data_chunk URI with the given nethash
	 * to get the first 100 commits by branch.
	 */
	public function network_data()
	{
		$this->g->repo('justinhernandez', 'github-v1')->network_data('4e8ec7b4fbba905ea0a4c11cf2eaa329e1442974');
	}

	public function repo_search()
	{
		$this->g->repo_search('kohana');
	}
	
	public function repo_info()
	{
		$this->g->repo_info('justinhernandez', 'github-v1');
	}

	public function list_repos()
	{
		$this->g->list_repos('ninjapenguin');
	}

	public function watch()
	{
		$this->g->repo('shadowhand', 'kohana')->watch();
	}

	public function unwatch()
	{
		$this->g->repo('shadowhand', 'kohana')->unwatch();
	}

	public function fork()
	{
		$this->g->repo('shadowhand', 'kohana')->fork();
	}


	/**
	 * Create new repository. Name is required, description, homepage and
	 * visiblity are optional.
	 * Visibility = 1 for public, 0 for private
	 *
	 */
	public function create_repo()
	{
		$this->g->create_repo('New Test Repo');
	}

	/**
	 * You can also delete a repository with a POST which will give you back a
	 * token in the ‘delete_token’ field of the response, which you then have to
	 * post back to the same url again (in the ‘delete_token’ POST var) to
	 * complete the deletion.
	 */
	public function delete_repo()
	{
		// repo name string will be lowercased and spaces will be replaced
		$this->g->repo('justinhernandez', 'github-v1')->delete_repo();
		//$this->g->delete_repo('New Test Repo', 'yzlvmaqljd');
	}

	public function set_private()
	{
		// repo name string will be lowercased and spaces will be replaced
		$this->g->repo('justinhernandez', 'github-v1');
		$this->g->set_private();
	}

	public function set_public()
	{
		// repo name string will be lowercased and spaces will be replaced
		$this->g->repo('justinhernandez', 'github-v1');
		$this->g->set_public();
	}

	public function deploy_keys()
	{
		$this->g->repo('justinhernandez', 'github-v1');
		$this->g->deploy_keys();
	}

	public function add_deploy_key()
	{
		$this->g->repo('justinhernandez', 'github-v1');
		$key = 'ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAIEAxBMcq75vmnWnTFDVOkNnqJzAj9JfEqqN4m5/7kxcey7ZxKswGlYDZpkETce6INXfiGU9Xd1GY4WCenqN6iWu99lNqvMrJoAH/L1v6r6UPEjpc7QE1SeSQvdTYzx9xgXtCxg3JbAXykjUcDbsRngHy1AglkKvJr6UWu8csifM2yM=';
		$this->g->add_deploy_key('Test Key', $key);
	}

	public function remove_deploy_key()
	{
		$this->g->repo('justinhernandez', 'github-v1');
		$this->g->remove_deploy_key(102682);
	}

	public function collaborators()
	{
		$this->g->repo('justinhernandez', 'github-v1')->collaborators();
	}

	public function add_collaborator()
	{
		$this->g->repo('justinhernandez', 'github-v1')->add_collaborator('github_user');
	}

	public function remove_collaborator()
	{
		$this->g->repo('justinhernandez', 'github-v1')->remove_collaborator('github_user');
	}

	public function repo_network()
	{
		$this->g->repo('justinhernandez', 'github-v1')->repo_network();
	}

	public function repo_tags()
	{
		$this->g->repo('shadowhand', 'kohana')->repo_tags();
	}

	public function repo_branches()
	{
		$this->g->repo('shadowhand', 'kohana')->repo_branches();
	}

	public function list_commits()
	{
		$this->g->repo('shadowhand', 'kohana')->list_commits('master');
	}

	public function list_commits_for()
	{
		$this->g->repo('shadowhand', 'kohana')->list_commits_for('master', 'install.php');
	}

	public function show_commit()
	{

		$commit = 'ab2334b2b29da7a3a0aec11812d8eed94ea474e5';
		$this->g->repo('shadowhand', 'kohana')->show_commit($commit);
	}

	public function tree()
	{

		$tree = 'ab2334b2b29da7a3a0aec11812d8eed94ea474e5';
		$this->g->repo('shadowhand', 'kohana')->tree($tree);
	}

	public function blob()
	{

		$tree = 'ab2334b2b29da7a3a0aec11812d8eed94ea474e5';
		$path = 'bootstrap.php';
		$this->g->blob('shadowhand', 'kohana')->tree($tree, $path);
	}

	public function raw()
	{
		$hash = 'a6b890b84672bf0ed5731561d2298b038612fc8d';
		$this->g->raw($hash);
	}
	
}