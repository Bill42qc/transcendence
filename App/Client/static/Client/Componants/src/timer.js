export function timer(time) {
        let lastUpdateTime = Date.now();
        const updateInterval = time; // in ms, 1000 milliseconds = 1 second
    
        return function () {
        const currentTime = Date.now();
        const elapsedTime = currentTime - lastUpdateTime;
    
        if (elapsedTime >= updateInterval) {
            lastUpdateTime = currentTime;
            return true; // Trigger the update
        }
    
        return false; // Don't trigger the update
        };
    }