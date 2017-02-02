(function(global) { 'use strict'; define(({ // This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
	'node_modules/es6lib/network': { HttpRequest, },
	'node_modules/es6lib/string': { decodeHtml, },
	'node_modules/web-ext-utils/browser/version': { gecko, edgeHTML, },
	utils: { getVideoIdFromImageSrc, },
	Templates,
}) => {

const CSS = {
	static: () => (`/* template strings confuse the syntax highlighting in Chrome and Firefox */
		.inserted-ratings
		{ position: relative; }
		.inserted-ratings>*
		{ float: left; }
		.videowall-endscreen .inserted-ratings
		{ bottom: 0 !important; position: absolute !important; width: 100% !important; }
	`),
	barHeight: barHeight => ((barHeight /= window.devicePixelRatio), `
		.video-time /* make room for ratings bar */
		{ margin-bottom: `+( barHeight )+`px !important; }
		.inserted-ratings>*
		{ height: `+( barHeight )+`px !important; }
		.related-list-item .inserted-ratings
		{ bottom: `+( barHeight + 3.5 + gecko * 0.5 - edgeHTML * 0.23 )+`px !important; }
		.related-list-item .yt-pl-thumb  .inserted-ratings
		{ bottom: `+( barHeight + 0.5 /* + gecko * 0.5 ? */ )+`px !important; }
	`),
	likesColor: likesColor => (`
		.inserted-ratings .video-extras-sparkbar-likes
		{ background-color: `+( likesColor )+` !important; }
	`),
	dislikesColor: dislikesColor => (`
		.inserted-ratings .video-extras-sparkbar-dislikes
		{ background-color: `+( dislikesColor )+` !important; }
	`),
};

const getInt = (string, regexp) => parseInt((string.match(regexp) || [0,'0',])[1].replace(/[\,\.]*/g, ''), 10);
const getString = (string, regexp) => decodeHtml((string.match(regexp) || [0,'',])[1]);
const getTime = (string, regexp) => +new Date((string.match(regexp) || [0,'',])[1]);

const loadRatingFromServer = id => HttpRequest('https://www.youtube.com/watch?v='+ id).then(({ response, }) => ({
	id,
	rating: {
		timestamp: +Date.now(),
		likes:     getInt(response,                (/like-button-renderer-like-button[^\w-].*?>([\d\.\,]+)<\//)),
		dislikes:  getInt(response,             (/like-button-renderer-dislike-button[^\w-].*?>([\d\.\,]+)<\//)),
		views:     getInt(response, (/<meta[^\/>]*?itemprop="interactionCount"[^\/>]*?content="([\d\.\,]+)">/)),
	},
	meta: {
		title: getString(response, (/<meta[^\/>]*?name="title"[^\/>]*?content="([^"]*?)">/)),
		published: getTime(response, (/<meta[^\/>]*?itemprop="datePublished"[^\/>]*?content="([^"]*?)">/)),
	},
}));

return class Ratings {
	constructor(main) {
		this.main = main;
		this.observer = null;
		this.selector = 'img, .ytp-videowall-still-image, div#image';
		this.barParentSelector = '.video-thumb, .ytp-videowall-still-image';
		this.tooltipSelector = '.yt-thumb, .yt-pl-thumb, .ytp-videowall-still';

		this.enable = this.enable.bind(this);
		this.disable = this.disable.bind(this);
		this.loadAndDisplayRating = this.loadAndDisplayRating.bind(this);

		main.once(Symbol.for('destroyed'), this.disable);

		main.once('observerCreated', () => {
			const ratingOptions = main.options.displayRatings.children;
			main.setStyle('ratings-static', CSS.static());
			[ 'barHeight', 'likesColor', 'dislikesColor', ].forEach(
				option => ratingOptions[option].whenChange(value => main.setStyle('ratings-'+ option, CSS[option](value)))
			);
			[ 'totalLifetime', 'relativeLifetime', ].forEach(
				option => ratingOptions[option].whenChange(value => (this[option] = value))
			);
			main.options.displayRatings.when({
				true: this.enable,
				false: this.disable,
			});
		});

		main.addDomListener(window, 'click', () => Array.prototype.forEach.call(document.querySelectorAll('.yt-uix-tooltip-tip'), item => item.remove()));
	}

	async loadAndDisplayRating(element) {
		const id = getVideoIdFromImageSrc(element);
		if (!id || element.dataset.rating) { return; }
		element.dataset.rating = true;
		const { port, } = this.main;
		try {
			if (this.totalLifetime < 0) {
				return void this.attatchRatingBar(element, (await loadRatingFromServer(id)));
			}
			const stored = (await port.request('db.get', id, [ 'meta', 'rating', 'viewed', ]));
			const now = Date.now(); let age;
			if (
				stored.meta && stored.rating
				&& (age = now - stored.rating.timestamp) < this.totalLifetime * 36e5
				&& age < (now - stored.meta.published) * (this.relativeLifetime / 100)
			) {
				return void this.attatchRatingBar(element, stored);
			}
			const loaded = (await loadRatingFromServer(id));
			this.attatchRatingBar(element, Object.assign(stored, loaded));
			!loaded.meta.title && (delete loaded.meta.title); !loaded.meta.published && (delete loaded.meta.published);
			(await Promise.all([
				port.request('db.set', id, { rating: loaded.rating, }),
				port.request('db.assign', id, 'meta', loaded.meta),
			]));
		} catch (error) {
			console.error(error);
			delete element.dataset.rating;
		}
	}

	attatchRatingBar(image, { rating: { likes, dislikes, views, }, meta: { published, duration, }, viewed, })  {
		const container = image.closest(this.barParentSelector) || image.parentNode;
		// element.matches('ytg-thumbnail') && (element = element.parentNode.parentNode.parentNode);
		container.insertAdjacentHTML('beforeend', Templates.ratingsBar(likes, dislikes));
		const tooltiped = (image.closest(this.tooltipSelector) || image.parentNode);
		tooltiped.classList.add('yt-uix-tooltip');
		tooltiped.title = Templates.videoInfoTitle(likes, dislikes, views, published, viewed, duration);
	}

	enable() {
		this.main.observer.all(this.selector.split(',').map(s => s +':not([data-rating="true"])').join(','), this.loadAndDisplayRating);

		const observer = this.observer = new MutationObserver(mutations => mutations.forEach(({ target: element, }) => {
			observer.takeRecords();
			if (element.dataset.rating || !element.matches || !element.matches(this.selector)) { return; }
			this.loadAndDisplayRating(element);
		}));
		observer.observe(document, { subtree: true, attributes: true, attributeFilter: [ 'src', 'style', ], });
	}

	disable() {
		this.observer && this.observer.disconnect();
		try { this.main.observer && this.main.observer.remove(this.selector.split(',').map(s => s +':not([data-rating="true"])').join(','), this.loadAndDisplayRating); } catch (_) { }
		Array.prototype.forEach.call(document.querySelectorAll('[data-rating="true"]'), element => delete element.dataset.rating);
		Array.prototype.forEach.call(document.querySelectorAll('.inserted-ratings'), element => {
			const image = element.querySelector(this.selector) || element;
			const tooltiped = image.closest(this.tooltipSelector) || image.parentNode;
			tooltiped.classList.remove('yt-uix-tooltip');
			tooltiped.removeAttribute('title');
			delete tooltiped.dataset.tooltipText;
			element.remove();
		});
	}
};

}); })(this);
