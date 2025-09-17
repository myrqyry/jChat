import tinycolor from 'tinycolor2';
window.tinycolor = tinycolor;

import twemoji from 'twemoji';
window.twemoji = twemoji;

import ReconnectingWebSocket from 'reconnecting-websocket';
window.ReconnectingWebSocket = ReconnectingWebSocket;

import './irc-message.js';
import '../settings.js';
import './utils.js';
import './script.js';

import { messages } from './store.js';
window.messages = messages;

import App from './App.svelte';
new App({ target: document.getElementById('app') });