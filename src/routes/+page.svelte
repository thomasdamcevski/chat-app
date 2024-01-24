<script lang="ts">
	import Login from '$lib/Login.svelte';
	import { db, currentUser } from '$lib/database';
	import Posts from '$lib/Posts.svelte';
</script>

<div class="flex flex-row h-screen">
	<div class="basis-1/4 bg-primary-content border-r border-gray-400/20 border-x-0 p-4">
		<!-- Content for the left section -->
		<Login />
	</div>
	<div class="basis-1/2 bg-primary-content overflow-y-auto">
		<div class="basis-1/2 bg-primary-content p-4 overflow-y-auto">
			<!-- Content for the middle section -->
			<div class="mb-20">
				{#if $currentUser}
					<Posts />
				{/if}
			</div>
		</div>
	</div>
	<div class="basis-1/4 bg-gray-900 p-4">
		<!-- Content for the right section -->
	</div>
</div>
