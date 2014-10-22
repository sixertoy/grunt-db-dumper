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
In your project's Gruntfile, add a section named `db_dumper` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    mysqldumper: {
        options: {
            path: 'dumps/'
        },
        local: {
            user: 'root',
            password: '',
            database: 'dumped',
            host: '127.0.0.1'
        },
        distant: {
            user: 'root',
            password: '',
            host: '192.168.1.61',
            database: 'dumped'
        }
    },
});
```

### Options

#### options.path
Type: `String`
Default value: `dumps/`

Default dump/backup folder

#### options.punctuation
Type: `String`
Default value: `'.'`

A string value that is used to do something else with whatever else.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  db_dumper: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  db_dumper: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
