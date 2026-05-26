import {io} from 'socket.io-client';

export const socket = io('http://192.168.192.120:4000', {
    transports: ['websocket'],
});
