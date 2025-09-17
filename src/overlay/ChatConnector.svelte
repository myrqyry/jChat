<script>
  import { onMount, onDestroy } from 'svelte';

  // Chat is provided globally by script.js; during migration we rely on the
  // existing Chat object but control when connect() is invoked via this
  // component's lifecycle.
  let channel = (window.Chat && window.Chat.info && window.Chat.info.channel) ? window.Chat.info.channel.toLowerCase() : 'giambaj';
  let socketRef = null;

  onMount(() => {
    if (window.Chat && typeof window.Chat.connect === 'function') {
      window.Chat.connect(channel);
    }
  });

  onDestroy(() => {
    // Best-effort cleanup: if the connector attached a socket reference, try
    // to close it. The legacy Chat.connect uses a ReconnectingWebSocket which
    // handles reconnects internally; we simply attempt to close any open
    // connections to avoid orphaned sockets when the component unmounts.
    try {
      if (socketRef && socketRef.close) socketRef.close();
    } catch (e) {
      // noop
    }
  });
</script>

<!-- This component is intentionally markup-free; it only controls the
     Chat connection lifecycle. Include it once at the top-level overlay UI. -->
