<template>
  <svg
    aria-hidden="true"
    class="w-6 h-6"
  ><use
    :xlink:href="`/sprite.svg#${name}`"
    fill="none"
  /></svg>
</template>

<script lang="ts" setup>
defineProps({
  name: String,
})
</script>
