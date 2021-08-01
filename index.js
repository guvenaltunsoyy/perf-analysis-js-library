const NAVS_API_URL =
	'https://perf-analysis-api.herokuapp.com/v1/navigations/add';
const RESOURCES_API_URL =
	'https://perf-analysis-api.herokuapp.com/v1/resources/add';
const PAINTS_API_URL = 'https://perf-analysis-api.herokuapp.com/v1/paints/add';
const postData = (url, data) =>
	fetch(url, {
		method: 'POST',
		mode: 'no-cors',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
		},
	}).then((res) => res.json());
const postPaints = () => {
	let paints = []
	performance.getEntriesByType('paint').forEach((paint) => {
		paints.push(paint)
	});
	postData(PAINTS_API_URL, paints);

}
const postNavigations = (otherNavigations) => {
	let navs =[]
	performance.getEntriesByType('navigation').forEach((navigation) => {
		navs.push(navigation);
	});
	postData(NAVS_API_URL, navs.concat(otherNavigations));
}
const postResources = () => {
	let resources=[];
	performance.getEntriesByType('resource').forEach((resource) => {
		if(!resource.name.includes('perf-analysis')){
			resources.push(resource);
		}
	});
	postData(RESOURCES_API_URL, resources);
}

function startAnalysis() {
	const browser = {
		isEdge: /Edge/.test(navigator.userAgent),
		isIE: /Trident/.test(navigator.userAgent),
	};
	if (browser.isEdge || browser.isIE) return;

	let navigationEvents = [];
	if (performance) {
		window.addEventListener('load', (event) => {
			navigationEvents.push({
				name: 'navigation',
				initiatorType: 'window_load',
				responseStart: event.timeStamp,
				fetchStart: 0,
			})
			postResources();
			postNavigations(navigationEvents);
			postPaints();
		});
	}

	document.addEventListener('readystatechange', (event) => {
		navigationEvents.push({
			name: 'navigation',
			initiatorType: 'readystatechange',
			type: document.readyState,
			responseStart: event.timeStamp,
			fetchStart: 0,
		})
	});

	document.addEventListener('DOMContentLoaded', (event) => {
		navigationEvents.push({
			name: 'navigation',
			initiatorType: 'DOMContentLoaded',
			responseStart: event.timeStamp,
			fetchStart: 0,
		})
	});
}

(function () {
	startAnalysis();
})();
