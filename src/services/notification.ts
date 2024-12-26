import { EventEmitter } from 'events';

export const notificationEmitter = new EventEmitter();

export function notifyNewMessage(message: any): void {
    notificationEmitter.emit('newMessage', message);
}

