import twemoji from 'twemoji';

export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

export function escapeHtml(message) {
    return message
        .replace(/&/g, '&amp;')
        .replace(/(<)(?!3)/g, '&lt;')
        .replace(/(>)(?!\()/g, '&gt;');
}

// Render a message string into HTML using Chat.info emotes/cheers data.
// This function mirrors the existing logic in script.js but keeps it
// testable and importable for Svelte components.
export function renderMessage(message, info = {}) {
    // Replace Twitch emotes from tags
    let replacements = {};

    if (typeof info.emotes === 'string') {
        info.emotes.split('/').forEach(emoteData => {
            const twitchEmote = emoteData.split(':');
            const indexes = twitchEmote[1].split(',')[0].split('-');
            const aux = message.replace(/[\u1000-\uFFFF]+/g, ' ');
            const emoteCode = aux.substr(indexes[0], indexes[1] - indexes[0] + 1);
            replacements[emoteCode] = `<img class="emote" src="https://static-cdn.jtvnw.net/emoticons/v2/${twitchEmote[0]}/default/dark/3.0" />`;
        });
    }

    // Third-party emotes (BTTV/FFZ/7TV) in Chat.info.emotes
    if (window.Chat && window.Chat.info && window.Chat.info.emotes) {
        Object.entries(window.Chat.info.emotes).forEach(([code, em]) => {
            if (message.search(new RegExp(escapeRegExp(code))) > -1) {
                if (em.upscale) replacements[code] = `<img class="emote upscale" src="${em.image}" />`;
                else if (em.zeroWidth) replacements[code] = `<img class="emote" data-zw="true" src="${em.image}" />`;
                else replacements[code] = `<img class="emote" src="${em.image}" />`;
            }
        });
    }

    // Escape HTML before applying replacements
    let out = escapeHtml(message);

    // Cheers handling: if info.bits present, try to attach cheer emote & bits
    if (info.bits && parseInt(info.bits) > 0 && window.Chat && window.Chat.info && window.Chat.info.cheers) {
        const bits = parseInt(info.bits);
        let parsed = false;
        for (const [prefix, tiers] of Object.entries(window.Chat.info.cheers)) {
            const regex = new RegExp(prefix + "\\d+\\s*", 'ig');
            if (out.search(regex) > -1) {
                out = out.replace(regex, '');
                if (!parsed) {
                    let closest = 1;
                    const tierKeys = Object.keys(tiers).map(Number).sort((a, b) => a - b);
                    for (const cheerTier of tierKeys) {
                        if (bits >= cheerTier) closest = cheerTier;
                        else break;
                    }
                    out = `<img class="cheer_emote" src="${tiers[closest].image}" /><span class="cheer_bits" style="color: ${tiers[closest].color};">${bits}</span> ` + out;
                    parsed = true;
                }
            }
        }
    }

    // Apply replacements, longer keys first
    const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);
    for (const k of keys) {
        const re = new RegExp('(?<!\\S)(' + escapeRegExp(k) + ')(?!\\S)', 'g');
        out = out.replace(re, replacements[k]);
    }

    // Parse emojis using twemoji
    out = twemoji.parse(out);

    // The zero-width handling is best done at DOM time; caller can further
    // post-process if desired. Return HTML string.
    return out;
}

// Tokenize a message into an array of tokens suitable for rendering in Svelte.
// Tokens have the form: {type: 'text'|'emote'|'cheer'|'html', value: string, props?: {}}.
export function tokenizeMessage(message, info = {}) {
    // Render to HTML string
    const html = renderMessage(message, info);

    // Parse into DOM to produce robust tokens
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const body = doc.body;
        const tokens = [];

        function walk(node) {
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    if (child.textContent && child.textContent.trim() !== '') {
                        tokens.push({ type: 'text', value: child.textContent });
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const el = child;
                    if (el.tagName === 'IMG') {
                        const cls = el.getAttribute('class') || '';
                        const src = el.getAttribute('src') || '';
                        if (cls.includes('cheer_emote')) {
                            tokens.push({ type: 'cheer', props: { src } });
                        } else if (cls.includes('emoji')) {
                            tokens.push({ type: 'emoji', props: { src } });
                        } else {
                            const zw = el.hasAttribute('data-zw');
                            tokens.push({ type: 'emote', props: { src, zeroWidth: zw } });
                        }
                    } else if (el.tagName === 'SPAN' && (el.classList.contains('cheer_bits') || el.classList.contains('cheer_bits '))) {
                        tokens.push({ type: 'cheer_bits', value: el.textContent });
                    } else {
                        // For other elements, recurse and capture structure where possible
                        if (el.childNodes && el.childNodes.length) {
                            walk(el);
                        } else {
                            tokens.push({ type: 'html', value: el.outerHTML });
                        }
                    }
                }
            });
        }

        walk(body);
        return tokens;
    } catch (e) {
        // Fallback to simple split method if DOMParser not available
        const parts = html.split(/(<img[^>]*>)/g).filter(p => p !== '');
        const tokens = parts.map(part => {
            if (part.startsWith('<img')) {
                const isCheer = /class="[^\"]*cheer_emote[^\"]*"/.test(part);
                const srcMatch = part.match(/src="([^\"]+)"/);
                const src = srcMatch ? srcMatch[1] : '';
                if (isCheer) return { type: 'cheer', value: '', props: { src } };
                const zw = /data-zw="true"/.test(part);
                return { type: 'emote', value: '', props: { src, zeroWidth: zw } };
            }
            return { type: 'html', value: part };
        });
        return tokens;
    }
}

export default { escapeRegExp, escapeHtml, renderMessage };
