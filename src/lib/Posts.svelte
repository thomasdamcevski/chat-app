<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { db, currentUser } from '$lib/database';

	let newMessage: string;
	let posts: any[] = [];
	let unsubscribe: () => void;

	onMount(async () => {
		const postsList = await db.collection('posts').getList(1, 50, {
			sort: 'created',
			order: 'desc',
			expand: 'user'
		});

		posts = postsList.items;

		// Realtime posts
		unsubscribe = await db.collection('posts').subscribe('*', async ({ action, record }) => {
			if (action === 'create') {
				// Get the user who posted this
				const poster = await db.collection('users').getOne(record.poster);

				record.expand = { poster };
				posts = [record, ...posts];
			}

			if (action === 'delete') {
				posts = posts.filter((post) => post.id !== record.id);
			}
		});
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
		<div class="pst">
			<div>
				<p class="post-text">{post.text}</p>
			</div>
		</div>
	{/each}
</div>

<form on:submit|preventDefault={createPost}>
	<input placeholder="Message" type="text" bind:value={newMessage} />
	<button type="submit">Send</button>
</form>
