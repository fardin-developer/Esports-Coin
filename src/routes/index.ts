import express from 'express';
import message from './messages';
import qrRoute from './qr';
import user from './user';
import webhook from './webhook';
import instanceRoute from './instance';
import notificationRoute from './notifications';

const setupRoutes = (app: express.Application) => {
    app.use('/api/v1/user', user);
    app.use('/api/v1/qr', qrRoute);
    app.use('/api/v1/instance', instanceRoute);
    app.use('/api/v1/webhook', webhook);
    app.use('/api/v1/message', message);
    app.use('/api/v1/subscribe', notificationRoute);
};

export default setupRoutes;
