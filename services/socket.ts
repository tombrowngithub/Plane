import {io} from 'socket.io-client';

export const socket = io('http://10.72.4.120:4000', {
    transports: ['websocket'],
});
