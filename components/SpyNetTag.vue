<template>
    <Tag :value="chip_text" class="h-1rem" rounded v-ripple />
</template>

<script lang="tsx">
export default {
    methods: {
    },
    setup(props: any) {
        const chip_text = props.params.getValue();
        return {
            chip_text
        }
    }
};
</script>