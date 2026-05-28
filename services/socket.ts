import {io} from 'socket.io-client';

export const socket = io('http://10.166.188.120:4000', {
    transports: ['websocket'],
});
