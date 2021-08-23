let eventsToSend = [];
let isRequestIdleCallbackScheduled
function processPendingAnalyticsEvents (deadline) {

    // Reset the boolean so future rICs can be set.
    isRequestIdleCallbackScheduled = false;

    // If there is no deadline, just run as long as necessary.
    // This will be the case if requestIdleCallback doesn’t exist.
    if (typeof deadline === 'undefined')
        deadline = { timeRemaining: function () { return Number.MAX_VALUE } };

    // Go for as long as there is time remaining and work to do.
    while (deadline.timeRemaining() > 0 && eventsToSend.length > 0) {
        const evt = eventsToSend.pop();
        evt();
    }

    // Check if there are more events still to send.
    if (eventsToSend.length > 0)
        schedulePendingEvents();
}
function schedulePendingEvents(analyticsEvent) {
    if(analyticsEvent){
        eventsToSend.push(analyticsEvent);
    }
    // Only schedule the rIC if one has not already been set.
    if (isRequestIdleCallbackScheduled)
        return;

    isRequestIdleCallbackScheduled = true;

    if ('requestIdleCallback' in window) {
        // Wait at most two seconds before processing events.
        requestIdleCallback(processPendingAnalyticsEvents);
    } else {
        processPendingAnalyticsEvents();
    }
}

module.exports ={
    schedulePendingEvents
}