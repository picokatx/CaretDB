<template>
    <div class="flex align-content-center justify-content-center h-auto" style='padding-top: 35vh;'>
        <Panel header="Login" class="">
            <FloatLabel class="p-1 my-1" variant='in'>
                <InputText id="username" v-model="username" />
                <label for="username">Username</label>
            </FloatLabel>
            <FloatLabel class="p-1 my-1" variant='in'>
                <InputText id="password" v-model="password" />
                <label for="password">Password</label>
            </FloatLabel>
            <Button class="mx-1" label="Login" />
            <Button class="mx-1" label="Register" />
        </Panel>
        <vue-particles style="position: fixed;z-index: -999;" id="tsparticles" @particles-loaded="particlesLoaded"
            :options="{
                background: {
                    opacity: {
                        value: 0
                    }
                },
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: 'repulse'
                        },
                    },
                    modes: {
                        bubble: {
                            distance: 400,
                            duration: 2,
                            opacity: 0.8,
                            size: 40
                        },
                        repulse: {
                            distance: 200,
                            duration: 0.4
                        }
                    }
                },
                particles: {
                    color: {
                        value: '#ffffff'
                    },
                    links: {
                        color: '#ffffff',
                        distance: 250,
                        enable: true,
                        opacity: 0.5,
                        width: 1
                    },
                    move: {
                        direction: 'none',
                        enable: true,
                        outModes: 'bounce',
                        random: false,
                        speed: 1,
                        straight: false
                    },
                    number: {
                        density: {
                            enable: true,
                        },
                        value: 80
                    },
                    opacity: {
                        value: 0.5
                    },
                    shape: {
                        type: 'circle'
                    },
                    size: {
                        value: { min: 1, max: 5 }
                    }
                },
                detectRetina: true
            }" />

    </div>
</template>

<style lang="scss">
@use "~/node_modules/primeflex/primeflex.min.css";
#tsparticles {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
}
</style>

<script lang="tsx">
const particlesLoaded = async (container: any) => {
    console.log("Particles container loaded", container);
};

export default {
    data: function () {
        return { username: '', password: '' };
    },
    setup() {
        return { particlesLoaded };
    }
}
</script>