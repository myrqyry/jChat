<script>
  import { onMount } from 'svelte';
  let { nick, badges = [], color, message, messageTokens = null, isAction = false } = $props();

  // Nothing else here; token rendering handled in markup below.
</script>

<div class="chat_line">
  <span class="user_info">
    {#each badges as badge}
      <img class="badge" src={badge.url} alt={badge.description}>
    {/each}
    <span class="nick" style="color: {color}">{nick}</span>
    {#if !isAction}<span class="colon">:</span>{/if}
  </span>
  <span class="message" class:action={isAction} style={isAction ? `color: ${color}` : ''}>
    {#if messageTokens && messageTokens.length}
      {#each messageTokens as token}
        {#if token.type === 'text'}
          {token.value}
        {:else if token.type === 'emote'}
          <img class="emote" src={token.props.src} alt="emote" />
        {:else if token.type === 'emoji'}
          <img class="emoji" src={token.props.src} alt="emoji" />
        {:else if token.type === 'cheer'}
          <img class="cheer_emote" src={token.props.src} alt="cheer" />
        {:else if token.type === 'cheer_bits'}
          <span class="cheer_bits">{token.value}</span>
        {:else}
          {token.value}
        {/if}
      {/each}
    {:else}
      {message}
    {/if}
  </span>
</div>

<style>
  .chat_line {
    font-size: var(--chat-font-size);
    line-height: var(--chat-line-height);
    font-family: var(--chat-font-family);
    -webkit-text-stroke: var(--chat-text-stroke);
    text-shadow: var(--chat-text-shadow);
    font-variant: var(--chat-font-variant);
    margin-bottom: 5px;
  }

  .user_info {
    display: inline-block;
  }

  .badge {
    width: var(--chat-badge-size);
    height: var(--chat-badge-size);
    margin-right: var(--chat-badge-margin-right);
    margin-bottom: var(--chat-badge-margin-bottom);
    vertical-align: middle;
    border-radius: 10%;
  }

  .badge:last-of-type {
    margin-right: var(--chat-badge-last-margin-right);
  }

  .colon {
    margin-right: var(--chat-colon-margin-right);
  }

  .nick {
    font-weight: bold;
  }

  .message {
    word-break: break-word;
  }

  .message.action {
    font-style: italic;
  }

  .cheer_bits {
    color: rgb(189, 98, 255);
    font-weight: var(--chat-cheer-font-weight);
    margin-right: var(--chat-cheer-margin-right);
    -webkit-text-stroke: 1px black;
  }

  .cheer_emote {
    max-height: var(--chat-cheer-emote-max-height);
    margin-bottom: var(--chat-cheer-emote-margin-bottom);
  }

  .emote {
    max-width: var(--chat-emote-max-width);
    height: var(--chat-emote-height);
    margin-right: var(--chat-emote-margin-right);
    vertical-align: middle;
  }

  .emoji {
    height: var(--chat-emoji-height);
    vertical-align: middle;
  }
</style>