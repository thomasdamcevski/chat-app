<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { db, currentUser } from '$lib/database';
	import { scrollStore } from './scrollStore';
	import { formatDistanceToNow } from 'date-fns';

	let newMessage: string;
	let posts: any[] = [];
	let unsubscribe: () => void;

	let showMenu = false;
	let menuPosition = { x: 0, y: 0 };
	let currentPostId = '';

	let showError = false;

	function toggleMenu(event: MouseEvent) {
		event.stopPropagation();
		showMenu = !showMenu;
		menuPosition = { x: event.clientX, y: event.clientY };
		currentPostId = (event.currentTarget as HTMLButtonElement).dataset.id || '';
		console.log('currentPostId', currentPostId);
	}

	function closeMenu() {
		showMenu = false;
	}

	async function deletePost() {
		console.log('Deleting post', currentPostId);
		try {
			await db.collection('posts').delete(currentPostId);
		} catch (error) {
			console.error('Error deleting post', error);
			showError = true;
			setTimeout(() => {
				showError = false;
			}, 5000);
		}
	}

	onMount(async () => {
		window.addEventListener('click', closeMenu);
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
		window.removeEventListener('click', closeMenu);
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

		// Clear the message text from the chat
		newMessage = '';
	}

	function formatTimestamp(timestamp: string) {
		const date = new Date(timestamp);
		return formatDistanceToNow(date, { addSuffix: true });
	}
</script>

<div class="posts">
	{#each posts as post (post.id)}
		<div class="chat {$currentUser?.id === post.expand.poster.id ? 'chat-end' : 'chat-start'}">
			<div class="chat-header">
				{post.expand.poster.username}
				<time class="text-xs opacity-50">{formatTimestamp(post.created)}</time>
			</div>
			<button data-id={post.id} on:click={toggleMenu}>
				<div class="chat-bubble">{post.text}</div>
			</button>
			<div class="chat-footer opacity-50"></div>
		</div>
	{/each}
</div>

<div
	class="fixed bottom-4 left-1/3 transform -translate-x-1/2 bg-gray-200 rounded-lg shadow-lg p-4 w-80"
>
	<form on:submit|preventDefault={createPost} class="flex items-center">
		<input
			placeholder="Message"
			type="text"
			class="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
			bind:value={newMessage}
		/>
		<button
			type="submit"
			class="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
			>Send</button
		>
	</form>
</div>

{#if showMenu}
	<ul
		class="menu bg-base-200 w-56 rounded-box fixed"
		style="left: {menuPosition.x}px; top: {menuPosition.y}px;"
	>
		<li>
			<!-- svelte-ignore a11y-missing-attribute -->
			<a>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/></svg
				>
				Edit
			</a>
		</li>
		<li>
			<!-- svelte-ignore a11y-missing-attribute -->
			<button on:click={() => deletePost()}>
				<svg
					class="fill-red-500"
					xmlns="http://www.w3.org/2000/svg"
					height="24"
					viewBox="0 -960 960 960"
					width="24"
					><path
						d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
					/></svg
				>
				<p class="text-red-500">Delete</p>
			</button>
		</li>
	</ul>
{/if}

{#if showError}
	<div class="toast">
		<div class="alert alert-error">
			<span>You can only delete your own posts!</span>
		</div>
	</div>
{/if}
