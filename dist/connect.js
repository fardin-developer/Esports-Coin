"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
function startBot() {
    return __awaiter(this, void 0, void 0, function* () {
        // Authentication setup
        const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)('./auth');
        const sock = (0, baileys_1.default)({
            auth: state,
            printQRInTerminal: true, // Automatically print QR code in terminal
        });
        // Save credentials on update
        sock.ev.on('creds.update', saveCreds);
        // Handle incoming messages
        sock.ev.on('messages.upsert', (event) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const message = event.messages[0]; // First message in the upsert
            if (!message.message)
                return;
            const from = message.key.remoteJid; // Sender's WhatsApp ID
            const text = message.message.conversation || ((_a = message.message.extendedTextMessage) === null || _a === void 0 ? void 0 : _a.text) || '';
            console.log(`Received message: "${text}" from ${from}`);
            // Respond based on the message content
            if (text === 'Hi') {
                yield sock.sendMessage(from, { text: 'Hello! How can I assist you today?' });
            }
            else if (text === 'Bye') {
                yield sock.sendMessage(from, { text: 'Goodbye! Have a great day!' });
            }
            else {
                yield sock.sendMessage(from, { text: 'I am a bot. Please say "Hi" or "Bye".' });
            }
        }));
        // Handle connection updates
        sock.ev.on('connection.update', (update) => {
            var _a, _b;
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const error = (_b = (_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode;
                const shouldReconnect = error !== baileys_1.DisconnectReason.loggedOut; // Reconnect unless logged out
                console.log('Connection closed. Reconnecting...', shouldReconnect);
                if (shouldReconnect)
                    startBot();
            }
            else if (connection === 'open') {
                console.log('Connected to WhatsApp!');
            }
        });
    });
}
// Start the bot
startBot();
