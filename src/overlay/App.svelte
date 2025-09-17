<script>
  import { messages } from './store.js';
  import ChatMessage from './ChatMessage.svelte';
  import ChatConnector from './ChatConnector.svelte';
</script>

<ChatConnector />

<div class="chat_container">
  {#each $messages as msg}
    <ChatMessage nick={msg.nick} badges={msg.badges} color={msg.color} message={msg.message} isAction={msg.isAction} />
  {/each}
</div>

<style>
  .chat_container {
    padding: 20px;
    max-width: 100%;
    overflow-y: auto;
    height: 100vh;
    box-sizing: border-box;
  }
</style>