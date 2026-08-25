<template>
  <div class="min-h-screen bg-gray-50">
    <PageLoader v-if="transactionStore.loading && !transactions.length" />

    <header class="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div class="px-4 py-3">
        <p class="text-xs text-gray-500">
          {{ transactionStore.transactions.total || 0 }} calcul(s) enregistré(s)
        </p>
      </div>

      <div class="px-4 pb-3 flex flex-wrap gap-2">
        <button @click="dateSort"
          class="bg-primary text-white py-1.5 px-2 !rounded-button text-xs font-medium">
          <i :class="[sortValue === 'desc' ? 'ri-sort-desc' : 'ri-sort-asc']"></i>
        </button>

        <div class="relative flex-1 min-w-[140px]">
          <input type="text" placeholder="Recherche par client" @keyup="searchClient"
            v-model="searchKeywordClient"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs" />
          <i @click="clearClientFilter"
            class="ri-close-line text-lg absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"></i>
          <div v-if="showList"
            class="max-h-48 overflow-y-auto border border-gray-300 rounded-lg bg-white absolute right-0 left-0 z-30 mt-1 shadow-sm">
            <div v-if="clientStore.clients.rows.length" class="divide-y divide-gray-100">
              <div v-for="(client, index) in clientStore.clients.rows" :key="index"
                class="px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                @click="selectClient(client.nid, client.title)">
                <p class="text-xs font-medium text-gray-900">{{ client.title }}</p>
              </div>
            </div>
            <div v-else>
              <h3 class="text-center text-gray-400 py-2 text-xs">Aucun client trouvé</h3>
            </div>
          </div>
        </div>

        <input type="date" v-model="rangeValue" @change="dateRange"
          class="px-3 py-1.5 border border-gray-300 rounded-lg text-xs" />
      </div>
    </header>

    <main class="p-4 space-y-3 pb-24">
      <div v-if="transactions.length" class="space-y-3">
        <article v-for="transaction in transactions" :key="transaction.nid"
          class="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 mb-1 truncate">
                {{ transaction.field_client?.title || '—' }}
              </div>
              <div class="text-sm font-medium text-green-600">{{ transaction.title }}</div>
              <div class="text-xs text-gray-500">{{ transaction.field_date }}</div>
            </div>
            <span class="text-sm font-bold text-green-600 whitespace-nowrap ml-2">
              {{ Number(transaction.field_total || 0).toLocaleString('fr-FR') }}
              {{ transaction.field_currency || 'Ar' }}
            </span>
          </div>

          <div v-if="getRefs(transaction.field_ref).length" class="mb-2">
            <p class="text-xs font-medium text-gray-700 mb-1">Liaison</p>
            <p class="text-xs text-gray-600 ms-1" v-for="ref in getRefs(transaction.field_ref)" :key="ref.nid">
              {{ ref.field_client?.title || ref.title }}
              =
              {{ Number(ref.field_total || 0).toLocaleString('fr-FR') }}
              {{ ref.field_currency || 'Ar' }}
            </p>
          </div>

          <div
            class="text-sm text-gray-800 bg-gray-50 rounded px-2 py-1 font-mono text-xs max-h-[100px] overflow-y-auto"
            v-html="formatExpression(transaction.field_expression)">
          </div>

          <p v-if="transaction.field_note" class="text-sm text-gray-700 mt-2">
            {{ transaction.field_note }}
          </p>

          <div class="flex gap-2 mt-3">
            <button type="button" @click="openDetails(transaction.nid)"
              class="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 px-3 !rounded-button text-xs font-medium">
              <i class="ri-information-line mr-1"></i>
              Détails
            </button>
            <a href="/"
              class="flex-1 text-center bg-primary hover:bg-primary/90 text-white py-1.5 px-3 !rounded-button text-xs font-medium">
              <i class="ri-calculator-line mr-1"></i>
              Calcul
            </a>
          </div>
        </article>

        <button v-if="canLoadMore" @click="loadMore"
          class="w-full bg-primary hover:bg-primary/90 text-white py-2 px-3 !rounded-button text-sm font-medium">
          <i class="ri-add-line mr-1"></i>
          Voir plus
        </button>
      </div>

      <div v-else-if="!transactionStore.loading"
        class="flex flex-col items-center justify-center h-64 text-gray-500">
        <i class="ri-history-line text-4xl mb-2"></i>
        <p class="text-sm">Aucun calcul enregistré</p>
      </div>
    </main>

    <TransactionDetails :class="[
      'fixed inset-0 bg-white transform transition-transform duration-300 z-50',
      showDetails ? 'translate-x-0' : '-translate-x-full'
    ]" :trId="trId" :refreshKey="refreshKey" @closeDetails="showDetails = false" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import PageLoader from '../components/PageLoader.vue'
import TransactionDetails from './TransactionDetails.vue'
import { useClientStore, useTransactionStore } from '../stores/index.js'

const transactionStore = useTransactionStore()
const clientStore = useClientStore()

const sortValue = ref('desc')
const rangeValue = ref('')
const showList = ref(false)
const searchKeywordClient = ref('')
const canLoadMore = ref(false)
const showDetails = ref(false)
const trId = ref(0)
const refreshKey = ref(0)

const queryOptions = ref({
  fields: [
    'nid',
    'title',
    'field_client',
    'field_date',
    'field_expression',
    'field_note',
    'field_ref',
    'field_total',
    'field_currency',
  ],
  values: {
    field_ref: ['title', 'nid', 'field_total', 'field_client', 'field_currency'],
  },
  sort: { val: 'nid', op: 'desc' },
  filters: {},
  pager: 0,
  offset: 15,
})

const queryOptionsClient = ref({
  fields: ['nid', 'title', 'field_phone'],
  sort: { val: 'title', op: 'asc' },
  filters: {},
  pager: 0,
  offset: 100,
})

const transactions = computed(() => transactionStore.transactions.rows || [])

const fetchTransactions = async (append = false) => {
  await transactionStore.fetchTransactions(queryOptions.value, append)
}

const loadMore = () => {
  queryOptions.value.pager += 1
  fetchTransactions(true)
}

const dateSort = () => {
  sortValue.value = sortValue.value === 'desc' ? 'asc' : 'desc'
  queryOptions.value.sort = { val: 'nid', op: sortValue.value }
  queryOptions.value.pager = 0
  fetchTransactions()
}

const dateRange = () => {
  updateFilter('created', toTimestamp(rangeValue.value), '>=')
  queryOptions.value.pager = 0
  fetchTransactions()
}

const selectClient = (nid, name) => {
  updateFilter('field_client', nid, '=')
  searchKeywordClient.value = name
  showList.value = false
  queryOptions.value.pager = 0
  fetchTransactions()
}

const clearClientFilter = () => {
  searchKeywordClient.value = ''
  showList.value = false
  updateFilter('field_client', '', '=')
  queryOptions.value.pager = 0
  fetchTransactions()
}

const updateFilter = (key, value, op = '=') => {
  if (!value) delete queryOptions.value.filters[key]
  else queryOptions.value.filters[key] = { val: value, op }
}

const updateClientFilter = (key, value, op = '=') => {
  if (!value) delete queryOptionsClient.value.filters[key]
  else queryOptionsClient.value.filters[key] = { val: value, op }
}

const searchClient = async () => {
  updateClientFilter('title', searchKeywordClient.value, 'CONTAINS')
  await clientStore.fetchClients(queryOptionsClient.value)
  showList.value = searchKeywordClient.value !== ''
}

function toTimestamp(dateString) {
  return Math.floor(new Date(dateString).getTime() / 1000)
}

const formatExpression = (expression) => {
  if (!expression) return ''
  return String(expression).replace(/\r?\n/g, '<br>')
}

const getRefs = (field_ref) => {
  if (!field_ref) return []
  if (Array.isArray(field_ref)) {
    return field_ref.filter((ref) => ref && typeof ref === 'object')
  }
  return typeof field_ref === 'object' ? [field_ref] : []
}

watch(
  () => transactionStore.transactions,
  (trs) => {
    if (!trs || !trs.rows) {
      canLoadMore.value = false
      return
    }
    canLoadMore.value = trs.rows.length < (trs.total || 0)
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  fetchTransactions()
})

const openDetails = (id) => {
  trId.value = parseInt(id, 10)
  refreshKey.value++
  showDetails.value = true
}
</script>
