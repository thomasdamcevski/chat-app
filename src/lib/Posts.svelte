<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { db, currentUser } from '$lib/database';
	import { writable } from 'svelte/store';
	import { scrollStore } from './scrollStore';

	let newMessage: string;
	let posts: any[] = [];
	let unsubscribe: () => void;

	onMount(async () => {
		const postsList = await db.collection('posts').getList(1, 50, {
			sort: 'created',
			expand: 'poster'
		});

		posts = postsList.items;

		// Realtime posts
		unsubscribe = await db.collection('posts').subscribe('*', async ({ action, record }) => {
			if (action === 'create') {
				// Get the user who posted this
				const poster = await db.collection('users').getOne(record.poster);

				record.expand = { poster };
				posts = [...posts, record]; // This line triggers Svelte's reactivity
			}

			if (action === 'delete') {
				posts = posts.filter((post) => post.id !== record.id);
			}

			scrollStore.set(true);
		});

		scrollStore.set(true);
	});

	onDestroy(() => {
		unsubscribe();
	});

	async function createPost() {
		if (!$currentUser) {
			throw new Error('User is not logged in');
		}

		const data = {
			text: newMessage,
			poster: $currentUser.id
		};

		await db.collection('posts').create(data);
	}
</script>

<div class="posts">
	{#each posts as post (post.id)}
		<div class="chat {$currentUser?.id === post.expand.poster.id ? 'chat-end' : 'chat-start'}">
			<div class="chat-header">
				{post.expand.poster.username}
				<time class="text-xs opacity-50">{post.created}</time>
			</div>
			<div class="chat-bubble">{post.text}</div>
			<div class="chat-footer opacity-50">footer</div>
		</div>
	{/each}
</div>

<div class="absolute bottom-4 left-1/4 bg-gray-200 w-1/2 p-4">
	<form on:submit|preventDefault={createPost}>
		<input placeholder="Message" type="text" bind:value={newMessage} />
		<button type="submit">Send</button>
	</form>
</div>
