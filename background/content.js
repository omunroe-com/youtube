(function(global) { 'use strict'; define(async ({ // This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
	'node_modules/web-ext-utils/loader/': { ContentScript, },
	'node_modules/web-ext-utils/utils/files': { readdir, },
	'common/options': options,
	VideoInfo,
}) => {

const content = new ContentScript({
	runAt: 'document_start',
	include: [ 'https://www.youtube.com/*', 'https://gaming.youtube.com/*', ],
	modules: [
		// every script in the /content/ folder
		...readdir('content').filter(_=>_.endsWith('.js')).map(name => 'content/'+ name.slice(0, -3)),

		// and their dependencies (this is just for a slight performance increase)
		'node_modules/es6lib/concurrent', // check for removal
		'node_modules/es6lib/dom',
		'node_modules/es6lib/functional',
		'node_modules/es6lib/object',
		'node_modules/es6lib/observer',
		'node_modules/es6lib/string',
		'node_modules/web-ext-utils/browser/index',
		'node_modules/web-ext-utils/browser/messages',
		'node_modules/web-ext-utils/browser/version',
		'node_modules/web-ext-utils/options/index',
		'node_modules/web-ext-utils/utils/event',
		'node_modules/web-ext-utils/lib/multiport/',
		'common/event-emitter',
	],
});

options.incognito.whenChange(([ value, ]) => {
	content.incognito = value;
});

content.onMatch(async frame => {
	const port = (await frame.connect('VideoInfo')).addHandlers(VideoInfo);
	frame.onUnload(() => port.destroy());
});

return content;

}); })(this);
