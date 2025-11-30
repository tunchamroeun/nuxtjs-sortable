<template>
  <div>
    <h1>Prefix Test</h1>
    <ClientOnly>
      <VDraggable
        v-model="items"
        item-key="id"
        class="list"
      >
        <template #item="{ element }">
          <div class="item">
            {{ element.name }}
          </div>
        </template>
      </VDraggable>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
])
</script>
