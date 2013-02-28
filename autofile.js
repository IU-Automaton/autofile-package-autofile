/*jshint es5:true*/

'use strict';

var fs = require('fs');

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
            default: 'Here\'s a list of the options that this task can take:'
        }
    },

    setup: function (opt, ctx, next) {
        opt.autofile = require(opt.autofile);

        opt.__dirname = __dirname;

        next();
    },

    tasks: [
        {
            task: 'cp',
            options: {
                files: {
                    '{{__dirname}}/README.md.tpl': 'README.md'
                }
            }
        },
        {
            task: 'scaffolding-replace',
            options: {
                files: 'README.md',
                data: {
                    id:              '{{autofile.id}}',
                    name:            '{{autofile.name}}',
                    description:     '{{autofile.description}}',
                    author:          '{{autofile.author}}',
                    'options-intro': '{{options-intro}}'
                }

            }
        },
        {
            on: '{{autofile.options}}',
            task: function (opt, ctx, next) {
                var options = '';
                var def;
                for (var optionName in opt.autofile.options) {
                    
                    def = opt.autofile.options[optionName].default;
                    switch (typeof def) {
                    case 'string':
                        def = '"' + def + '"';
                        break;
                    case 'boolean':
                        def = def ? 'true' : 'false';
                    }
                    // put option name and possibly flag of mandatory
                    options += '- **' + optionName + (def === undefined ? '*' : '') + '**';
                    // put default if it exists
                    options += (def !== undefined ? '*(' + opt.autofile.options[optionName].default + ')*' : '');
                    // put description
                    options += ': ' + opt.autofile.options[optionName].description + '\n';
                }

                opt.optionsList = options;

                next();
            }
        },
        {
            on: '{{autofile.options}}',
            task: 'scaffolding-replace',
            options: {
                files: 'README.md',
                data: {
                    options: '{{optionsList}}'
                }
            }
        }
    ]
};

module.exports = task;