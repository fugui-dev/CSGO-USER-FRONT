<script setup>
import Layout from '@/components/Layout.vue'

</script>

<template>
    <div>
        <Layout>
            <template #item>
                <div class="tw-flex tw-justify-center tw-w-full tw-font-MicrosoftYaHei ">

                    <router-view />

                </div>
            </template>
        </Layout>
    </div>
</template>