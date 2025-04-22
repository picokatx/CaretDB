<template>
    <Toolbar class="my-3 mx-1 p-3">
        <template #start>
            <div class="flex">
                <a href="/" class="spynet-nav">
                    <Button icon="pi pi-home" aria-label="Landing" text plain />
                </a>
                <a href="/database" class="spynet-nav">
                    <Button id="database-link" label="Database" text plain />
                </a>
                <a href="/references" class="spynet-nav">
                    <Button id="references-link" label="References" text plain />
                </a>
            </div>
        </template>
        <template #end>
            <div class="flex">
                <a href="/login" class="spynet-nav">
                    <Button id="login-link" label="Login" text plain />
                </a>
            </div>
        </template>
    </Toolbar>
</template>

<style lang="scss">
@use "../../node_modules/primeflex/primeflex.min.css";
@use "../../node_modules/aos/dist/aos.css";
@use "../../src/styles/app.css";
</style>