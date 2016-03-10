'use strict'; /* global Sortable */

let defaultWindow, defaultTab, port, windowList, tabList;

window.addEventListener('DOMContentLoaded', () => {
	defaultWindow = document.querySelector('#window-default');
	defaultTab = document.querySelector('.tab-default');
	windowList = document.querySelector('#windows .windows');
	tabList = document.querySelector('#playlist .tabs');
	defaultWindow.remove(); defaultTab.remove();

	port = chrome.runtime.connect();
	port.emit = function(type, ...args) { this.postMessage({ type, args, }); };

	port.onMessage.addListener(({ type, args, }) => ({
		init({ windows, playlist, active, state, }) {
			console.log('init', windows, playlist, active, state);
			Object.keys(windows).forEach(windowId => {
				const win = windows[windowId];
				const tabList = windowList.appendChild(createWindow(win)).querySelector('.tabs');
				win.tabs.forEach(tab => tabList.appendChild(createTab(tab)));
				enableDragOut(tabList);
			});
			playlist.forEach(tab => tabList.appendChild(createTab(tab)));
			enableDragIn(tabList);
			tabList.children[active] && tabList.children[active].classList.add('active');
			this.state_change(state);
		},
		state_change(state) {
			console.log('state_change', state);
			if ('playing' in state) {
				document.querySelector('#controls .button.active, *').classList.remove('active');
				document.querySelector(state.playing ? '#play' : '#pause').classList.add('active');
			}
		},
		playlist_add(index, tabId) {
			console.log('playlist_add', index, tabId);
		},
		playlist_seek(active) {
			console.log('playlist_seek', active);
		},
		playlist_delete(index) {
			console.log('playlist_delete', index);
		},
		tabs_open(tab) {
			console.log('tabs_open', tab);
		},
		tabs_close(tabId) {
			console.log('tabs_close', tabId);
		},
	})[type](...args));
});

// focus tab (windows) or play tab on dblclick
document.addEventListener('dblclick', function({ target, button, }) {
	if (button || !target.matches || !target.matches('.description, .description :not(.remove)')) { return; }

	while (!target.matches('.tab')) { target = target.parentNode; }
	if (event.target.matches('#right *')) {
		port.emit('tab_focus', target.dataset.tabId);
	} else {
		port.emit('playlist_seek', Array.prototype.indexOf.call(document.querySelector('#playlist .tabs').children, target));
	}
});

// remove tab on leftcklick on ".remove"
document.addEventListener('click', function({ target, button, }) {
	if (button || !target.matches || !target.matches('.tab .remove, .tab .remove *')) { return; }
	while (!target.matches('.tab')) { target = target.parentNode; }
	port.emit('playlist_delete', Array.prototype.indexOf.call(document.querySelector('#playlist .tabs').children, target));
	target.remove();
});

// enable drag & drop
function enableDragOut(element) {
	return (element.sortable = new Sortable(element, {
		group: {
			name: 'playlist',
			pull: 'clone',
			put: false,
		},
		handle: '.icon',
		draggable: '.tab',
		ghostClass: 'ghost',
		animation: 500,
		scroll: true,
		scrollSensitivity: 90,
		scrollSpeed: 10,
		sort: false,
	}));
}
function enableDragIn(element) {
	return (element.sortable = new Sortable(element, {
		group: {
			name: 'playlist',
		},
		handle: '.icon',
		draggable: '.tab',
		ghostClass: 'ghost',
		animation: 500,
		scroll: true,
		scrollSensitivity: 90,
		scrollSpeed: 10,
		onSort: function({ newIndex, oldIndex, target, from, item, }) {
			if (newIndex === oldIndex && from === target) { return; }
			from === target && port.emit('playlist_delete', oldIndex);
			port.emit('playlist_add', newIndex, item.dataset.tabId);
		},
	}));
}

function createWindow(win) {
	return updateWindow(defaultWindow.cloneNode(true), win);
}

function updateWindow(element, { id, title, }) {
	element.id = 'window-'+ id;
	element.querySelector('label.toggleswitch').htmlFor = 'windowToggle-'+ id;
	element.querySelector('input.toggleswitch').id = 'windowToggle-'+ id;
	element.querySelector('.title').textContent = title || id;
	return element;
}

function createTab(tab) {
	return updateTab(defaultTab.cloneNode(true), tab);
}

function updateTab(element, { tabId, videoId, title, duration, }) {
	element.dataset.tabId = tabId;
	element.className = element.className.replace(/tab-[^ ]*/, 'tab-'+ tabId).replace(/video-[^ ]*/, 'video-'+ videoId);
	element.querySelector('.title').textContent = title;
	element.querySelector('.duration').textContent = duration || '?:??';
	element.querySelector('.icon').style.backgroundImage = `url(\'https://i.ytimg.com/vi/${ videoId }/default.jpg\')`;
	return element;
}

/*function createWindow(win, id) {
	return createElement('div', {
		className: 'window',
		id: 'window'+ (win.id || id),
	}, [
		createElement('div', {
			className: 'header',
		}, [
			createElement('label', {
				className: 'toggleswitch',
				htmlFor: 'windowToggle-'+ (win.id || id),
				textContent: win.title,
			}),
		]),
		createElement('input', {
			className: 'toggleswitch',
			id: 'windowToggle-'+ (win.id || id),
			type: 'checkbox',
			checked: true,
		}),
		createElement('ul', {
			className: 'tabs',
		}, win.tabs && win.tabs.map(createTab)),
	]);
}*/
/*function createTab(tab) {
	return createElement('div', {
		className: 'tab tab-'+ tab.tabId +' video-'+ tab.videoId,
	}, [
		createElement('div', {
			className: 'icon',
			style: { backgroundImage: `url(\'https://i.ytimg.com/vi/${ tab.videoId }/default.jpg\')`, },
		}),
		createElement('div', {
			className: 'description',
		}, [
			createElement('span', {
				className: 'title',
				textContent: tab.title,
			}),
			createElement('span', {
				className: 'duration',
				textContent: tab.duration || '?:??',
			}),
			createElement('div', {
				className: 'remove',
				textContent: '⨉',
			}),
		]),
	]);
}*/
