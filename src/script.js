function fadeOption(event) {
    if ($fade_bool.is(':checked')) {
        $fade.removeClass('hidden');
        $fade_seconds.removeClass('hidden');
    } else {
        $fade.addClass('hidden');
        $fade_seconds.addClass('hidden');
    }
}

function sizeUpdate(event) {
    updatePreviewCSS();
}

function fontUpdate(event) {
    updatePreviewCSS();
}

function strokeUpdate(event) {
    updatePreviewCSS();
}

function shadowUpdate(event) {
    updatePreviewCSS();
}

function capsUpdate(event) {
    updatePreviewCSS();
}

function updatePreviewCSS() {
    const config = {
        size: Number($size.val()),
        font: Number($font.val()),
        stroke: Number($stroke.val()),
        shadow: Number($shadow.val()),
        smallCaps: $small_caps.is(':checked')
    };
    setPreviewCSSVariables(config);
}

function saveCustomTheme() {
    const themeName = $('#custom_theme_name').val().trim();
    if (!themeName) {
        alert('Please enter a theme name');
        return;
    }

    const config = {
        size: Number($size.val()),
        font: Number($font.val()),
        stroke: Number($stroke.val()),
        shadow: Number($shadow.val()),
        bots: $bots.is(':checked'),
        hide_commands: $commands.is(':checked'),
        hide_badges: $badges.is(':checked'),
        animate: $animate.is(':checked'),
        fade: $fade_bool.is(':checked') ? Number($fade.val()) : false,
        small_caps: $small_caps.is(':checked')
    };

    const { saveCustomTheme: saveTheme } = window;
    saveTheme(themeName, config);

    // Clear the input
    $('#custom_theme_name').val('');

    // Repopulate the theme selector
    populateThemeSelector();

    // Select the newly saved theme
    $theme.val(themeName);

    alert(`Theme "${themeName}" saved successfully!`);
}

function populateThemeSelector() {
    const { themes } = window;
    const $theme = $('#theme');

    // Clear existing options except the first one
    $theme.find('option:not(:first)').remove();

    // Add theme options
    Object.entries(themes).forEach(([key, theme]) => {
        const $option = $('<option>')
            .val(key)
            .text(theme.name)
            .attr('title', theme.description);
        $theme.append($option);
    });
}

function badgesUpdate() {
    // Update badge visibility based on the hide_badges checkbox
    const hideBadges = $badges.is(':checked');
    const badges = $('#example .badge');

    if (hideBadges) {
        badges.hide();
    } else {
        badges.show();
    }
}

function applyTheme(themeName) {
    if (!themeName) return;

    const { themes } = window;
    const theme = themes[themeName];
    if (!theme) return;

    const config = theme.config;

    // GSAP animation for smooth theme transition
    const tl = gsap.timeline();

    // Fade out current preview
    tl.to('#example', {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
    });

    // Apply new configuration
    tl.call(() => {
        $size.val(config.size);
        $font.val(config.font);
        $stroke.val(config.stroke || 0);
        $shadow.val(config.shadow || 0);
        $bots.prop('checked', config.bots);
        $commands.prop('checked', config.hide_commands);
        $badges.prop('checked', config.hide_badges);
        $animate.prop('checked', config.animate);
        $small_caps.prop('checked', config.small_caps);

        if (config.fade) {
            $fade_bool.prop('checked', true);
            $fade.val(config.fade);
            $fade.removeClass('hidden');
            $fade_seconds.removeClass('hidden');
        } else {
            $fade_bool.prop('checked', false);
            $fade.addClass('hidden');
            $fade_seconds.addClass('hidden');
        }

        updatePreviewCSS();
        badgesUpdate();
    });

    // Fade back in with new theme
    tl.to('#example', {
        opacity: 1,
        duration: 0.5,
        ease: "power2.in"
    });
}

function setPreviewCSSVariables(config) {
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
        0: 'none',
        1: '1px black', // Thin
        2: '2px black', // Medium
        3: '3px black', // Thick
        4: '4px black'  // Thicker
    };
    root.setProperty('--chat-text-stroke', strokeConfigs[config.stroke] || 'none');

    // Shadow variables
    const shadowConfigs = {
        0: 'none',
        1: '1px 1px 2px black', // Small
        2: '2px 2px 4px black', // Medium
        3: '2px 2px 6px black'  // Large
    };
    root.setProperty('--chat-text-shadow', shadowConfigs[config.shadow] || 'none');

    // Font variant
    root.setProperty('--chat-font-variant', config.smallCaps ? 'small-caps' : 'normal');
}

function generateURL(event) {
    event.preventDefault();

    const channel = $channel.val();
    const generatedUrl = 'overlay.html?config=' + channel;

    let data = {
        size: $size.val(),
        font: $font.val(),
        stroke: ($stroke.val() != '0' ? $stroke.val() : false),
        shadow: ($shadow.val() != '0' ? $shadow.val() : false),
        bots: $bots.is(':checked'),
        hide_commands: $commands.is(':checked'),
        hide_badges: $badges.is(':checked'),
        animate: $animate.is(':checked'),
        fade: ($fade_bool.is(':checked') ? $fade.val() : false),
        small_caps: $small_caps.is(':checked')
    };

    localStorage.setItem('jchat_config_' + channel, JSON.stringify(data));

    $url.val(generatedUrl);

    $generator.addClass('hidden');
    $result.removeClass('hidden');
}

function changePreview(event) {
    if ($example.hasClass("white")) {
        $example.removeClass("white");
        $brightness.attr('src', "img/light.png");
    } else {
        $example.addClass("white");
        $brightness.attr('src', "img/dark.png");
    }
}

function copyUrl(event) {
    navigator.clipboard.writeText($url.val());

    $alert.css('visibility', 'visible');
    $alert.css('opacity', '1');
}

function showUrl(event) {
    $alert.css('opacity', '0');
    setTimeout(function() {
        $alert.css('visibility', 'hidden');
    }, 200);
}

function resetForm(event) {
    $channel.val('');
    $size.val('3');
    $font.val('0');
    $stroke.val('0');
    $shadow.val('0');
    $bots.prop('checked', false);
    $commands.prop('checked', false);
    $badges.prop('checked', false);
    $animate.prop('checked', false);
    $fade_bool.prop('checked', false);
    $fade.addClass('hidden');
    $fade_seconds.addClass('hidden');
    $fade.val("30");
    $small_caps.prop('checked', false);

    updatePreviewCSS();
    badgesUpdate();
    if ($example.hasClass("white"))
        changePreview();

    $result.addClass('hidden');
    $generator.removeClass('hidden');
    showUrl();
}

const $generator = $("form[name='generator']");
const $channel = $('input[name="channel"]');
const $theme = $('#theme');
const $animate = $('input[name="animate"]');
const $bots = $('input[name="bots"]');
const $fade_bool = $("input[name='fade_bool']");
const $fade = $("input[name='fade']");
const $fade_seconds = $("#fade_seconds");
const $commands = $("input[name='commands']");
const $small_caps = $("input[name='small_caps']");
const $badges = $("input[name='badges']");
const $size = $("select[name='size']");
const $font = $("select[name='font']");
const $stroke = $("select[name='stroke']");
const $shadow = $("select[name='shadow']");
const $brightness = $("#brightness");
const $example = $('#example');
const $result = $("#result");
const $url = $('#url');
const $alert = $("#alert");
const $reset = $("#reset");

$fade_bool.change(fadeOption);
$size.change(updatePreviewCSS);
$font.change(updatePreviewCSS);
$stroke.change(updatePreviewCSS);
$shadow.change(updatePreviewCSS);
$small_caps.change(updatePreviewCSS);
$theme.change(function() {
    applyTheme($(this).val());
});
$badges.change(badgesUpdate);
$generator.submit(generateURL);
$brightness.click(changePreview);
$url.click(copyUrl);
$alert.click(showUrl);
$reset.click(resetForm);
$('#save_theme').click(saveCustomTheme);

// Initialize theme selector
populateThemeSelector();