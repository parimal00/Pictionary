export const SOCKET_EVENTS = {
    CONNECT: "connection",
    DISCONNECT: "disconnect",   
    JOIN_ROOM: 'room:join',
    LEAVE_ROOM: 'room:leave',
    ROOM_STATE: 'room:state_update',

    DRAW_STROKE: 'game:draw_stroke',
    CLEAR_CANVAS: 'game:clear_canvas',
    SUBMIT_GUESS: 'game:submit_guess',
    CHAT_MESSAGE: 'game:chat_message',

    ROUND_START: 'game:round_start',
    ROUND_END: 'game:round_end',
    TIMER_TICK: 'game:timer_tick',
};