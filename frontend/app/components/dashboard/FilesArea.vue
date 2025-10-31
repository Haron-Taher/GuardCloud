<template>
  <section class="files">
    <div class="bar">
      <div class="left">
        <h2>{{ title }}</h2>
      </div>

      <div class="right">
        <button class="view" :class="{ on: view === 'grid' }" @click="view = 'grid'">Grid</button>
        <button class="view" :class="{ on: view === 'list' }" @click="view = 'list'">List</button>

        <select v-model="sort">
          <option value="name">Name</option>
          <option value="modified">Last modified</option>
          <option value="size">Size</option>
        </select>
      </div>
    </div>

    <div v-if="view === 'grid'" class="grid">
      <button
        v-for="f in shown"
        :key="f.id"
        class="tile"
        :class="{ selected: f.id === selected?.id }"
        @click="select(f)"
        @dblclick="$emit('open', f)"
      >
        <img :src="iconFor(f)" alt="" />
        <div class="meta">
          <strong class="name">{{ f.name }}</strong>
          <span class="sub">{{ subline(f) }}</span>
        </div>
        <button class="star" @click.stop="toggleStar(f)">{{ f.starred ? '★' : '☆' }}</button>
      </button>
    </div>

    <table v-else class="list">
      <thead>
        <tr>
          <th>Name</th>
          <th>Owner</th>
          <th>Last modified</th>
          <th>Size</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="f in shown"
          :key="f.id"
          :class="{ selected: f.id === selected?.id }"
          @click="select(f)"
          @dblclick="$emit('open', f)"
        >
          <td class="namecell">
            <img :src="iconFor(f)" alt="" />
            <span class="name">{{ f.name }}</span>
          </td>
          <td>{{ f.owner }}</td>
          <td>{{ dateFmt(f.modified) }}</td>
          <td>{{ prettySize(f.size) }}</td>
          <td class="starcell"><button class="star" @click.stop="toggleStar(f)">{{ f.starred ? '★' : '☆' }}</button></td>
        </tr>
      </tbody>
    </table>

    <aside v-if="selected" class="drawer">
      <div class="drawer__head">
        <img :src="iconFor(selected)" alt="" />
        <div class="t">
          <strong>{{ selected.name }}</strong>
          <span>{{ selected.type.toUpperCase() }}</span>
        </div>
        <button class="close" @click="selected = null">✕</button>
      </div>

      <div class="drawer__body">
        <dl>
          <dt>Owner</dt><dd>{{ selected.owner }}</dd>
          <dt>Size</dt><dd>{{ prettySize(selected.size) }}</dd>
          <dt>Modified</dt><dd>{{ dateFmt(selected.modified) }}</dd>
          <dt>Shared</dt><dd>{{ selected.sharedWith.length ? selected.sharedWith.join(', ') : 'Private' }}</dd>
        </dl>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import icon from '~/assets/logos/securecloud.png'

const props = defineProps(
{
  section: { type: String, required: true },
  query:   { type: String, default: '' }
})

const view = ref('grid')
const sort = ref('modified')
const selected = ref(null)

const data =
[
  { id: '1',  name: 'Quarterly Report.pdf', type: 'pdf',     size: 1_920_000, modified: Date.now() - 3600e3,    owner: 'Haron', starred: true,  sharedWith: ['Luis'] },
  { id: '2',  name: 'Designs',              type: 'folder',  size: 0,          modified: Date.now() - 86400e3,   owner: 'Haron', starred: false, sharedWith: [] },
  { id: '3',  name: 'Budget.xlsx',          type: 'sheet',   size: 820_000,    modified: Date.now() - 7200e3,    owner: 'Haron', starred: false, sharedWith: ['Team'] },
  { id: '4',  name: 'Pitch Deck.pptx',      type: 'slides',  size: 2_300_000,  modified: Date.now() - 172800e3,  owner: 'Haron', starred: true,  sharedWith: ['Serafin','Zab'] },
  { id: '5',  name: 'Meeting Notes.md',     type: 'doc',     size: 54_000,     modified: Date.now() - 5400e3,    owner: 'Haron', starred: false, sharedWith: [] },
  { id: '6',  name: 'Images',               type: 'folder',  size: 0,          modified: Date.now() - 345600e3,  owner: 'Haron', starred: false, sharedWith: [] },
  { id: '7',  name: 'Contract.docx',        type: 'doc',     size: 410_000,    modified: Date.now() - 21600e3,   owner: 'Legal', starred: false, sharedWith: ['Partner Co'] }
]

const filtered = computed(() =>
{
  const q = props.query.toLowerCase().trim()
  let base = data.slice()

  if (props.section === 'shared') base = base.filter(f => f.sharedWith.length)
  if (props.section === 'recent') base = base.sort((a, b) => b.modified - a.modified).slice(0, 6)
  if (props.section === 'starred') base = base.filter(f => f.starred)
  if (props.section === 'trash') base = []

  if (q) base = base.filter(f => f.name.toLowerCase().includes(q))

  if (sort.value === 'name') base.sort((a, b) => a.name.localeCompare(b.name))
  if (sort.value === 'modified') base.sort((a, b) => b.modified - a.modified)
  if (sort.value === 'size') base.sort((a, b) => b.size - a.size)

  return base
})

const shown = computed(() => filtered.value)

const title = computed(() =>
{
  if (props.section === 'drive') return 'My Drive'
  if (props.section === 'shared') return 'Shared with me'
  if (props.section === 'recent') return 'Recent'
  if (props.section === 'starred') return 'Starred'
  if (props.section === 'trash') return 'Trash'
  return 'Files'
})

const select = (f) =>
{
  selected.value = f
}

const toggleStar = (f) =>
{
  f.starred = !f.starred
}

const iconFor = () => icon

const prettySize = (n) =>
{
  if (!n) return '—'
  const kb = 1024
  const mb = kb * 1024
  if (n >= mb) return `${(n / mb).toFixed(1)} MB`
  if (n >= kb) return `${Math.round(n / kb)} KB`
  return `${n} B`
}

const dateFmt = (t) =>
{
  const d = new Date(t)
  return d.toLocaleString()
}

const subline = (f) =>
{
  return `${f.owner} • ${dateFmt(f.modified)}`
}
</script>

<style scoped>
.files
{
  position: relative;
  padding: 14px 16px 32px 16px;
}

.bar
{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.bar h2
{
  margin: 0;
  font-size: 18px;
}

.right
{
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.view
{
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  padding: 8px 10px;
  border-radius: 10px;
}

.view.on
{
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
}

.grid
{
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.tile
{
  position: relative;
  display: grid;
  grid-template-rows: 120px auto;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  padding: 10px;
  text-align: left;
}

.tile.selected
{
  outline: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
}

.tile img
{
  width: 100%;
  height: 120px;
  object-fit: contain;
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: 10px;
}

.meta
{
  display: grid;
  gap: 2px;
}

.name
{
  font-weight: 700;
}

.sub
{
  color: var(--muted);
  font-size: 12px;
}

.star
{
  position: absolute;
  right: 8px;
  top: 8px;
  background: transparent;
  border: 0;
  font-size: 18px;
  cursor: pointer;
}

.list
{
  width: 100%;
  border-collapse: collapse;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.list th,
.list td
{
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}

.list thead th
{
  background: color-mix(in srgb, var(--card) 70%, transparent);
  text-align: left;
  font-weight: 700;
  font-size: 14px;
}

.list tbody tr:hover
{
  background: color-mix(in srgb, var(--card) 85%, transparent);
}

.list tbody tr.selected
{
  outline: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
  outline-offset: -2px;
}

.namecell
{
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 10px;
  align-items: center;
}

.namecell img
{
  width: 22px;
  height: 22px;
  object-fit: contain;
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: 6px;
}

.starcell
{
  width: 56px;
  text-align: right;
}

.drawer
{
  position: fixed;
  right: 12px;
  top: 74px;
  width: min(340px, 92vw);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 14px 28px color-mix(in srgb, black 18%, transparent);
}

.drawer__head
{
  display: grid;
  grid-template-columns: 42px 1fr auto;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.drawer__head img
{
  width: 42px;
  height: 42px;
  object-fit: contain;
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: 8px;
}

.drawer__head .t
{
  display: grid;
  gap: 2px;
}

.close
{
  background: transparent;
  border: 0;
  font-size: 18px;
}

.drawer__body
{
  padding-top: 10px;
}

.drawer__body dl
{
  display: grid;
  grid-template-columns: 100px 1fr;
  row-gap: 8px;
  column-gap: 10px;
  align-items: baseline;
  font-size: 14px;
}
</style>
