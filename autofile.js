/*jshint es5:true*/

'use strict';

var fs   = require('fs');
var path = require('path');

var task = {
    id: 'package-autofile',
    author: 'Indigo United',
    name: 'Package autofile',

    options: {
        autofile: {
            description: 'The autofile that will be loaded.',
        },
        'options-intro': {
            description: 'The text that is shown before the options.',
            default:     'Here\'s a list of the options that this task can take:'
        }
    },

    setup: function (opt, ctx, next) {
        opt.task      = require(path.resolve(opt.autofile));
        opt.__dirname = __dirname;

        next();
    },

    tasks: [
        {
            description: 'Copy template README.md file',
            task: 'cp',
            options: {
                files: {
                    '{{__dirname}}/README.md.tpl': 'README.md'
                }
            }
        },
        {
            description: 'Replace overall info in README.md',
            task: 'scaffolding-replace',
            options: {
                files: 'README.md',
                data: {
                    id:              '{{task.id}}',
                    name:            '{{task.name}}',
                    description:     '{{task.description}}',
                    author:          '{{task.author}}',
                    'options-intro': '{{options-intro}}'
                }

            }
        },
        {
            description: 'Generate options list',
            on: '{{task.options}}',
            task: function (opt, ctx, next) {
                var options = '';
                var def;
                for (var optionName in opt.task.options) {
                    
                    def = opt.task.options[optionName].default;
                    switch (typeof def) {
                    case 'string':
                        def = '"' + def + '"';
                        break;
                    case 'boolean':
                        def = def ? 'true' : 'false';
                    }
                    // put option name and possibly flag of mandatory
                    options += '- `' + (def === undefined ? '*' : '') + optionName + '`';
                    // put default if it exists
                    options += (def !== undefined ? ' *(' + opt.task.options[optionName].default + ')*' : '');
                    // put description
                    options += ': ' + opt.task.options[optionName].description + '\n';
                }

                opt.optionsList = options;

                next();
            }
        },
        {
            description: 'Put options in README.md',
            on: '{{task.options}}',
            task: 'scaffolding-replace',
            options: {
                files: 'README.md',
                data: {
                    options: '{{optionsList}}'
                }
            }
        },
        {
            description: 'Setup package.json with the task info',
            task: function (opt, ctx, next) {
                if (!fs.existsSync('./package.json')) {
                    ctx.log.warnln('No "package.json" file found. It\'s good practice to create one.');

                    return next();
                }

                var pkg         = require(path.resolve('./package.json'));
                pkg.name        = 'autofile-' + opt.task.id;
                pkg.description = opt.task.description;
                pkg.author      = opt.task.author;
                pkg.main        = path.basename(opt.autofile);
                fs.writeFileSync('./package.json', JSON.stringify(pkg, null, '  '));

                next();
            }
        }
    ]
};

module.exports = task;