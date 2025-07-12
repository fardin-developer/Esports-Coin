import express from 'express';
import user from './allroutes/user';
// import report from './report'
import games from './allroutes/games';
import wallet from './allroutes/wallet';
import order from './allroutes/order';
import transaction from './allroutes/transaction';
import api from './allroutes/api';
import webhook from './allroutes/webhook';
import { useAuth, AuthMethod } from '../middlewares';


const setupRoutes = (app: express.Application) => {
    app.use('/api/v1/user', user);
    app.use('/api/v1/games', games);
    app.use('/api/v1/wallet', wallet);
    app.use('/api/v1/order', order);
    app.use('/api/v1/transaction', transaction);
    app.use('/api/v1/api', api);
    app.use('/api/v1/webhook', webhook);
    // app.use('/api/v1/report', useAuth([AuthMethod.JWT, AuthMethod.API_KEY]), report);
};

export default setupRoutes;
