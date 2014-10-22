/*
 * grunt-deploy-dump
 *
 * Copyright (c) 2014 Matthieu Lassalvy
 * Licensed under the MIT license.
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50*/
/*global require, module, console*/
var Q = require('q'),
    SSH = require('ssh2'),
    _ = require('lodash'),
    Path = require('path');

module.exports = function (grunt) {

    'use strict';

    var PLUGIN_NAME = 'dumpdeploy',
        TEMPLATES = {
            mysql: 'mysqldump -u<%= user %> <%= password %> <%= database %>'
        }

    var taskOptions = {
            options: {
                target: null,
                backups: 'dumps/'
            },
            local: {
                port: 22,
                user: 'root',
                database: null,
                password: false,
                host: '127.0.0.1'
            }
        },
        gruntConfig = grunt.config(PLUGIN_NAME);
    // extend config options w/ defaults options
    _.extend(taskOptions, gruntConfig);

    /**
     * Value is valid if
     * - not null
     * - not empty
     * - not undefined
     * - not an number
     * - not an [object Object]
     *
     * @params str [String]
     * @return Boolean
     */
    function _isValid(str, empty) {
        var valid = _.isString(str);
        if (!empty) {
            valid = !_.isEmpty(str);
        }
        return valid;
    }

    function _createDumpsDirectory(name) {
        var t = String(Date.now()),
            n = Path.normalize(name.toLowerCase()),
            p = Path.normalize(taskOptions.options.backups),
            d = Path.join(p, n, t);
        grunt.file.mkdir(Path.join(p, n, t));
        return d;
    }

    function _writeDump(target, file, content) {
        grunt.log.ok('Dump sucess on ' + target + ' database');
        grunt.file.write(file, content);
    }

    /**
     * Pull datas
     * from target DB
     * to development DB
     */
    grunt.registerTask('db_pull', 'Pull data from a distant to a local Database', function () {

        var done  = this.async(),
            target = taskOptions.options.target;
        //
        if (_isValid(target) && taskOptions.hasOwnProperty(target)) {
            grunt.log.subhead('Start pulling database from ' + target + ' to local');
            grunt.log.ok('Importing dabatase from ' + target);
            var localOptions = taskOptions.local,
                targetOptions = taskOptions[target];
            //
            // creation du repertoire
            // pour stocker les dumps
            if (_isValid(taskOptions.options.backups)) {
                // @TODO verification du host, valide SSH
                if (_isValid(targetOptions.host) && _isValid(targetOptions.user) && _isValid(targetOptions.database)) {
                    //
                    try {

                        var conn = new SSH();
                        conn.on('ready', function () {
                            grunt.log.ok('SSH connected on ' + targetOptions.host);
                            //
                            var opts = targetOptions;
                            if (_.isString(opts.password)  && !_.isEmpty(opts.password)) {
                                opts.password = '--password="' + opts.password + '"';
                            } else {
                                opts.password = '';
                            }
                            var cmd = grunt.template.process(TEMPLATES.ssh, {data: opts});
                            conn.exec(cmd, function (err, stream) {
                                if (err) {
                                    throw err;
                                }
                                stream.on('exit', function (code, signal) {
                                    grunt.log.ok('Stream :: exit :: code: ' + code + ', signal: ' + signal);

                                }).on('close', function () {
                                    grunt.log.ok('Stream :: close');
                                    conn.end();

                                }).on('data', function (data) {
                                    grunt.log.ok('STDOUT: ' + data);

                                }).stderr.on('data', function (data) {
                                    grunt.log.ok('STDERR: ' + data);

                                });

                            });
                        }).connect({
                            host: targetOptions.host,
                            username: targetOptions.user,
                            port: (targetOptions.port || 22),
                            password: (targetOptions.password || '')
                        });

                    } catch (e) {
                        grunt.fail.warn(e);
                        done();
                    }


                } else {
                    grunt.fail.warn('Current parameters on target [' + target + '] are not valid');
                }
            } else {
                grunt.fail.warn('Can\'t create dumps directory');
            }
        } else {
            grunt.fail.warn('Task\'s target is undefined');
        }

    });

};
