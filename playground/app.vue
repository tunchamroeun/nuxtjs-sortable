<template>
  <div class="playground">
    <h1>@typed-draggable/nuxt Playground</h1>

    <div class="demo-section">
      <h2>Simple List Demo</h2>
      <p class="description">
        Drag and drop items to reorder them
      </p>

      <ClientOnly>
        <Draggable
          v-model="items"
          item-key="id"
          class="draggable-list"
          ghost-class="ghost"
          @change="onChange"
        >
          <template #item="{ element }">
            <div class="draggable-item">
              <span class="drag-handle">⠿</span>
              {{ element.name }}
            </div>
          </template>
        </Draggable>
      </ClientOnly>
    </div>

    <div class="demo-section">
      <h2>External Component Demo (Accordion)</h2>
      <p class="description">
        Using a custom component as the wrapper via :tag prop
      </p>

      <ClientOnly>
        <Draggable
          v-model="accordionItems"
          :tag="AccordionContainer"
          :component-data="{ class: 'accordion-wrapper' }"
          item-key="name"
          ghost-class="ghost"
        >
          <template #item="{ element }">
            <AccordionItem
              :title="element.title"
              :name="element.name"
            >
              <div>{{ element.description }}</div>
            </AccordionItem>
          </template>
        </Draggable>
      </ClientOnly>
    </div>

    <div class="demo-section">
      <h2>Two Lists Demo</h2>
      <p class="description">
        Drag items between the two lists
      </p>

      <div class="two-lists">
        <ClientOnly>
          <div class="list-container">
            <h3>List A</h3>
            <Draggable
              v-model="listA"
              item-key="id"
              group="shared"
              class="draggable-list"
              ghost-class="ghost"
            >
              <template #item="{ element }">
                <div class="draggable-item list-a-item">
                  {{ element.name }}
                </div>
              </template>
            </Draggable>
          </div>

          <div class="list-container">
            <h3>List B</h3>
            <Draggable
              v-model="listB"
              item-key="id"
              group="shared"
              class="draggable-list"
              ghost-class="ghost"
            >
              <template #item="{ element }">
                <div class="draggable-item list-b-item">
                  {{ element.name }}
                </div>
              </template>
            </Draggable>
          </div>
        </ClientOnly>
      </div>
    </div>

    <div class="demo-section">
      <h2>With Header &amp; Footer Slots</h2>
      <p class="description">
        Draggable with header and footer slots
      </p>

      <ClientOnly>
        <Draggable
          v-model="slotItems"
          item-key="id"
          class="draggable-list"
          ghost-class="ghost"
          @change="onSlotChange"
        >
          <template #header>
            <div class="slot-header">
              📋 Draggable Items (Header Slot)
            </div>
          </template>
          <template #item="{ element }">
            <div class="draggable-item slot-item">
              <span class="drag-handle">◈</span>
              {{ element.name }}
            </div>
          </template>
          <template #footer>
            <div class="slot-footer">
              ✨ End of list (Footer Slot)
            </div>
          </template>
        </Draggable>
      </ClientOnly>
    </div>

    <div class="demo-section">
      <h2>Current State</h2>
      <pre class="state-display">{{ JSON.stringify({ items, listA, listB, slotItems, accordionItems }, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

interface Item {
  id: number
  name: string
}

interface AccordionItem {
  name: string
  title: string
  description: string
}

// Example: Custom external component passed via :tag prop
// This simulates how you'd use el-collapse or similar components
const AccordionContainer = defineComponent({
  name: 'AccordionContainer',
  setup(_, { slots }) {
    return () => h('div', { class: 'accordion-container' }, slots.default?.())
  },
})

// Example: Accordion item component (like el-collapse-item)
const AccordionItem = defineComponent({
  name: 'AccordionItem',
  props: {
    title: { type: String, required: true },
    name: { type: String, required: true },
  },
  setup(props, { slots }) {
    const isOpen = ref(false)
    return () => h('div', {
      'class': ['accordion-item', { 'is-open': isOpen.value }],
      'data-draggable': true,
    }, [
      h('div', {
        class: 'accordion-header',
        onClick: () => { isOpen.value = !isOpen.value },
      }, [
        h('span', { class: 'accordion-arrow' }, isOpen.value ? '▼' : '▶'),
        h('span', { class: 'accordion-title' }, props.title),
        h('span', { class: 'drag-indicator' }, '⋮⋮'),
      ]),
      isOpen.value ? h('div', { class: 'accordion-content' }, slots.default?.()) : null,
    ])
  },
})

const items = ref<Item[]>([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
  { id: 4, name: 'Item 4' },
  { id: 5, name: 'Item 5' },
])

const accordionItems = ref<AccordionItem[]>([
  { name: '1', title: 'Section 1: Getting Started', description: 'Welcome to the accordion demo. Drag items to reorder them!' },
  { name: '2', title: 'Section 2: Configuration', description: 'Configure your settings here. This panel can be reordered.' },
  { name: '3', title: 'Section 3: Advanced Options', description: 'Advanced options for power users. Drag to change priority.' },
  { name: '4', title: 'Section 4: Help & Support', description: 'Need help? Check out our documentation and support resources.' },
])

const listA = ref<Item[]>([
  { id: 6, name: 'Apple' },
  { id: 7, name: 'Banana' },
  { id: 8, name: 'Cherry' },
])

const listB = ref<Item[]>([
  { id: 9, name: 'Dog' },
  { id: 10, name: 'Elephant' },
  { id: 11, name: 'Fox' },
])

const slotItems = ref<Item[]>([
  { id: 12, name: '💎 Diamond' },
  { id: 13, name: '🔮 Crystal' },
  { id: 14, name: '⚡ Lightning' },
  { id: 15, name: '🌈 Rainbow' },
])

function onChange(event: unknown) {
  console.log('Change event:', event)
}

function onSlotChange(event: unknown) {
  console.log('Slot demo change event:', event)
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
  margin: 0;
  padding: 20px;
}

.playground {
  max-width: 900px;
  margin: 0 auto;
  color: #e4e4e4;
}

h1 {
  text-align: center;
  color: #00d9ff;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
}

h2 {
  color: #ff6b9d;
  margin-bottom: 0.5rem;
}

h3 {
  color: #ffd93d;
  margin: 0 0 1rem 0;
  text-align: center;
}

.description {
  color: #888;
  margin-bottom: 1rem;
}

.demo-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.draggable-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 100px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.draggable-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #2d2d44 0%, #1f1f35 100%);
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.draggable-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 217, 255, 0.3);
}

.draggable-item:active {
  cursor: grabbing;
}

.drag-handle {
  color: #666;
  font-size: 1.2rem;
}

.ghost {
  opacity: 0.5;
  background: linear-gradient(135deg, #00d9ff 0%, #6b5ce7 100%) !important;
}

.two-lists {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.list-container {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 1rem;
}

.list-a-item {
  background: linear-gradient(135deg, #2d4460 0%, #1a2d42 100%) !important;
  border-color: rgba(0, 217, 255, 0.2) !important;
}

.list-b-item {
  background: linear-gradient(135deg, #442d44 0%, #2d1a2d 100%) !important;
  border-color: rgba(255, 107, 157, 0.2) !important;
}

.slot-item {
  background: linear-gradient(135deg, #4a2d60 0%, #2d1a40 100%) !important;
  border-color: rgba(180, 107, 255, 0.3) !important;
}

.slot-item:hover {
  border-color: rgba(180, 107, 255, 0.6) !important;
  box-shadow: 0 4px 12px rgba(180, 107, 255, 0.2);
}

.slot-header,
.slot-footer {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.slot-header {
  background: linear-gradient(135deg, rgba(180, 107, 255, 0.2) 0%, rgba(140, 80, 200, 0.1) 100%);
  border: 1px dashed rgba(180, 107, 255, 0.4);
  color: #d4b8ff;
  margin-bottom: 8px;
}

.slot-footer {
  background: linear-gradient(135deg, rgba(140, 80, 200, 0.1) 0%, rgba(180, 107, 255, 0.2) 100%);
  border: 1px dashed rgba(180, 107, 255, 0.4);
  color: #d4b8ff;
  margin-top: 8px;
}

.state-display {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.875rem;
  color: #6bff9e;
  border: 1px solid rgba(107, 255, 158, 0.2);
}

@media (max-width: 600px) {
  .two-lists {
    grid-template-columns: 1fr;
  }
}

/* Accordion styles - for external component demo */
.accordion-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.accordion-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.accordion-item {
  background: linear-gradient(135deg, #2d3a4d 0%, #1f2a38 100%);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
}

.accordion-item:hover {
  border-color: rgba(0, 217, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.accordion-item.is-open {
  border-color: rgba(0, 217, 255, 0.3);
}

.accordion-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.accordion-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.accordion-arrow {
  color: #00d9ff;
  font-size: 0.75rem;
  width: 16px;
  transition: transform 0.2s ease;
}

.accordion-title {
  flex: 1;
  font-weight: 500;
  color: #e4e4e4;
}

.drag-indicator {
  color: #666;
  cursor: grab;
  font-size: 1rem;
  letter-spacing: 2px;
}

.drag-indicator:active {
  cursor: grabbing;
}

.accordion-content {
  padding: 0 16px 14px 44px;
  color: #aaa;
  font-size: 0.9rem;
  line-height: 1.5;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
