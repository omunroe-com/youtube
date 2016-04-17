'use strict'; define('content/layout', [
	'content/utils', 'es6lib',
], function(
	{ getVideoIdFromImageSrc, },
	{
		dom: { createElement, once, },
	}
) {

let zoom = null, scale = 1, scaleX = 0.5, scaleY = 0.5;
const noop = document.createElement('p');

return function(main) {
	// load style
	zoom = main.addStyle('');

	// apply 'fullscreen' class to <html> as appropriate
	main.once('optionsLoaded', ({ value: { player, }, }) => player.seamlessFullscreen && initFullscreen(main));

	// apply 'watchpage' and 'playlist' class to <html> as appropriate
	main.on('navigated', () => {
		const { options, videoId, listId, player, } = main;
		if (!videoId) {
			return document.documentElement.classList.remove('watchpage');
		}

		// add watchpage & playlist css hints
		document.documentElement.classList.add('watchpage');
		document.documentElement.classList[listId ? 'add' : 'remove']('playlist');

		if (player.root) { withPlayerElement(player.root); } else { player.once('playerElementAdded', withPlayerElement); }
		function withPlayerElement(element) {
			// use cinema mode to make progress-bar a bit larger
			options.player.cinemaMode && (element.querySelector('.ytp-size-button') || noop).click();

			// always display volume
			options.player.alwaysVolume && (element.querySelector('.ytp-volume-panel') || noop).classList.add('ytp-volume-control-hover');

			// disable annotations (and all other checkboxes in the player settings)
			if (!options.player.annotations) { hide(); setTimeout(hide, 5e4); setTimeout(hide, 12e4); }
			function hide() {
				element.querySelector('.ytp-settings-button').click();
				Array.prototype.forEach.call(element.querySelectorAll('#ytp-main-menu-id .ytp-menuitem[aria-checked="true"]'), button => button.click());
				element.querySelector('.ytp-settings-button').click();
			}

			// remove title overlay of external player
			const title = element.querySelector('.ytp-chrome-top');
			title && title.remove() === element.querySelector('.ytp-gradient-top').remove();
		}
	});

	main.once(Symbol.for('destroyed'), () => {
		document.documentElement.classList.remove('watchpage');
		document.documentElement.classList.remove('playlist');
	});

	// rotating thumb preview
	main.once('optionsLoaded', ({ value: { animateThumbs, }, }) => animateThumbs && main.addDomListener(window, 'mouseover', ({ target: image, }) => {
		if (image.nodeName !== 'IMG') { return; }
		const videoId = getVideoIdFromImageSrc(image);
		if (!videoId) { return; }
		let original = image.src;
		let index = 0;

		(function loop() {
			if (!original) { return; }
			index = index % 3 + 1;
			image.src = `https://i.ytimg.com/vi/${ videoId }/${ index }.jpg`;
			setTimeout(loop, 1000);
		})();

		once(image, 'mouseout', event => {
			image.src = original;
			original = null;
		});
	}));
};

function initFullscreen({ options, port, addDomListener, addStyleLink, }) {
	addStyleLink(chrome.extension.getURL('web/layout.css'));

	options.player.seamlessFullscreen.atStart && document.documentElement.classList.add('fullscreen');

	addDomListener(window, 'wheel', onWheel);
	function onWheel(event) {
		if (!document.documentElement.classList.contains('watchpage')) { return; }
		if (
			event.ctrlKey && event.deltaY
			&& event.target.matches('#player-api, #player-api *')
		) {
			event.preventDefault();
			scaleVideo(event, 1 + options.player.zoomFactor / 100);
		} else if (
			!options.player.seamlessFullscreen
			|| event.ctrlKey || event.altKey || event.shiftKey
		) { } else if (
			event.deltaY <= 0 && window.pageYOffset === 0
			&& event.target && event.target.matches
			&& !event.target.matches('#playlist-autoscroll-list *')
		) { // scroll to top
			options.player.seamlessFullscreen.showOnScrollTop
			&& document.documentElement.classList.add('fullscreen');
		} else if (
			options.player.seamlessFullscreen.hideOnScrollDown
			&& document.documentElement.classList.contains('fullscreen')
		) {
			document.documentElement.classList.remove('fullscreen');
			window.scrollY === 0 && event.preventDefault();
		}
	}

	options.player.seamlessFullscreen && options.player.seamlessFullscreen.showOnMouseRight
	&& addDomListener(window, 'mousemove', event => {
		options.player.seamlessFullscreen && event.pageX < (options.player.seamlessFullscreen.showOnMouseRight || 0)
		&& document.documentElement.classList.contains('watchpage')
		&& document.documentElement.classList.add('fullscreen');
	});
}

function scaleVideo(event, factor = 1.1) {
	const divisor = 1 / factor;
	const rect = document.querySelector('#player-api').getBoundingClientRect();
	scaleX = ((event.clientX - rect.left) / rect.width) * (1 - divisor) + scaleX * divisor;
	scaleY = ((event.clientY - rect.top) / rect.height) * (1 - divisor) + scaleY * divisor;
	scale = event.deltaY < 0 ? (scale * factor) : (scale / factor);

	zoom.textContent = (`
		#player-api .html5-video-container video
		{
			transform: scale(${ scale.toFixed(6) }) !important;
			transform-origin: ${ (scaleX * 100).toFixed(6) }% ${ (scaleY * 100).toFixed(6) }% !important;
		}
	`);
}

});
