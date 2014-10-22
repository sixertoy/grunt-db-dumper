# grunt-db-dumper

> Pull MySQL datas from a distant DB to a MySQL local DB

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-db-dumper --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-db-dumper');
```

## The "db_dumper" task

### Overview
In your project's Gruntfile, add a section named `mysqldumper` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    mysqldumper: {
        local: {
            database: 'dumped',
            host: '127.0.0.1'
        },
        distant: {
            database: 'dumped',
            host: '192.168.1.61'
        }
    },
});
```

### Options

#### options.path
Type: `String`
Default value: `dumps/`

Default dump/backup folder

#### [target]
Type: `Object`

Config object for a local mysql connection

#### [target].ssh
Type: `Boolean`
Default value: `false`

Use SSH connection

#### [target].database
Type: `String`

Database name to push/pull

#### [target].host
Type: `String`

Host ip/name

#### [target].port
Type: `Integer`
Default value: `22`

SSH port connection

#### [target].user
Type: `String`
Default value: `root`

SSH/MySQL user

#### [target].password
Type: `String`
Default value: `false`

SSH/MySQL password

### Usage Examples

```js
grunt.initConfig({
    mysqldumper: {
        options: {
            path: 'dumps/'
        },
        local: {
            database: 'dumped',
            host: '127.0.0.1'
        },
        distant: {
            ssh: true,
            port: 22,
            user: 'root',
            password: '1234superpassword',
            database: 'dumped',
            host: '192.168.1.61'
        }
    },
});
```

```bash
$ grunt db_pull

# Debug
$ grunt db_pull --debug
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
