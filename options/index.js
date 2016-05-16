'use strict';

const {
	concurrent: { async, promisifyAll, spawn, sleep, timeout, },
	dom: { clickElement, createElement, CreationObserver, notify, once, saveAs, getParent, },
	format: { hhMmSsToSeconds, numberToRoundString, timeToRoundString, QueryObject, },
	functional: { noop, Logger, log, },
	object: { copyProperties, },
	network: { HttpRequest, },
} = require('es6lib');

const { runtime: { sendMessage, }, applications: { gecko, chromium, }, storage: Storage, } = require('common/chrome');

const handleResponse = promise => promise.then(({ error, value, }) => { if (error) { throw error; } return value; });
const alert = gecko ? window.alert : message => handleResponse(sendMessage({ name: 'alert', args: [ message, ], }));
const confirm = gecko ? window.confirm : message => handleResponse(sendMessage({ name: 'confirm', args: [ message, ], }));
const prompt = gecko ? window.prompt : (message, value) => handleResponse(sendMessage({ name: 'prompt', args: [ message, value, ], }));

require('common/options')({
	defaults: require('options/defaults'),
	prefix: 'options',
	storage: Storage.sync || Storage.local,
	addChangeListener: listener => Storage.onChanged
	.addListener(changes => Object.keys(changes).forEach(key => key.startsWith('options') && listener(key, changes[key].newValue))),
}).then(options => {
window.options = options;

displayPreferences(options, document.querySelector('#options'));

document.addEventListener('click', function({ target, button, }) {
	if (button || !target.matches) { return; }
	target.className.split(/\s+/).every(_class => { switch (_class) {
		case 'remove-value-entry': {
			const element = getParent(target, '.pref-container');
			target.parentNode.remove();
			saveInput(element);
			setButtonDisabled(element);
		} break;
		case 'add-value-entry': {
			const element = getParent(target, '.pref-container');
			const container = element.querySelector('.values-container');
			const row = container.appendChild(cloneInput(element.input));
			saveInput(row.querySelector('.value-input'));
			setButtonDisabled(element);
		} break;
		case 'value-input': {
			if (target.dataset.type !== 'control') { return; }
			console.log('button clicked', target);
			const { name, } = target.parentNode.pref;
			handleResponse(sendMessage({ name: 'control', args: [ name, ], }))
			.catch(error => { console.error(error); return alert(name +' failed: '+ error.message); });
		} break;
		default: { return true; }
	} });
});

document.addEventListener('keypress', function(event) {
	const { target, } = event;
	if (!target.matches || !target.matches('.value-input') || target.dataset.type !== 'keybordKey') { return; }
	event.stopPropagation(); event.preventDefault();
	const key = (event.ctrlKey ? 'Ctrl+' : '') + (event.altKey ? 'Alt+' : '') + (event.shiftKey ? 'Shift+' : '') + event.code;
	target.value = key;
	saveInput(target);
});
document.addEventListener('change', function({ target, }) {
	if (!target.matches || !target.matches('.value-input')) { return; }
	saveInput(target);
});

function setButtonDisabled(element) {
	const container = element.querySelector('.values-container');
	const add = element.querySelector('.add-value-entry');
	if (!add) { return; }
	const { min, max, } = element.pref.values, length = container.children.length;
	add.disabled = length >= max;
	Array.prototype.forEach.call(container.querySelectorAll('.remove-value-entry'), remove => remove.disabled = length <= min);
}

function saveInput(target) {
	const element = getParent(target, '.pref-container');
	const { pref, } = element;
	const values = Array.prototype.map.call(element.querySelector('.values-container').children, getInputValue);
	try {
		pref.values = values;
		Array.prototype.forEach.call(element.querySelectorAll('.invalid'), invalid => {
			invalid.classList.remove('invalid');
			invalid.title = '';
		});
	} catch (error) {
		target.title = error && error.message || error;
		target.classList.add('invalid');
		throw error;
	}
}

function createInput(pref) {
	return Object.assign(createElement('div', {
		className: 'value-container',
	}, [
		pref.type === 'menulist'
		? createElement('select', {
			name: pref.name,
			className: 'value-input',
			dataset: {
				type: pref.type,
			},
		}, (pref.options || [ ]).map(option => createElement('option', {
			value: option.value,
			textContent: option.label,
		})))
		: createElement('input', {
			name: pref.name,
			className: 'value-input',
			dataset: {
				type: pref.type,
			},
			type: {
				control: 'button',
				bool: 'checkbox',
				boolInt: 'checkbox',
				integer: 'number',
				string: 'text',
				keybordKey: 'text',
				color: 'color',
				label: 'hidden',
			}[pref.type] || pref.type,
		}),
		pref.values.max > 1 && createElement('input', {
			type: 'button',
			value: '-',
			className: 'remove-value-entry',
		}),
		pref.unit && createElement('span', {
			textContent: pref.unit,
			className: 'value-unit'
		}),
	]), {
		pref,
	});
}

function setInputValue(input, value) {
	const { pref, firstChild: field, } = input;
	switch (pref.type) {
		case "bool":
			field.checked = value;
			break;
		case "boolInt":
			field.checked = (value === pref.on);
			break;
		case "menulist": {
			const options = Array.from(field);
			options.forEach(option => option.selected = false);
			const selected = options.find(option => option.value == value);
			selected && (selected.selected = true);
		} break;
		case "label":
			break;
		default:
			field.value = value;
			break;
	}
	return input;
}

function getInputValue(input) {
	const { pref, firstChild: field, } = input;
	switch (pref.type) {
		case "control":
			return undefined;
		case "bool":
			return field.checked;
		case "boolInt":
			return field.checked ? pref.on : pref.off;
		case "integer":
			return +field.value;
		case "label":
			return undefined;
		default:
			return field.value;
	}
}

function cloneInput(input) {
	const clone = input.cloneNode(true);
	clone.pref = input.pref;
	return clone;
}

function displayPreferences(prefs, host = document.body, parent = null) {

	prefs.forEach(pref => {
		if (pref.type === 'hidden') { return; }

		const input = createInput(pref);

		let valuesContainer;
		const element = Object.assign(host.appendChild(createElement('div', {
			className: 'pref-container type-'+ pref.type,
		}, [
			createElement('h1', {
				textContent: pref.title || pref.name,
			}),
			pref.description && createElement('h3', {
				textContent: pref.description,
			}),
			valuesContainer = createElement('div', {
				className: 'values-container',
			}),
			pref.values.max > 1 && createElement('input', {
				type: 'button',
				value: '+',
				className: 'add-value-entry',
				dataset: {
					maxLength: pref.maxLength,
					minLength: pref.minLength || 0,
				},
			}),
			pref.children.length && displayPreferences(
				pref.children,
				createElement('fieldset', {
					className: 'pref-children'+ (pref.type === 'label' || pref.values.is ? '' : 'disabled'),
				}),
				pref
			),
		])), { pref, input, });

		pref.whenChange((_, { current: values, }) => {
			while (valuesContainer.children.length < values.length) { valuesContainer.appendChild(cloneInput(input)); }
			while (valuesContainer.children.length > values.length) { valuesContainer.lastChild.remove(); }
			values.forEach((value, index) => setInputValue(valuesContainer.children[index], value));
		});

		setButtonDisabled(element);
	});
	return host;
}

});
