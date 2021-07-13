const NAV_API_URL =
	'https://perf-analysis-api.herokuapp.com/v1/navigations/add';
const RESOURCE_API_URL =
	'https://perf-analysis-api.herokuapp.com/v1/resources/add';
const PAINT_API_URL = 'https://perf-analysis-api.herokuapp.com/v1/paints/add';
const postData = (url, data) =>
	fetch(url, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
		},
	}).then((res) => res.json());
const postPaints = () =>
	performance.getEntriesByType('paint').forEach((paint) => {
		postData(PAINT_API_URL, paint);
	});
const postNavigations = () =>
	performance.getEntriesByType('navigation').forEach((navigation) => {
		postData(NAV_API_URL, navigation);
	});
const postResources = () =>
	performance.getEntriesByType('resource').forEach((resource) => {
		postData(RESOURCE_API_URL, resource);
	});

function startAnalysis() {
	const browser = {
		isEdge: /Edge/.test(navigator.userAgent),
		isFirefox: /Firefox/.test(navigator.userAgent),
		isChrome: /Google Inc/.test(navigator.vendor),
		isChromeIOS: /CriOS/.test(navigator.userAgent),
		isIE: /Trident/.test(navigator.userAgent),
	};
	if (browser.isEdge || browser.isIE) return;

	console.log('analysis starting');
	if (performance) {
		window.addEventListener('load', (event) => {
			postResources();
			postNavigations();
			postPaints();
			postData(NAV_API_URL, {
				name: 'navigation',
				initiatorType: 'window_load',
				responseStart: event.timeStamp,
				responseEnd: 0,
				fetchStart: 0,
			});
		});
	}

	document.addEventListener('readystatechange', (event) => {
		postData(NAV_API_URL, {
			name: 'navigation',
			initiatorType: 'readystatechange',
			type: document.readyState,
			responseStart: event.timeStamp,
			responseEnd: 0,
			fetchStart: 0,
		});
	});

	document.addEventListener('DOMContentLoaded', (event) => {
		postData(NAV_API_URL, {
			name: 'navigation',
			initiatorType: 'DOMContentLoaded',
			responseStart: event.timeStamp,
			responseEnd: 0,
			fetchStart: 0,
		});
	});
}

(function () {
	startAnalysis();
})();
