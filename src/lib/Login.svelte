<script lang="ts">
	import { currentUser, db } from '$lib/database';

	let username: string;
	let password: string;

	async function login() {
		await db.collection('users').authWithPassword(username, password);
	}

	async function signup() {
		const data = {
			username: username,
			emailVisibility: true,
			password: password,
			passwordConfirm: password
		};

		await db.collection('users').create(data);
		await login();
	}

	async function logout() {
		await db.authStore.clear();
	}
</script>

{#if $currentUser}
	<h1>Logged in as {$currentUser.username}</h1>
	<button on:click={logout}>Logout</button>
{:else}
	<form on:submit|preventDefault>
		<input placeholder="Username" type="text" bind:value={username} />
		<input placeholder="Password" type="password" bind:value={password} />
		<button on:click={signup}>Sign up</button>
		<button on:click={login}>Login</button>
	</form>
{/if}
