import {io} from 'socket.io-client';

export const socket = io('http://10.33.253.120:4000', {
    transports: ['websocket'],
});
