<template>
    <!-- History Slide Panel -->
    <div>
        <div class="border-b border-gray-200 p-4">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">
                    Historique des Calculs
                </h3>
                <button class="text-gray-400 hover:text-gray-600" @click="$emit('close')">
                    <i class="ri-close-line text-xl"></i>
                </button>
            </div>
            <div class="flex gap-2 mt-3">
                <div>
                    <button @click="dateSort"
                        class="bg-primary text-white py-1 px-2 !rounded-button text-xs font-medium">
                        <i :class="[sortValue == 'desc' ? 'ri-sort-asc' : 'ri-sort-desc']"></i></button>
                </div>
                <div class="relative">
                    <input type="text" placeholder="Recherche par client" @keyup="searchClient"
                        v-model="searchKeywordClient"
                        class="w-full px-3 py-1 border border-gray-300 rounded-lg text-xs" />
                    <i @click="selectClient('', '')"
                        class="ri-close-line text-xl absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"></i>
                    <div v-if="showList"
                        class="max-h-48 overflow-y-auto border border-gray-300 !rounded-button bg-white absolute right-0 left-0 z-30">
                        <div v-if="clientStore.clients.rows.length" class="divide-y divide-gray-100">
                            <div v-for="(client, index) in clientStore.clients.rows" :key="index" :class="[
                                'flex items-center space-x-3 px-2 py-1 hover:bg-gray-50 cursor-pointer customer-item border-t-0'
                            ]" @click="selectClient(client.nid, client.title)">
                                <div class="flex-1">
                                    <p class="text-xs font-medium text-gray-900">{{ client.title }}</p>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <h3 class="text-center text-gray-400 py-2">Aucun client trouvé</h3>
                        </div>
                    </div>
                </div>
                <div>
                    <input type="date" placeholder="Selectionner une date" v-model="rangeValue" @change="dateRange"
                        class="w-full px-3 py-1 border border-gray-300 rounded-lg text-xs" />
                </div>
            </div>
        </div>
        <div class="overflow-y-auto h-full pb-4" ref="scrollContainer">
            <div class="p-4 space-y-3 mb-20" v-if="transactionStore.transactions.rows.length">
                <!-- Example calculations -->
                <div v-for="transaction in transactionStore.transactions.rows" :key="transaction.nid"
                    class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                            <div class="text-sm font-medium text-gray-900 mb-1">
                                {{ transaction.field_client.title }}
                            </div>
                            <div class="text-sm font-medium text-green-500">{{ transaction.title }}</div>
                            <div class="text-xs text-gray-500">{{ transaction.field_date }}</div>
                        </div>
                        <button class="text-gray-400 hover:text-red-500 ml-2" @click="openConfirmDelete(transaction)">
                            <i class="ri-delete-bin-line text-sm text-red-500"></i>
                        </button>
                    </div>
                    <div class="">
                        <div>
                            <div class="text-xs text-gray-600 mb-1">Expression:</div>
                            <div class="text-sm text-gray-800 rounded mb-1 font-mono text-xs"
                                v-if="transaction.field_ref">
                                <div class="py-1">
                                    <p class="text-xs font-medium text-gray-700">Liaison: </p>
                                    <p class="ms-2" v-for="ref in transaction.field_ref" :key="ref.nid">{{
                                        ref.field_client.title }} <span>=
                                        {{
                                            Number(ref.field_total).toLocaleString('fr-FR')
                                        }} {{ ref.field_currency ? ref.field_currency : "Ar" }}</span></p>
                                </div>
                            </div>
                            <div class="text-sm text-gray-800 bg-white rounded px-2 py-1 font-mono text-xs max-h-[100px] overflow-y-auto"
                                v-html="transaction.field_expression.replace(/\r?\n/g, '<br>')">
                            </div>
                        </div>
                        <div class="space-y-1">
                            <div class="flex justify-between items-center py-1 border-t pt-2">
                                <span class="text-xs font-medium text-gray-700">Total:</span>
                                <span class="text-sm font-bold text-green-600">{{
                                    Number(transaction.field_total).toLocaleString('fr-FR') }} {{
                                        transaction.field_currency ? transaction.field_currency : "Ar" }}</span>
                            </div>
                        </div>
                        <div class="">
                            <div class="text-sm text-gray-700">
                                {{ transaction.field_note }}
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-3">
                        <button @click="sendEditData(transaction)"
                            class="flex-1 bg-purple-400 hover:bg-purple-500 text-white py-1.5 px-3 !rounded-button text-xs font-medium">
                            <i class="ri-edit-line mr-1"></i>
                            Charger
                        </button>
                        <button @click="goToDetails(transaction.nid)"
                            class="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 px-3 !rounded-button text-xs font-medium">
                            <i class="ri-information-line mr-1"></i>
                            Details
                        </button>
                    </div>
                </div>
                <div v-if="canLoadMore">
                    <button @click="loadMore"
                        class="w-full bg-primary hover:bg-primary/90 text-white py-1.5 px-3 !rounded-button text-xs font-medium">
                        <i class="ri-add-line mr-1"></i>
                        Voir plus
                    </button>
                </div>

            </div>
            <div v-else class="flex flex-col items-center justify-center h-48 text-gray-500">
                <i class="ri-history-line text-4xl mb-2"></i>
                <p class="text-sm">Aucun calcul enregistré</p>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, watch } from 'vue';
import { useTransactionStore } from '../../stores/transaction/transaction.js';
import { useClientStore } from '../../stores/index.js';

const transactionStore = useTransactionStore();
const emit = defineEmits(['openDetails', 'openConfirmDelete', 'close']);
// Déterminer si on peut charger plus
const canLoadMore = ref(false);
// filter
const sortValue = ref('desc')
const scrollContainer = ref(null);
const rangeValue = ref('')
const showList = ref(false);
const clientStore = useClientStore();
const searchKeywordClient = ref('');
// Paramètres dynamiques de la requête
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
        field_ref: ['title', 'nid', 'field_total', 'field_client', 'field_currency']
    },
    sort: { val: 'nid', op: 'desc' },
    filters: {},
    pager: 0,
    offset: 10
})


const queryOptionsClient = ref({
    fields: [
        'nid',
        'title',
        'field_phone',
    ],
    sort: { val: 'title', op: 'desc' },
    filters: {},
    pager: 0,
    offset: 100
})

const fetchTransactions = async (append = false) => {
    await transactionStore.fetchTransactions(queryOptions.value, append)
}

// Bouton "Voir plus"
const loadMore = () => {
    queryOptions.value.pager += 1
    fetchTransactions(true)
}

watch(
    () => transactionStore.transactions,
    (trs) => {
        if (!trs || !trs.rows) return
        canLoadMore.value = trs.rows.length < (trs.total || 0)
    },
    { deep: true, immediate: true }
)

// show modal
const openConfirmDelete = (value) => {
    const data = [value, 'history']
    emit('openConfirmDelete', data)
}

const goToDetails = (id) => {
    emit('openDetails', id);
}

const sendEditData = (transaction) => {
    emit('close', transaction)
}

const dateSort = () => {
    if (sortValue.value == 'desc') {
        sortValue.value = 'asc'
    } else {
        sortValue.value = 'desc'
    }

    // Mettre à jour le sort de la requête
    queryOptions.value.sort = { val: 'nid', op: sortValue.value }
    fetchTransactions().then(() => {
        scrollToTop();
    })
}

const dateRange = () => {
    updateFilter('created', toTimestamp(rangeValue.value), '>=', 'transaction')
    fetchTransactions().then(() => {
        scrollToTop();
    })
}

const selectClient = async (nid, name) => {
    updateFilter('field_client', nid, '=', 'transaction')
    fetchTransactions().then(() => {
        scrollToTop();
    })
    searchKeywordClient.value = name;
    showList.value = false;
}

function scrollToTop() {
    if (scrollContainer.value) {
        scrollContainer.value.scrollTop = 0;
    }
}

const updateFilter = (key, value, op = '=', type) => {
    if (type == 'client') {
        if (!value) delete queryOptionsClient.value.filters[key]
        else queryOptionsClient.value.filters[key] = { val: value, op }
    }
    if (type == 'transaction') {
        if (!value) delete queryOptions.value.filters[key]
        else queryOptions.value.filters[key] = { val: value, op }
    }
}

function toTimestamp(dateString) {
    return Math.floor(new Date(dateString).getTime() / 1000);
}

const searchClient = async () => {
    updateFilter('title', searchKeywordClient.value, 'CONTAINS', 'client')
    await clientStore.fetchClients(queryOptionsClient.value);
    showList.value = true;
    if (searchKeywordClient.value == '') {
        showList.value = false;
    }
}

defineExpose({
    fetchTransactions
});


</script>

<style></style>