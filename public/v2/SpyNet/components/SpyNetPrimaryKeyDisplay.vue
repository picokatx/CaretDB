<template>
    <i v-on:click="goto_references()" class="pi pi-link" style="color: #708090"></i>
</template>
<script lang="tsx">
// const goto_references: Ref<number, number> = useState('goto_references')
// Define the event that will be emitted
export default {
    methods: {
        goto_references() {
            console.log('yay');
            // goto_references.value += 1;
            // console.log(goto_references.value);
        }
    },
    setup(props: any) {
        const chip_text = props.params.getValue();
        return {
            chip_text
        }
    }
};
</script>