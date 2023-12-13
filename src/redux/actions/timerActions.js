export const setTimer = (time) => {
    return {
        type: 'SET_TIMER',
        payload: time
    };
};


export const resetTimer = () => {
    return {
        type: 'RESET_TIMER'
    }
}

export const incrementTimer = () => {
    return {
        type: 'INCREMENT_TIMER'
    }
}