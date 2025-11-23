<script setup>
import Layout from '@/components/Layout.vue'
import { onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 立即滚动到页面顶部（不使用 smooth，立即执行）
const scrollToTop = () => {
  nextTick(() => {
    const container = document.getElementById('container');
    if (container) {
      container.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  });
}

onMounted(() => {
  scrollToTop()
})

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