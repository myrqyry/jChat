import $ from 'jquery';
window.$ = $;

import tinycolor from 'tinycolor2';
window.tinycolor = tinycolor;

import twemoji from 'twemoji';
window.twemoji = twemoji;

import ReconnectingWebSocket from 'reconnecting-websocket';
window.ReconnectingWebSocket = ReconnectingWebSocket;

import { gsap } from 'gsap';
window.gsap = gsap;

import { themes, loadCustomThemes, saveCustomTheme } from './themes.js';
window.themes = themes;
window.saveCustomTheme = saveCustomTheme;
loadCustomThemes();

import './settings.js';
import './utils.js';
import './script.js';