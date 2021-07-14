const postData = (type, data) =>
	fetch(`https://perf-analysis-api.herokuapp.com/v1/${type}/add`, {
		method: 'POST',
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
	postData("paints", paints);

}
const postNavigations = (otherNavigations) => {
	let navs =[]
	performance.getEntriesByType('navigation').forEach((navigation) => {
		navs.push(navigation);
	});
	postData("navigations", navs.concat(otherNavigations));
}
const postResources = () => {
	let resources=[];
	performance.getEntriesByType('resource').forEach((resource) => {
		if(!resource.name.includes('perf-analysis')){
			resources.push(resource);
		}
	});
	postData("resources", resources);
}

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
	let navigationEvents = [];
	if (performance) {
		window.addEventListener('load', (event) => {
			navigationEvents.push({
				name: 'navigation',
				initiatorType: 'window_load',
				responseStart: event.timeStamp,
				responseEnd: 0,
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
			responseEnd: 0,
			fetchStart: 0,
		})
	});

	document.addEventListener('DOMContentLoaded', (event) => {
		navigationEvents.push({
			name: 'navigation',
			initiatorType: 'DOMContentLoaded',
			responseStart: event.timeStamp,
			responseEnd: 0,
			fetchStart: 0,
		})
	});
}

(function () {
	startAnalysis();
})();
