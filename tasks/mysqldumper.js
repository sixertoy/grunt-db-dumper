/*
 * grunt-deploy-dump
 *
 * Copyright (c) 2014 Matthieu Lassalvy
 * Licensed under the MIT license.
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50*/
/*global require, module, console*/
var Q = require('q'),
    FS = require('fs'),
    Sys = require('sys'),
    SSH = require('ssh2'),
    _ = require('lodash'),
    Path = require('path'),
    Shell = require('shelljs'),
    Buffer = require('buffer').Buffer;

module.exports = function (grunt) {

    'use strict';

    var taskOptions = {},
        shell = new SSH();

    var lodashTemplates = {
            ssh: '<%= user %>@<%= host %>:<%= port %>',
            mysqldump: 'mysqldump -u<%= user %> <%= database %>',
            mysql: 'mysql  -u<%= user %> <%= database %> < <%= file %>'
        },
        options = {
            options: {
                path: 'dumps/'
            },
            local: {
                ssh: false,
                port: 22,
                user: 'root',
                password: false,
                host: '127.0.0.1'
            },
            distant: {
                ssh: true,
                port: 22,
                user: 'root',
                password: false
            }
        };


    /**
     * Connection au serveur distant
     *
     */
    function _connect(opts) {
        var deferred = Q.defer(),
            ssh = grunt.template.process(lodashTemplates.ssh, {data: opts});
        //
        shell.on('ready', function () {
            deferred.resolve(true);

        }).on('error', function (err) {
            deferred.reject(err);

        });
        shell.connect({
            host: opts.host,
            port: opts.port,
            username: opts.user,
            password: opts.password
        });
        return deferred.promise;
    }

    /**
     *
     *
     *
     */
    function _execute(opts) {
        var buffers = [],
            deferred = Q.defer(),
            cmd = grunt.template.process(lodashTemplates.mysqldump, {data: opts});
        //
        grunt.log.debug(cmd);
        shell.exec(cmd, function (err, stream) {
            if (err) {
                deferred.reject(err);

            } else {
                stream.on('exit', function (code) {
                    grunt.log.debug('Stream on ' + opts.host + ' exit (' + code + ')');
                    var content = Buffer.concat(buffers);
                    deferred.resolve(content);

                }).on('close', function () {
                    grunt.log.debug('Stream on ' + opts.host + ' closed');
                    shell.end();

                }).on('data', function (data) {
                    grunt.log.debug('Stream on ' + opts.host + ' data received');
                    buffers.push(data);

                });
            }
        });
        return deferred.promise;
    }

    /**
     *
     *
     *
     */
    function _dump() {
        var target = 'distant',
            deferred = Q.defer(),
            opts = taskOptions[target];
        //
        Q.fcall(function () {
            grunt.log.subhead('Start pulling database from ' + target);
            return _connect(opts);

        }).then(function () {
            // grunt.log.subhead('Start pulling database from ' + opts.options.target + ' to local');
            grunt.log.ok('Connected\r\n> ' + opts.host);
            return _execute(opts);

        }).then(function (buffer) {
            deferred.resolve(buffer);

        }).catch(function (err) {
            deferred.reject(err);

        });
        return deferred.promise;
    }

    /**
     *
     * Backup data on a local database
     *
     */
    function _backup() {
        var target = 'local',
            deferred = Q.defer(),
            opts = taskOptions[target],
            cmd = grunt.template.process(lodashTemplates.mysqldump, {data: opts});
        //
        grunt.log.subhead('Start backup database from ' + target);
        grunt.log.debug(cmd);
        Shell.exec(cmd, {silent: true}, function (code, output) {
            if (code !== 0) {
                var err = new Error('Unable to dump local database');
                deferred.reject(err);
            } else {
                deferred.resolve(output);
            }
        });
        return deferred.promise;
    }

    /**
     *
     *
     *
     */
    function _write(content, time, target){
        var file = Path.join(Path.normalize(taskOptions.options.path), time, target + '_' + taskOptions[target].database + '.sql');
        grunt.file.write(file, content);
        return file;
    }

    /**
     *
     *
     *
     */
    function _replace(files, from, to){
        // @TODO replace db local by distant
        var target = from,
            deferred = Q.defer(),
            opts = taskOptions[to];

        opts.file = files[target];
        var cmd = grunt.template.process(lodashTemplates.mysql, {data: opts});
        //
        grunt.log.subhead('Start import database from ' + from + ' to ' + to);
        grunt.log.debug(cmd);
        Shell.exec(cmd, {silent: true}, function (code, output) {
            if (code !== 0) {
                var err = new Error('Unable to import ' + target + ' database');
                deferred.reject(err);
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise;
    }

    /**
     *
     * Pull data from a distant to a local Database
     *
     */
    grunt.registerTask('db_pull', 'Pull data from a distant to a local Database', function () {
        var requires = this.requiresConfig('mysqldumper', 'mysqldumper.local', 'mysqldumper.local.database', 'mysqldumper.distant', 'mysqldumper.distant.database', 'mysqldumper.distant.host');
        // Verification de la configuration
        // de la tache Grunt
        if (requires) {
            var files = {},
                done = this.async(),
                time = String(Date.now()),
                taskConfig = grunt.config('mysqldumper');

            _.chain(taskOptions)
                .merge(options)
                .merge(taskConfig);

            Q.fcall(function () {
                return _dump();

            }).then(function(buffer){
                return _write(buffer, time, 'distant');

            }).then(function (file) {
                files.distant = file;
                grunt.log.ok('Success\r\n> ' + file);
                return _backup();

            }).then(function (content) {
                return _write(content, time, 'local');

            }).then(function (file) {
                files.local = file;
                grunt.log.ok('Success\r\n> ' + file);
                return _replace(files, 'distant', 'local');

            }).then(function (content) {
                grunt.log.subhead('grunt db_pull task complete at ' + String(Date(time)));
                done();

            }).fail(function (err) {
                grunt.log.debug(err.stack);
                grunt.fail.warn(err);
                done();

            });

        }
    });

};
