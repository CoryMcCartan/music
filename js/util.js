function createEventInterface() {
    let events = {};

    return {
        dispatch(type, data) {
            if (type in events)
                events[type].forEach(h => h(data));
        },
        addEventListener(type, handler) {
            if (type in events) 
                events[type].push(handler);
            else
                events[type] = [handler];
        },
    };
};

export default createEventInterface;
