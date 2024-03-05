import PocketBase from "pocketbase";

import { writable } from "svelte/store";

// Hosting using pockethost
const url = 'https://complex-important.pockethost.io/'
export const db = new PocketBase(url);

// The user that is currently logged in
export const currentUser = writable(db.authStore.model);

db.authStore.onChange((user) => {
    console.log("user changed", user);
    currentUser.set(db.authStore.model);
});
