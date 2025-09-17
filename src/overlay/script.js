// Minimal QueryString helper (replaces jQuery-based helper)
// Thanks to BrunoLM (https://stackoverflow.com/a/3855394)
window.QueryString = (function(search) {
    const params = {};
    if (!search) return params;
    const parts = search.replace(/^\?/, '').split('&');
    for (let i = 0; i < parts.length; ++i) {
        const param = parts[i].split('=', 2);
        if (param.length !== 2) continue;
        params[param[0]] = decodeURIComponent(param[1].replace(/\+/g, ' '));
    }
    return params;
})(window.location.search);

function setCSSVariables(config) {
    const root = document.documentElement.style;

    // Size variables
    const sizeConfigs = {
        1: { // Small
            fontSize: '20px',
            lineHeight: '30px',
            badgeSize: '16px',
            badgeMarginRight: '2px',
            badgeMarginBottom: '3px',
            badgeLastMarginRight: '3px',
            colonMarginRight: '8px',
            cheerFontWeight: '700',
            cheerMarginRight: '4px',
            cheerEmoteMaxHeight: '25px',
            cheerEmoteMarginBottom: '-6px',
            emoteMaxWidth: '75px',
            emoteHeight: '25px',
            emoteMarginRight: '-3px',
            emojiHeight: '22px'
        },
        2: { // Medium
            fontSize: '34px',
            lineHeight: '55px',
            badgeSize: '28px',
            badgeMarginRight: '4px',
            badgeMarginBottom: '6px',
            badgeLastMarginRight: '6px',
            colonMarginRight: '14px',
            cheerFontWeight: '600',
            cheerMarginRight: '7px',
            cheerEmoteMaxHeight: '42px',
            cheerEmoteMarginBottom: '-10px',
            emoteMaxWidth: '128px',
            emoteHeight: '42px',
            emoteMarginRight: '-6px',
            emojiHeight: '39px'
        },
        3: { // Large
            fontSize: '48px',
            lineHeight: '75px',
            badgeSize: '40px',
            badgeMarginRight: '5px',
            badgeMarginBottom: '8px',
            badgeLastMarginRight: '8px',
            colonMarginRight: '20px',
            cheerFontWeight: '500',
            cheerMarginRight: '10px',
            cheerEmoteMaxHeight: '60px',
            cheerEmoteMarginBottom: '-15px',
            emoteMaxWidth: '180px',
            emoteHeight: '60px',
            emoteMarginRight: '-8px',
            emojiHeight: '55px'
        }
    };

    const sizeConfig = sizeConfigs[config.size] || sizeConfigs[3];
    Object.entries(sizeConfig).forEach(([key, value]) => {
        root.setProperty(`--chat-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });

    // Font variables
    const fontConfigs = {
        0: "'Baloo Tammudu 2', cursive",
        1: "'Segoe UI', sans-serif",
        2: "'Roboto', sans-serif",
        3: "'Lato', sans-serif",
        4: "'Noto Sans JP', sans-serif",
        5: "'Source Code Pro', monospace",
        6: "'Impact', sans-serif",
        7: "'Comfortaa', cursive",
        8: "'Dancing Script', cursive",
        9: "'Indie Flower', cursive",
        10: "'Press Start 2P', monospace",
        11: "'Wallpoet', cursive"
    };
    root.setProperty('--chat-font-family', fontConfigs[config.font] || fontConfigs[0]);

    // Stroke variables
    const strokeConfigs = {
        1: '1px black', // Thin
        2: '2px black', // Medium
        3: '3px black', // Thick
        4: '4px black'  // Thicker
    };
    if (config.stroke && config.stroke > 0) {
        root.setProperty('--chat-text-stroke', strokeConfigs[config.stroke] || '3px black');
    } else {
        root.setProperty('--chat-text-stroke', 'none');
    }

    // Shadow variables
    const shadowConfigs = {
        1: '1px 1px 2px black', // Small
        2: '2px 2px 4px black', // Medium
        3: '2px 2px 6px black'  // Large
    };
    if (config.shadow && config.shadow > 0) {
        root.setProperty('--chat-text-shadow', shadowConfigs[config.shadow] || '2px 2px 6px black');
    } else {
        root.setProperty('--chat-text-shadow', 'none');
    }

    // Font variant
    root.setProperty('--chat-font-variant', config.smallCaps ? 'small-caps' : 'normal');
}

Chat = {
    info: {
        channel: null,
        animate: ('animate' in window.QueryString ? (window.QueryString.animate.toLowerCase() === 'true') : false),
        showBots: ('bots' in window.QueryString ? (window.QueryString.bots.toLowerCase() === 'true') : false),
        hideCommands: ('hide_commands' in window.QueryString ? (window.QueryString.hide_commands.toLowerCase() === 'true') : false),
        hideBadges: ('hide_badges' in window.QueryString ? (window.QueryString.hide_badges.toLowerCase() === 'true') : false),
        fade: ('fade' in window.QueryString ? parseInt(window.QueryString.fade) : false),
        size: ('size' in window.QueryString ? parseInt(window.QueryString.size) : 3),
        font: ('font' in window.QueryString ? parseInt(window.QueryString.font) : 0),
        stroke: ('stroke' in window.QueryString ? parseInt(window.QueryString.stroke) : false),
        shadow: ('shadow' in window.QueryString ? parseInt(window.QueryString.shadow) : false),
        smallCaps: ('small_caps' in window.QueryString ? (window.QueryString.small_caps.toLowerCase() === 'true') : false),
        emotes: {},
        badges: {},
        userBadges: {},
        ffzapBadges: null,
        bttvBadges: null,
        seventvBadges: null,
        chatterinoBadges: null,
        cheers: {},
        lines: [],
        blockedUsers: ('block' in $.QueryString ? $.QueryString.block.toLowerCase().split(',') : false),
        bots: ['streamelements', 'streamlabs', 'nightbot', 'moobot', 'fossabot']
    },

        loadEmotes: function(channelID) {
        Chat.info.emotes = {};
        // Small helper to fetch JSON and return a promise
        const fetchJSON = (url) => fetch(url).then(r => { if (!r.ok) throw new Error('Network error'); return r.json(); });

        // Load BTTV/FFZ cached frankerfacez endpoint
        ['emotes/global', 'users/twitch/' + encodeURIComponent(channelID)].forEach(endpoint => {
            fetchJSON('https://api.betterttv.net/3/cached/frankerfacez/' + endpoint).then(res => {
                res.forEach(emote => {
                    let imageUrl, upscale;
                    if (emote.images && emote.images['4x']) {
                        imageUrl = emote.images['4x'];
                        upscale = false;
                    } else {
                        imageUrl = (emote.images && (emote.images['2x'] || emote.images['1x'])) || null;
                        upscale = true;
                    }
                    Chat.info.emotes[emote.code] = { id: emote.id, image: imageUrl, upscale };
                });
            }).catch(()=>{});
        });

        ['emotes/global', 'users/twitch/' + encodeURIComponent(channelID)].forEach(endpoint => {
            fetchJSON('https://api.betterttv.net/3/cached/' + endpoint).then(res => {
                if (!Array.isArray(res)) {
                    res = (res.channelEmotes || []).concat(res.sharedEmotes || []);
                }
                res.forEach(emote => {
                    Chat.info.emotes[emote.code] = {
                        id: emote.id,
                        image: 'https://cdn.betterttv.net/emote/' + emote.id + '/3x',
                        zeroWidth: ["5e76d338d6581c3724c0f0b2", "5e76d399d6581c3724c0f0b8", "567b5b520e984428652809b6", "5849c9a4f52be01a7ee5f79d", "567b5c080e984428652809ba", "567b5dc00e984428652809bd", "58487cc6f52be01a7ee5f205", "5849c9c8f52be01a7ee5f79e"].includes(emote.id)
                    };
                });
            }).catch(()=>{});
        });

        ['emotes/global', 'users/' + encodeURIComponent(channelID) + '/emotes'].forEach(endpoint => {
            fetchJSON('https://api.7tv.app/v2/' + endpoint).then(res => {
                res.forEach(emote => {
                    Chat.info.emotes[emote.name] = {
                        id: emote.id,
                        image: emote.urls[emote.urls.length - 1][1],
                        zeroWidth: (emote.visibility_simple || []).includes("ZERO_WIDTH")
                    };
                });
            }).catch(()=>{});
        });
    },

    load: function(callback) {
        TwitchAPI('https://api.twitch.tv/v5/users?login=' + Chat.info.channel).done(function(res) {
            Chat.info.channelID = res.users[0]._id;
            Chat.loadEmotes(Chat.info.channelID);

            // Set CSS variables based on config
            setCSSVariables(Chat.info);

            // Load badges
            // Fetch global badges and channel badges, then FFZ room badges
            (async () => {
                try {
                    const global = await TwitchAPI('https://badges.twitch.tv/v1/badges/global/display');
                    Object.entries(global.badge_sets || {}).forEach(badge => {
                        Object.entries(badge[1].versions || {}).forEach(v => {
                            Chat.info.badges[badge[0] + ':' + v[0]] = v[1].image_url_4x;
                        });
                    });

                    const channel = await TwitchAPI('https://badges.twitch.tv/v1/badges/channels/' + encodeURIComponent(Chat.info.channelID) + '/display');
                    Object.entries(channel.badge_sets || {}).forEach(badge => {
                        Object.entries(badge[1].versions || {}).forEach(v => {
                            Chat.info.badges[badge[0] + ':' + v[0]] = v[1].image_url_4x;
                        });
                    });

                    try {
                        const res = await fetch('https://api.frankerfacez.com/v1/_room/id/' + encodeURIComponent(Chat.info.channelID)).then(r=>r.json());
                        if (res.room && res.room.moderator_badge) {
                            Chat.info.badges['moderator:1'] = 'https://cdn.frankerfacez.com/room-badge/mod/' + Chat.info.channel + '/4/rounded';
                        }
                        if (res.room && res.room.vip_badge) {
                            Chat.info.badges['vip:1'] = 'https://cdn.frankerfacez.com/room-badge/vip/' + Chat.info.channel + '/4';
                        }
                    } catch (e) {
                        // ignore
                    }
                } catch (e) {
                    // ignore
                }
            })();

            if (!Chat.info.hideBadges) {
                // Fetch other badge sources concurrently
                Promise.allSettled([
                    fetch('https://api.ffzap.com/v1/supporters').then(r => r.json()),
                    fetch('https://api.betterttv.net/3/cached/badges').then(r => r.json()),
                    fetch('https://api.7tv.app/v2/badges?user_identifier=login').then(r => r.json()),
                    fetch('https://api.chatterino.com/badges').then(r => r.json())
                ]).then(results => {
                    const [ffzap, bttv, seventv, chatterino] = results;
                    Chat.info.ffzapBadges = (ffzap.status === 'fulfilled' ? ffzap.value : []);
                    Chat.info.bttvBadges = (bttv.status === 'fulfilled' ? bttv.value : []);
                    Chat.info.seventvBadges = (seventv.status === 'fulfilled' ? (seventv.value.badges || []) : []);
                    Chat.info.chatterinoBadges = (chatterino.status === 'fulfilled' ? (chatterino.value.badges || []) : []);
                }).catch(()=>{});
            }

            // Load cheers images
                // Load cheers images
                fetch('https://api.twitch.tv/v5/bits/actions?channel_id=' + Chat.info.channelId).then(r=>r.json()).then(res=>{
                    (res.actions || []).forEach(action => {
                        Chat.info.cheers[action.prefix] = {};
                        (action.tiers || []).forEach(tier => {
                            Chat.info.cheers[action.prefix][tier.min_bits] = {
                                image: tier.images && tier.images.dark && tier.images.dark.animated && tier.images.dark.animated['4'],
                                color: tier.color
                            };
                        });
                    });
                }).catch(()=>{});

            callback(true);
        });
    },

    update: setInterval(function() {
        if (Chat.info.fade) {
            const now = Date.now();
            window.messages.update(msgs => msgs.filter(msg => (now - msg.time) / 1000 < Chat.info.fade));
        }
    }, 200),

    loadUserBadges: function(nick, userId) {
        Chat.info.userBadges[nick] = [];
        $.getJSON('https://api.frankerfacez.com/v1/user/' + nick).always(function(res) {
            if (res.badges) {
                Object.entries(res.badges).forEach(badge => {
                    var userBadge = {
                        description: badge[1].title,
                        url: 'https:' + badge[1].urls['4'],
                        color: badge[1].color
                    };
                    if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                });
            }
            Chat.info.ffzapBadges.forEach(user => {
                if (user.id.toString() === userId) {
                    var color = '#755000';
                    if (user.tier == 2) color = (user.badge_color || '#755000');
                    else if (user.tier == 3) {
                        if (user.badge_is_colored == 0) color = (user.badge_color || '#755000');
                        else color = false;
                    }
                    var userBadge = {
                        description: 'FFZ:AP Badge',
                        url: 'https://api.ffzap.com/v1/user/badge/' + userId + '/3',
                        color: color
                    };
                    if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                }
            });
            Chat.info.bttvBadges.forEach(user => {
                if (user.name === nick) {
                    var userBadge = {
                        description: user.badge.description,
                        url: user.badge.svg
                    };
                    if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                }
            });
            Chat.info.seventvBadges.forEach(badge => {
                badge.users.forEach(user => {
                    if (user === nick) {
                        var userBadge = {
                            description: badge.tooltip,
                            url: badge.urls[2][1]
                        };
                        if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                    }
                });
            });
            Chat.info.chatterinoBadges.forEach(badge => {
                badge.users.forEach(user => {
                    if (user === userId) {
                        var userBadge = {
                            description: badge.tooltip,
                            url: badge.image3 || badge.image2 || badge.image1
                        };
                        if (!Chat.info.userBadges[nick].includes(userBadge)) Chat.info.userBadges[nick].push(userBadge);
                    }
                });
            });
        });
    },

    write: function(nick, info, message) {
        if (info) {
            // Determine badges ordering (preserve legacy behavior)
            var msgBadges = [];
            if (Chat.info.hideBadges) {
                if (typeof(info.badges) === 'string') {
                    info.badges.split(',').forEach(badge => {
                        badge = badge.split('/');
                        msgBadges.push({description: badge[0], url: Chat.info.badges[badge[0] + ':' + badge[1]]});
                    });
                }
            } else {
                var badges = [];
                const priorityBadges = ['predictions', 'admin', 'global_mod', 'staff', 'twitchbot', 'broadcaster', 'moderator', 'vip'];
                if (typeof(info.badges) === 'string') {
                    info.badges.split(',').forEach(badge => {
                        badge = badge.split('/');
                        var priority = (priorityBadges.includes(badge[0]) ? true : false);
                        badges.push({
                            description: badge[0],
                            url: Chat.info.badges[badge[0] + ':' + badge[1]],
                            priority: priority
                        });
                    });
                }
                badges.forEach(badge => { if (badge.priority) msgBadges.push(badge); });
                if (Chat.info.userBadges[nick]) Chat.info.userBadges[nick].forEach(b => msgBadges.push(b));
                badges.forEach(badge => { if (!badge.priority) msgBadges.push(badge); });
            }

            // Resolve display name and color
            let color;
            if (typeof(info.color) === 'string') {
                color = (tinycolor(info.color).getBrightness() <= 50) ? tinycolor(info.color).lighten(30) : info.color;
            } else {
                // Prefer a theme palette if available. Use a deterministic hash of the nick
                // so that users get a stable color across messages.
                try {
                    const configTheme = Chat.info.theme; // may be set via saved config
                    const themeObj = (window.themes && configTheme) ? window.themes[configTheme] : null;
                    if (themeObj && Array.isArray(themeObj.palette) && themeObj.palette.length > 0) {
                        // simple deterministic hash: sum of char codes
                        let sum = 0;
                        for (let i = 0; i < nick.length; i++) sum = (sum + nick.charCodeAt(i)) >>> 0;
                        const idx = sum % themeObj.palette.length;
                        color = themeObj.palette[idx];
                    } else {
                        const twitchColors = ["#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];
                        color = twitchColors[nick.charCodeAt(0) % 15];
                    }
                } catch (e) {
                    const twitchColors = ["#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];
                    color = twitchColors[nick.charCodeAt(0) % 15];
                }
            }
            nick = info['display-name'] ? info['display-name'] : nick;

            // Action handling
            let isAction = false;
            if (/^\x01ACTION.*\x01$/.test(message)) {
                isAction = true;
                message = message.replace(/^\x01ACTION/, '').replace(/\x01$/, '').trim();
            }

            // Use centralized renderer
            // dynamic import to keep bundler happy and minimize initial bundle size
            import('./messageUtils.js').then(({ renderMessage, tokenizeMessage }) => {
                const html = renderMessage(message, info);
                const tokens = tokenizeMessage(message, info);
                window.messages.update(msgs => [...msgs, {nick, badges: msgBadges, color, message: html, messageTokens: tokens, id: info.id, time: Date.now(), isAction}].slice(-100));
            }).catch(e => {
                // Fallback: escape and push raw text
                const safe = escapeHtml(message);
                window.messages.update(msgs => [...msgs, {nick, badges: msgBadges, color, message: safe, messageTokens: [{type: 'text', value: safe}], id: info.id, time: Date.now(), isAction}].slice(-100));
            });
        }
    },

    clearChat: function(nick) {
        window.messages.update(msgs => msgs.filter(msg => msg.nick !== nick));
    },

    clearMessage: function(id) {
        window.messages.update(msgs => msgs.filter(msg => msg.id !== id));
    },

    connect: function(channel) {
        Chat.info.channel = channel;
        var title = $(document).prop('title');
        $(document).prop('title', title + Chat.info.channel);

        Chat.load(function() {
            console.log('jChat: Connecting to IRC server...');
            var socket = new ReconnectingWebSocket('wss://irc-ws.chat.twitch.tv', 'irc', { reconnectInterval: 2000 });

            socket.onopen = function() {
                console.log('jChat: Connected');
                socket.send('PASS blah\r\n');
                socket.send('NICK justinfan' + Math.floor(Math.random() * 99999) + '\r\n');
                socket.send('CAP REQ :twitch.tv/commands twitch.tv/tags\r\n');
                socket.send('JOIN #' + Chat.info.channel + '\r\n');
            };

            socket.onclose = function() {
                console.log('jChat: Disconnected');
            };

            socket.onmessage = function(data) {
                data.data.split('\r\n').forEach(line => {
                    if (!line) return;
                    var message = window.parseIRC(line);
                    if (!message.command) return;

                    switch (message.command) {
                        case "PING":
                            socket.send('PONG ' + message.params[0]);
                            return;
                        case "JOIN":
                            console.log('jChat: Joined channel #' + Chat.info.channel);
                            return;
                        case "CLEARMSG":
                            if (message.tags) Chat.clearMessage(message.tags['target-msg-id']);
                            return;
                        case "CLEARCHAT":
                            if (message.params[1]) Chat.clearChat(message.params[1]);
                            return;
                        case "PRIVMSG":
                            if (message.params[0] !== '#' + channel || !message.params[1]) return;
                            var nick = message.prefix.split('@')[0].split('!')[0];

                            if (message.params[1].toLowerCase() === "!refreshoverlay" && typeof(message.tags.badges) === 'string') {
                                var flag = false;
                                message.tags.badges.split(',').forEach(badge => {
                                    badge = badge.split('/');
                                    if (badge[0] === "moderator" || badge[0] === "broadcaster") {
                                        flag = true;
                                        return;
                                    }
                                });
                                if (flag) {
                                    Chat.loadEmotes(Chat.info.channelID);
                                    console.log('jChat: Refreshing emotes...');
                                    return;
                                }
                            }

                            if (Chat.info.hideCommands) {
                                if (/^!.+/.test(message.params[1])) return;
                            }

                            if (!Chat.info.showBots) {
                                if (Chat.info.bots.includes(nick)) return;
                            }

                            if (Chat.info.blockedUsers) {
                                if (Chat.info.blockedUsers.includes(nick)) return;
                            }

                            if (!Chat.info.hideBadges) {
                                if (Chat.info.bttvBadges && Chat.info.seventvBadges && Chat.info.chatterinoBadges && Chat.info.ffzapBadges && !Chat.info.userBadges[nick]) Chat.loadUserBadges(nick, message.tags['user-id']);
                            }

                            Chat.write(nick, message.tags, message.params[1]);
                            return;
                    }
                });
            };
        });
    }
};

window.Chat = Chat;

// If a config param exists in the URL, merge stored config into Chat.info.
// We intentionally do NOT auto-connect here. Connection is handled by a
// Svelte lifecycle component (ChatConnector) so the UI can control when the
// socket lifecycle begins. This keeps the overlay initialization deterministic
// during the Svelte migration.
if ('config' in $.QueryString) {
    const configStr = localStorage.getItem('jchat_config_' + $.QueryString.config);
    if (configStr) {
        const config = JSON.parse(configStr);
        Chat.info = { ...Chat.info, ...config };
    }
}