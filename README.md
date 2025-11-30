# @typed-draggable/nuxt

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt module for `typed-vuedraggable` - Vue.js draggable component with full TypeScript support powered by [Sortable.js](https://sortablejs.github.io/Sortable/).

- [✨ &nbsp;Release Notes](/CHANGELOG.md)

## Features

- 🚀 **Full TypeScript support** - Complete type definitions for all props and events
- 🎨 **Auto-import** - Components are automatically available in your templates
- 📦 **Small bundle** - Only includes what you need
- 🔄 **Two-way binding** - Works with `v-model` for seamless data synchronization
- 🎯 **Slot-based API** - Flexible item rendering with header and footer slots
- 🔀 **Multi-list support** - Drag and drop between multiple lists
- 🎬 **Transition support** - Works with Vue transitions out of the box

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add @typed-draggable/nuxt
```

Or install manually:

```bash
# npm
npm install @typed-draggable/nuxt

# pnpm
pnpm add @typed-draggable/nuxt

# yarn
yarn add @typed-draggable/nuxt
```

Then add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@typed-draggable/nuxt'],
  draggable: {
    // module options
    prefix: '', // optional prefix for component name
  },
})
```

That's it! You can now use the `Draggable` component in your Nuxt app ✨

## Usage

### Basic Example

```vue
<template>
  <Draggable v-model="items" item-key="id" ghost-class="ghost">
    <template #item="{ element }">
      <div class="item">{{ element.name }}</div>
    </template>
  </Draggable>
</template>

<script setup lang="ts">
interface Item {
  id: number
  name: string
}

const items = ref<Item[]>([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
])
</script>
```

### Two Lists with Shared Group

```vue
<template>
  <div class="lists">
    <Draggable v-model="listA" item-key="id" group="shared">
      <template #item="{ element }">
        <div class="item">{{ element.name }}</div>
      </template>
    </Draggable>

    <Draggable v-model="listB" item-key="id" group="shared">
      <template #item="{ element }">
        <div class="item">{{ element.name }}</div>
      </template>
    </Draggable>
  </div>
</template>
```

### With Header and Footer Slots

```vue
<template>
  <Draggable v-model="items" item-key="id">
    <template #header>
      <div class="header">Header - Not draggable</div>
    </template>

    <template #item="{ element, index }">
      <div class="item">{{ index + 1 }}. {{ element.name }}</div>
    </template>

    <template #footer>
      <div class="footer">Footer - Not draggable</div>
    </template>
  </Draggable>
</template>
```

### With Custom Tag

```vue
<template>
  <Draggable v-model="items" item-key="id" tag="ul">
    <template #item="{ element }">
      <li>{{ element.name }}</li>
    </template>
  </Draggable>
</template>
```

### With Transitions

```vue
<template>
  <Draggable v-model="items" item-key="id" tag="TransitionGroup" :component-data="{ name: 'list' }">
    <template #item="{ element }">
      <div class="item">{{ element.name }}</div>
    </template>
  </Draggable>
</template>

<style>
.list-move {
  transition: transform 0.3s;
}
</style>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `v-model` / `modelValue` | `T[]` | `null` | The list of items (two-way bound) |
| `list` | `T[]` | `null` | Alternative to v-model (one-way) |
| `itemKey` | `string \| ((item: T) => string \| number)` | **required** | Unique key for each item |
| `tag` | `string` | `'div'` | HTML tag or component name for the container |
| `clone` | `(item: T) => T` | `(x) => x` | Function to clone items |
| `move` | `(evt, originalEvent) => boolean \| void` | `null` | Function to determine if move is allowed |
| `componentData` | `object` | `null` | Props to pass to the container component |

All [Sortable.js options](https://github.com/SortableJS/Sortable#options) are also supported as props (e.g., `group`, `sort`, `delay`, `animation`, `handle`, `ghostClass`, etc.).

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `T[]` | Emitted when the list changes |
| `change` | `ChangeEvent<T>` | Emitted on add, remove, or move with details |
| `start` | `SortableEvent` | Drag started |
| `end` | `SortableEvent` | Drag ended |
| `add` | `SortableEvent` | Item added to list |
| `remove` | `SortableEvent` | Item removed from list |
| `update` | `SortableEvent` | Item moved within list |
| `choose` | `SortableEvent` | Item chosen |
| `unchoose` | `SortableEvent` | Item unchosen |
| `sort` | `SortableEvent` | Sorting changed |
| `filter` | `SortableEvent` | Tried to drag filtered item |
| `clone` | `SortableEvent` | Clone created |

## TypeScript

The module provides full TypeScript support. Import types as needed:

```ts
import type { 
  ChangeEvent, 
  AddedEvent, 
  RemovedEvent, 
  MovedEvent,
  MoveEventContext 
} from '@typed-draggable/nuxt/runtime/types'

function handleChange(event: ChangeEvent<MyItem>) {
  if ('added' in event) {
    console.log('Added:', event.added.element)
  }
}
```

## Important Notes

- The component only works on the client side (uses `SortableJS` which requires DOM)
- Wrap in `<ClientOnly>` if needed for SSR applications
- `itemKey` prop is required and must return unique values for each item

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm run dev:prepare

# Develop with the playground
pnpm run dev

# Build the module
pnpm run prepack

# Run tests
pnpm run test
```

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@typed-draggable/nuxt/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@typed-draggable/nuxt

[npm-downloads-src]: https://img.shields.io/npm/dm/@typed-draggable/nuxt.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@typed-draggable/nuxt

[license-src]: https://img.shields.io/npm/l/@typed-draggable/nuxt.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@typed-draggable/nuxt

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
