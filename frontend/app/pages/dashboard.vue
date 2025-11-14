<template>
  <div
    class="page"
    @dragover.prevent="dragActive = true"
    @dragleave.prevent="dragActive = false"
    @drop.prevent="handleDrop"
  >
    <header class="top">
      <div class="top__inner">
        <NuxtLink class="brand" to="/">
          <img :src="logo" width="24" height="24" alt="GuardCloud" />
          <span>GuardCloud</span>
        </NuxtLink>

        <div class="search">
          <input v-model.trim="query" type="search" placeholder="Search files, folders, people" />
        </div>

        <div class="actions">
          <div class="split" ref="newBtnRef">
            <button class="btn btn--ghost" @click="toggleCreate">New</button>
            <button class="chev" @click="toggleCreate">▾</button>
          </div>

          <button class="btn btn--primary" @click="onUpload">Upload</button>
          <input ref="fileEl" type="file" class="hidden" multiple @change="handleFiles" />

          <button class="avatar" aria-label="Account"><span>HT</span></button>
        </div>

        <transition name="fade">
          <div v-if="showCreate" class="menu-fly" ref="menuRef">
            <button class="fly-row" @click="create('folder')">Folder</button>
            <button class="fly-row" @click="create('doc')">Document</button>
            <button class="fly-row" @click="create('sheet')">Spreadsheet</button>
            <button class="fly-row" @click="create('slides')">Presentation</button>
          </div>
        </transition>
      </div>

      <transition name="bar">
        <div v-if="uploading" class="progress">
          <div class="meter" :style="{ width: progress + '%' }"></div>
        </div>
      </transition>
    </header>

    <div class="layout">
      <aside class="side">
        <nav class="menu" role="navigation">
          <button
            v-for="item in items"
            :key="item.key"
            class="row"
            :class="{ active: section === item.key }"
            @click="section = item.key"
          >
            <img :src=item.icon alt="" width="18" height="18" onerror="this.src=item.icon_fallback"/>
            <span class="label">{{ item.label }}</span>
          </button>
        </nav>

        <div class="quota">
          <div class="q-top">
            <span>Storage</span>
            <strong>{{ usedGB }} / 15 GB</strong>
          </div>
          <div class="q-bar"><i :style="{ width: usedPct + '%' }"></i></div>
        </div>
      </aside>

      <section class="files">
        <div class="bar">
          <div class="left">
            <h2>{{ title }}</h2>
            <div class="chips">
              <button class="chip" :class="{ on: view === 'grid' }" @click="view = 'grid'">Grid</button>
              <button class="chip" :class="{ on: view === 'list' }" @click="view = 'list'">List</button>
              <button class="chip" :class="{ on: filterStarred }" @click="filterStarred = !filterStarred">★ Starred</button>
            </div>
          </div>

          <div class="right">
            <select v-model="sort">
              <option value="modified">Last modified</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
          </div>
        </div>

        <transition name="fade" mode="out-in">
          <div v-if="!shown.length" key="empty" class="empty">
            <img :src="logo" alt="" />
            <h3>No results</h3>
            <p>Try a different search, filter, or create something new.</p>
            <div class="empty__cta">
              <button class="btn btn--primary" @click="create('folder')">New Folder</button>
              <button class="btn btn--ghost" @click="onUpload">Upload Files</button>
            </div>
          </div>

          <div v-else-if="view === 'grid'" key="grid" class="grid">
            <div
              v-for="f in shown"
              :key="f.id"
              class="tile"
              :class="{ selected: f.id === selected?.id }"
              role="button"
              tabindex="0"
              @click="select(f)"
              @dblclick="onOpen(f)"
              @keydown.enter="onOpen(f)"
              @keydown.space.prevent="onOpen(f)"
            >
              <div class="thumb">
                <img :src="iconFor(f)" alt="" style="max-height: 48px" />
              </div>

              <div class="meta">
                <strong class="name">{{ f.name }}</strong>
                <span class="sub">{{ subline(f) }}</span>
              </div>

              <button class="star" @click.stop="toggleStar(f)">{{ f.starred ? '★' : '☆' }}</button>
            </div>
          </div>

          <table v-else key="list" class="list">
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
                @dblclick="onOpen(f)"
              >
                <td class="namecell">
                  <img :src="iconFor(f)" alt="" />
                  <span class="name">{{ f.name }}</span>
                </td>
                <td>{{ f.owner }}</td>
                <td>{{ dateFmt(f.modified) }}</td>
                <td>{{ prettySize(f.size) }}</td>
                <td class="starcell">
                  <button class="star" @click.stop="toggleStar(f)">{{ f.starred ? '★' : '☆' }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </transition>

        <transition name="drawer">
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
        </transition>
      </section>
    </div>

    <transition name="fade">
      <div v-if="dragActive" class="dropmask">
        <div class="dropmask__card">
          <h3>Drop files to upload</h3>
          <p>Files will be encrypted before leaving your device</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import logo from '~/assets/logos/securecloud.png'

// ui icons

import ui_cloud  from '~/assets/ui-icons/cloud_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg'
import ui_shared from '~/assets/ui-icons/folder_supervised_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg'
import ui_recent from '~/assets/ui-icons/history_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg'
import ui_trash  from '~/assets/ui-icons/delete_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg'
import ui_fav    from '~/assets/ui-icons/star_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg'

import ui_cloud_png  from '~/assets/ui-icons/cloud_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png'
import ui_shared_png from '~/assets/ui-icons/folder_supervised_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png'
import ui_recent_png from '~/assets/ui-icons/history_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png'
import ui_trash_png  from '~/assets/ui-icons/delete_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png'
import ui_fav_png    from '~/assets/ui-icons/star_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png'

// file icons
import ico_txt   from '~/assets/free-file-icons/48px/txt.png'
import ico_png   from '~/assets/free-file-icons/48px/png.png'
import ico_jpg   from '~/assets/free-file-icons/48px/jpg.png'
import ico_aac   from '~/assets/free-file-icons/48px/aac.png'
import ico_aiff  from '~/assets/free-file-icons/48px/aiff.png'
import ico_ai    from '~/assets/free-file-icons/48px/ai.png'
import ico_avi   from '~/assets/free-file-icons/48px/avi.png'
import ico_blank from '~/assets/free-file-icons/48px/_blank.png'
import ico_bmp   from '~/assets/free-file-icons/48px/bmp.png'
import ico_c     from '~/assets/free-file-icons/48px/c.png'
import ico_cpp   from '~/assets/free-file-icons/48px/cpp.png'
import ico_css   from '~/assets/free-file-icons/48px/css.png'
import ico_csv   from '~/assets/free-file-icons/48px/csv.png'
import ico_dat   from '~/assets/free-file-icons/48px/dat.png'
import ico_dmg   from '~/assets/free-file-icons/48px/dmg.png'
import ico_doc   from '~/assets/free-file-icons/48px/doc.png'
import ico_dotx  from '~/assets/free-file-icons/48px/dotx.png'
import ico_dwg   from '~/assets/free-file-icons/48px/dwg.png'
import ico_dxf   from '~/assets/free-file-icons/48px/dxf.png'
import ico_eps   from '~/assets/free-file-icons/48px/eps.png'
import ico_exe   from '~/assets/free-file-icons/48px/exe.png'
import ico_flv   from '~/assets/free-file-icons/48px/flv.png'
import ico_gif   from '~/assets/free-file-icons/48px/gif.png'
import ico_h     from '~/assets/free-file-icons/48px/h.png'
import ico_hpp   from '~/assets/free-file-icons/48px/hpp.png'
import ico_html  from '~/assets/free-file-icons/48px/html.png'
import ico_iso   from '~/assets/free-file-icons/48px/iso.png'
import ico_java  from '~/assets/free-file-icons/48px/java.png'
import ico_js    from '~/assets/free-file-icons/48px/js.png'
import ico_key   from '~/assets/free-file-icons/48px/key.png'
import ico_less  from '~/assets/free-file-icons/48px/less.png'
import ico_mid   from '~/assets/free-file-icons/48px/mid.png'
import ico_mp3   from '~/assets/free-file-icons/48px/mp3.png'
import ico_mp4   from '~/assets/free-file-icons/48px/mp4.png'
import ico_mpg   from '~/assets/free-file-icons/48px/mpg.png'
import ico_odf   from '~/assets/free-file-icons/48px/odf.png'
import ico_ods   from '~/assets/free-file-icons/48px/ods.png'
import ico_odt   from '~/assets/free-file-icons/48px/odt.png'
import ico_otp   from '~/assets/free-file-icons/48px/otp.png'
import ico_ots   from '~/assets/free-file-icons/48px/ots.png'
import ico_ott   from '~/assets/free-file-icons/48px/ott.png'
import ico_page  from '~/assets/free-file-icons/48px/_page.png'
import ico_pdf   from '~/assets/free-file-icons/48px/pdf.png'
import ico_php   from '~/assets/free-file-icons/48px/php.png'
import ico_ppt   from '~/assets/free-file-icons/48px/ppt.png'
import ico_psd   from '~/assets/free-file-icons/48px/psd.png'
import ico_py    from '~/assets/free-file-icons/48px/py.png'
import ico_qt    from '~/assets/free-file-icons/48px/qt.png'
import ico_rar   from '~/assets/free-file-icons/48px/rar.png'
import ico_rb    from '~/assets/free-file-icons/48px/rb.png'
import ico_rtf   from '~/assets/free-file-icons/48px/rtf.png'
import ico_sass  from '~/assets/free-file-icons/48px/sass.png'
import ico_scss  from '~/assets/free-file-icons/48px/scss.png'
import ico_sql   from '~/assets/free-file-icons/48px/sql.png'
import ico_tga   from '~/assets/free-file-icons/48px/tga.png'
import ico_tgz   from '~/assets/free-file-icons/48px/tgz.png'
import ico_tiff  from '~/assets/free-file-icons/48px/tiff.png'
import ico_xls   from '~/assets/free-file-icons/48px/xls.png'
import ico_xlsx  from '~/assets/free-file-icons/48px/xlsx.png'
import ico_xml   from '~/assets/free-file-icons/48px/xml.png'
import ico_yml   from '~/assets/free-file-icons/48px/yml.png'
import ico_zip   from '~/assets/free-file-icons/48px/zip.png'

const section = ref('drive')

const query = ref('')

const view = ref('grid')

const sort = ref('modified')

const filterStarred = ref(false)

const selected = ref(null)

const showCreate = ref(false)

const uploading = ref(false)

const progress = ref(0)

const dragActive = ref(false)

const menuRef = ref(null)

const newBtnRef = ref(null)

const fileEl = ref(null)

const items =
[
  { key: 'drive',   icon: ui_cloud,  icon_fallback: ui_cloud_png,  label: 'My Drive' },
  { key: 'shared',  icon: ui_shared, icon_fallback: ui_shared_png, label: 'Shared with me' },
  { key: 'recent',  icon: ui_recent, icon_fallback: ui_recent_png, label: 'Recent' },
  { key: 'starred', icon: ui_fav,    icon_fallback: ui_fav_png,    label: 'Starred' },
  { key: 'trash',   icon: ui_trash,  icon_fallback: ui_trash_png,  label: 'Trash' }
]

const data = ref([
  { id: '1', name: 'Quarterly Report.pdf', type: 'pdf',    size: 1920000,  modified: Date.now() - 3600e3,   owner: 'Haron',  starred: true,  sharedWith: ['Luis'] },
  { id: '2', name: 'Designs',              type: 'folder', size: 0,        modified: Date.now() - 86400e3,  owner: 'Haron',  starred: false, sharedWith: [] },
  { id: '3', name: 'Budget.xlsx',          type: 'sheet',  size: 820000,   modified: Date.now() - 7200e3,   owner: 'Haron',  starred: false, sharedWith: ['Team'] },
  { id: '4', name: 'Pitch Deck.pptx',      type: 'slides', size: 2300000,  modified: Date.now() - 172800e3, owner: 'Haron',  starred: true,  sharedWith: ['Serafin', 'Zab'] },
  { id: '5', name: 'Meeting Notes.md',     type: 'doc',    size: 54000,    modified: Date.now() - 5400e3,   owner: 'Haron',  starred: false, sharedWith: [] },
  { id: '6', name: 'Images',               type: 'folder', size: 0,        modified: Date.now() - 345600e3, owner: 'Haron',  starred: false, sharedWith: [] },
  { id: '7', name: 'Contract.docx',        type: 'doc',    size: 410000,   modified: Date.now() - 21600e3,  owner: 'Legal',  starred: false, sharedWith: ['Partner Co'] }
])

const filtered = computed(() =>
{
  const q = query.value.toLowerCase().trim()
  let base = data.value.slice()

  if (section.value === 'shared') base = base.filter(f => f.sharedWith.length)
  if (section.value === 'recent') base = base.sort((a, b) => b.modified - a.modified).slice(0, 6)
  if (section.value === 'starred') base = base.filter(f => f.starred)
  if (section.value === 'trash') base = []

  if (filterStarred.value) base = base.filter(f => f.starred)
  if (q) base = base.filter(f => f.name.toLowerCase().includes(q))

  if (sort.value === 'name') base.sort((a, b) => a.name.localeCompare(b.name))
  if (sort.value === 'modified') base.sort((a, b) => b.modified - a.modified)
  if (sort.value === 'size') base.sort((a, b) => b.size - a.size)

  return base
})

const shown = computed(() => filtered.value)

const title = computed(() =>
{
  if (section.value === 'drive') return 'My Drive'
  if (section.value === 'shared') return 'Shared with me'
  if (section.value === 'recent') return 'Recent'
  if (section.value === 'starred') return 'Starred'
  if (section.value === 'trash') return 'Trash'
  return 'Files'
})

const usedGB = computed(() =>
{
  const bytes = data.value.reduce((n, f) => n + f.size, 0)
  return (bytes / (1024 * 1024 * 1024)).toFixed(2)
})

const usedPct = computed(() =>
{
  const v = Math.min(100, Math.max(0, (parseFloat(usedGB.value) / 15) * 100))
  return v.toFixed(0)
})

const select = (f) =>
{
  selected.value = f
}

const onOpen = (f) =>
{
  selected.value = f
}

const toggleStar = (f) =>
{
  f.starred = !f.starred
}

const getExt = (f) =>
{
  const f_name_string = String(f.name)

  const parts = f_name_string.split('.')
  if(parts.length > 1)
  {
    return parts.pop().toLocaleLowerCase()
  }

  return 'folder'
}

const iconFor = (f) =>
{
  const f_ext = String(getExt(f))
  
  switch(f_ext) 
  {                              
    case "txt":  return ico_txt;
    case "md":   return ico_txt;
    case "png":  return ico_png;
    case "jpg":  return ico_jpg;
    case "jpeg": return ico_jpg;                 
    case "aac":  return ico_aac;
    case "aiff": return ico_aiff;                
    case "ai":   return ico_ai;  
    case "avi":  return ico_avi;
    case "bmp":  return ico_bmp;
    case "c":    return ico_c;   
    case "cpp":  return ico_cpp;
    case "css":  return ico_css;
    case "csv":  return ico_csv;
    case "dat":  return ico_dat;
    case "dmg":  return ico_dmg;
    case "doc":  return ico_doc;
    case "docx": return ico_doc;                 
    case "dotx": return ico_dotx;                
    case "dwg":  return ico_dwg;
    case "dxf":  return ico_dxf;
    case "eps":  return ico_eps;
    case "exe":  return ico_exe;
    case "flv":  return ico_flv;
    case "gif":  return ico_gif;
    case "h":    return ico_h;   
    case "hpp":  return ico_hpp;
    case "html": return ico_html;   
    case "iso":  return ico_iso;
    case "java": return ico_java;                
    case "js":   return ico_js;  
    case "key":  return ico_key;
    case "less": return ico_less;                
    case "mid":  return ico_mid;
    case "mp3":  return ico_mp3;
    case "mp4":  return ico_mp4;
    case "mpg":  return ico_mpg;
    case "odf":  return ico_odf;
    case "ods":  return ico_ods;
    case "odt":  return ico_odt;
    case "otp":  return ico_otp;
    case "ots":  return ico_ots;
    case "ott":  return ico_ott;
    case "pdf":  return ico_pdf;
    case "php":  return ico_php;
    case "ppt":  return ico_ppt;
    case "pptx": return ico_ppt;                 
    case "psd":  return ico_psd;
    case "py":   return ico_py;  
    case "qt":   return ico_qt;  
    case "rar":  return ico_rar;
    case "rb":   return ico_rb;  
    case "rtf":  return ico_rtf;
    case "sass": return ico_sass;                
    case "scss": return ico_scss;                
    case "sql":  return ico_sql;
    case "tga":  return ico_tga;
    case "tgz":  return ico_tgz;
    case "tiff": return ico_tiff;                
    case "wav":  return ico_wav;
    case "xls":  return ico_xls;
    case "xlsx": return ico_xls;                 
    case "xml":  return ico_xml;
    case "yml":  return ico_yml;
    case "zip":  return ico_zip;
    default:     return ico_blank;
  }
}

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

const subline = (f) => `${f.owner} • ${dateFmt(f.modified)}`

const toggleCreate = () =>
{
  showCreate.value = !showCreate.value
}

const create = (kind) =>
{
  showCreate.value = false
  const now = Date.now()
  const id = String(now)
  const name =
    kind === 'folder' ? 'New Folder' :
    kind === 'doc'    ? 'Untitled Document' :
    kind === 'sheet'  ? 'Untitled Spreadsheet' :
                        'Untitled Presentation'

  data.value.unshift({
    id, name, type: kind, size: 0, modified: now, owner: 'Haron', starred: false, sharedWith: []
  })

  section.value = 'drive'
}

const onUpload = () =>
{
  fileEl.value?.click()
}

const handleFiles = async (e) =>
{
  const files = Array.from(e.target.files || [])
  if (!files.length) return

  await simulateUpload(files)

  files.forEach((f) =>
  {
    const now = Date.now()
    data.value.unshift({
      id: String(now + Math.random()),
      name: f.name,
      type: 'file',
      size: f.size,
      modified: now,
      owner: 'Haron',
      starred: false,
      sharedWith: []
    })
  })

  uploading.value = false
  progress.value = 0
  e.target.value = ''
}

const simulateUpload = async (files) =>
{
  uploading.value = true
  progress.value = 0

  while (progress.value < 100)
  {
    await new Promise(r => setTimeout(r, 80))
    progress.value = Math.min(100, progress.value + Math.random() * 6 + 2)
  }

  await new Promise(r => setTimeout(r, 150))
}

const handleDrop = async (ev) =>
{
  dragActive.value = false
  const files = Array.from(ev.dataTransfer?.files || [])
  if (!files.length) return

  await simulateUpload(files)

  files.forEach((f) =>
  {
    const now = Date.now()
    data.value.unshift({
      id: String(now + Math.random()),
      name: f.name,
      type: 'file',
      size: f.size,
      modified: now,
      owner: 'Haron',
      starred: false,
      sharedWith: []
    })
  })

  uploading.value = false
  progress.value = 0
}

const onEsc = (e) =>
{
  if (e.key === 'Escape')
  {
    showCreate.value = false
    selected.value = null
  }
}

const onGlobalClick = (e) =>
{
  if (!showCreate.value) return
  const menu = menuRef.value
  const btn = newBtnRef.value
  const t = e.target
  if (menu && !menu.contains(t) && btn && !btn.contains(t))
  {
    showCreate.value = false
  }
}

onMounted(() =>
{
  document.addEventListener('keydown', onEsc)
  document.addEventListener('click', onGlobalClick)
})

onBeforeUnmount(() =>
{
  document.removeEventListener('keydown', onEsc)
  document.removeEventListener('click', onGlobalClick)
})
</script>

<style scoped>
.page
{
  --bg: #0b0d11;
  --text: #e7ebf3;
  --muted: #9aa3af;
  --card: #121720;
  --border: #1e2532;
  --accent: #8ab4ff;
  --radius: 14px;
  --shadow-sm: 0 8px 20px color-mix(in srgb, black 25%, transparent);
  --shadow-md: 0 14px 28px color-mix(in srgb, black 20%, transparent);
  background: radial-gradient(1200px 500px at 10% -10%, color-mix(in srgb, var(--card) 40%, transparent), transparent),
              radial-gradient(1200px 500px at 90% -10%, color-mix(in srgb, var(--card) 40%, transparent), transparent),
              var(--bg);
  color: var(--text);
  min-height: 100vh;
}

@media (prefers-color-scheme: light)
{
  .page
  {
    --bg: #ffffff;
    --text: #0b1220;
    --muted: #5b6b7a;
    --card: #f5f7fb;
    --border: #e6e9ef;
    --accent: #0b57d0;
    --shadow-sm: 0 8px 20px color-mix(in srgb, black 10%, transparent);
    --shadow-md: 0 14px 28px color-mix(in srgb, black 12%, transparent);
    background: radial-gradient(1200px 500px at 10% -10%, color-mix(in srgb, var(--card) 50%, transparent), transparent),
                radial-gradient(1200px 500px at 90% -10%, color-mix(in srgb, var(--card) 50%, transparent), transparent),
                var(--bg);
  }
}

.top
{
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: saturate(160%) blur(8px);
  border-bottom: 1px solid var(--border);
}

.top__inner
{
  max-width: 1200px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
}

.brand
{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}

.search
{
  display: grid;
}

.search input
{
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
  outline: none;
  transition: box-shadow .2s ease, border-color .2s ease, transform .08s ease;
}

.search input:focus
{
  border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent);
}

.actions
{
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.split
{
  display: inline-grid;
  grid-template-columns: auto auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.chev
{
  background: var(--card);
  color: var(--text);
  padding: 9px 10px;
  border: 0;
}

.btn
{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  font-weight: 600;
  text-decoration: none;
  transition: transform .06s ease, background .2s ease, border-color .2s ease, filter .15s ease;
}

.btn:active
{
  transform: translateY(1px);
}

.btn--primary
{
  background: var(--accent);
  color: #fff;
  border-color: color-mix(in srgb, var(--accent) 70%, black 10%);
}

.btn--primary:hover
{
  filter: brightness(1.06);
}

.btn--ghost
{
  background: transparent;
  color: var(--text);
}

.avatar
{
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  display: grid;
  place-items: center;
  font-weight: 700;
}

.menu-fly
{
  position: absolute;
  right: 116px;
  top: 58px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 6px;
  box-shadow: var(--shadow-md);
}

.fly-row
{
  display: block;
  width: 220px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  border: 0;
  background: transparent;
  color: var(--text);
}

.fly-row:hover
{
  background: color-mix(in srgb, var(--card) 80%, transparent);
}

.progress
{
  height: 3px;
  background: color-mix(in srgb, var(--card) 65%, transparent);
}

.meter
{
  height: 100%;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #fff 30%));
  transition: width .16s linear;
}

.layout
{
  display: grid;
  grid-template-columns: 260px 1fr;
}

@media (max-width: 940px)
{
  .layout
  {
    grid-template-columns: 72px 1fr;
  }
}

.side
{
  border-right: 1px solid var(--border);
  min-height: calc(100vh - 60px);
  background: color-mix(in srgb, var(--card) 60%, transparent);
}

.menu
{
  display: grid;
  padding: 12px;
  gap: 8px;
}

.row
{
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: background .18s ease, border-color .18s ease;
}

.row:hover
{
  background: color-mix(in srgb, var(--card) 80%, transparent);
}

.row.active
{
  border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}

.label
{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quota
{
  padding: 12px;
}

.q-top
{
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--muted);
  font-size: 12px;
}

@media only screen and (max-width: 940px)
{
  .q-top
  {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    color: var(--muted);
    font-size: 12px;
  }
}


.q-bar
{
  margin-top: 8px;
  height: 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--card) 75%, transparent);
  overflow: hidden;
}

.q-bar i
{
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 65%, #fff 35%));
}

.files
{
  position: relative;
  padding: 16px 18px 34px 18px;
}

.bar
{
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.bar h2
{
  margin: 0;
  font-size: 18px;
}

.chips
{
  display: inline-flex;
  gap: 8px;
  margin-top: 8px;
}

.chip
{
  padding: 6px 10px;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-weight: 600;
  font-size: 12px;
}

.chip.on
{
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
}

.right
{
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.grid
{
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.tile
{
  position: relative;
  display: grid;
  grid-template-rows: 132px auto;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--card);
  padding: 12px;
  text-align: left;
  box-shadow: var(--shadow-sm);
  transition: transform .12s ease, box-shadow .18s ease, outline .12s ease;
  cursor: pointer;
}

.tile:hover
{
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.tile.selected
{
  outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent);
  outline-offset: -2px;
}

.tile:focus-visible
{
  outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent);
  outline-offset: 2px;
}

.thumb
{
  display: grid;
  place-items: center;
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: 12px;
}

.thumb img
{
  width: 100%;
  height: 130px;
  object-fit: contain;
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
  right: 10px;
  top: 10px;
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
  box-shadow: var(--shadow-sm);
}

.list th,
.list td
{
  padding: 12px 14px;
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
  outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent);
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

.empty
{
  display: grid;
  place-items: center;
  text-align: center;
  padding: 44px 10px 60px 10px;
  gap: 8px;
}

.empty img
{
  width: 64px;
  height: 64px;
  opacity: .6;
}

.empty__cta
{
  display: inline-flex;
  gap: 10px;
  margin-top: 8px;
}

.drawer-enter-from,
.drawer-leave-to
{
  transform: translateX(16px);
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active
{
  transition: all .18s ease;
}

.fade-enter-from,
.fade-leave-to
{
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active
{
  transition: opacity .16s ease;
}

.bar-enter-from,
.bar-leave-to
{
  transform: translateY(-6px);
  opacity: 0;
}

.bar-enter-active,
.bar-leave-active
{
  transition: all .18s ease;
}

.drawer
{
  position: fixed;
  right: 14px;
  top: 86px;
  width: min(360px, 92vw);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  box-shadow: var(--shadow-md);
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

.dropmask
{
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, black 45%, transparent);
  display: grid;
  place-items: center;
}

.dropmask__card
{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 22px;
  text-align: center;
  box-shadow: var(--shadow-md);
}

.hidden
{
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
