<script lang="ts">
	import Login from '$lib/Login.svelte';
	import { db, currentUser } from '$lib/database';
	import Posts from '$lib/Posts.svelte';
</script>

<h1>Chat</h1>

{#if $currentUser}
	<Posts />
{/if}
<Login />
