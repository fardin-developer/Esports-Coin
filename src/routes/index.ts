import express from 'express';
import message from './messages';
import qrRoute from './qr';
import user from './user';
import webhook from './webhook';
import instanceRoute from './instance';
import notificationRoute from './notifications';
import { useAuth, AuthMethod } from '../middlewares';


const setupRoutes = (app: express.Application) => {
    app.use('/api/v1/user', user);
    app.use('/api/v1/qr', useAuth([AuthMethod.JWT, AuthMethod.API_KEY]), qrRoute);
    app.use('/api/v1/instance', useAuth([AuthMethod.JWT, AuthMethod.API_KEY]), instanceRoute);
    app.use('/api/v1/webhook', useAuth([AuthMethod.JWT, AuthMethod.API_KEY]), webhook);
    app.use('/api/v1/message',useAuth([AuthMethod.API_KEY]), message);
    app.use('/api/v1/subscribe', notificationRoute);
};

export default setupRoutes;
