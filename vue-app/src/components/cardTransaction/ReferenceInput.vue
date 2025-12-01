<template>
    <div class="relative">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Relier a</label>
            <div v-if="isSelected" class="mb-4 relative">
                <input type="text" v-model="transRef" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    readonly />
                <i @click="clearSelectedTransaction"
                    class="ri-close-line text-xl absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"></i>
            </div>
            <input type="text" placeholder="Nom du client" @keyup="searchClient" v-model="searchKeywordClient"
                class="w-full px-3 py-2 border rounded-lg text-sm" :class="[ showErrorMsg ? 'border-red-500': 'border-gray-300' ]"/>
            <!-- isLinked -->
            <p v-if="showErrorMsg" class="text-red-500 text-xs mt-1">Ce champ est requis</p>
        </div>
        <div v-if="showList" @mousedown.prevent
            class="max-h-48 overflow-y-auto border border-gray-300 !rounded-button bg-white absolute right-0 left-0 z-30">
            <div v-if="clientStore.clients.rows.length" class="divide-y divide-gray-100">
                <div v-for="(client, index) in clientStore.clients.rows" :key="index" :class="[
                    'flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer customer-item border-t-0'
                ]" @click="selectClient(client.nid)">
                    <div
                        class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium uppercase ">
                        {{ client.title.slice(0, 2) }}
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">{{ client.title }}</p>
                        <p class="text-xs text-gray-500 hidden">{{ client.field_phone }}</p>
                    </div>
                </div>
            </div>
            <div v-else>
                <h3 class="text-center text-gray-400 py-2">Aucun client trouvé</h3>
            </div>
        </div>
        <div v-if="showTransactionList" @mousedown.prevent
            class="max-h-48 overflow-y-auto border border-gray-300 !rounded-button bg-white absolute right-0 left-0 z-30">
            <div v-if="transactionStore.transactions.rows.length" class="divide-y divide-gray-100">
                <div v-for="(tr, index) in transactionStore.transactions.rows" :key="index" :class="[
                    'flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer customer-item border-t-0'
                ]" @click="selectTransaction(tr.nid, tr.title, tr.field_total, tr.field_currency)">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">{{ tr.title }}</p>
                        <p class="text-xs text-gray-500">{{ tr.field_total }} {{ tr.field_currency ? tr.field_currency :
                            "Ar" }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { useClientStore, useTransactionStore } from '../../stores';

const clientStore = useClientStore();
const transactionStore = useTransactionStore();
const searchKeywordClient = ref('');
const data = reactive({
    nid: null,
    total: 0,
    required: false,
});
const showList = ref(false);
const transRef = ref('');
const isSelected = ref(false);
const isEdit = ref(false);
const isLinked = ref(false);
const showErrorMsg = ref(false);
const showTransactionList = ref(false);

const props = defineProps({
    isSelected: Object
})
const emit = defineEmits(['sendTransactionId']);

const queryOptions = ref({
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
const TransactionQueryOptions = ref({
    fields: [
        'nid',
        'title',
        'field_client',
        'field_date',
        'field_expression',
        'field_note',
        'field_ref',
        'field_total',
        'field_currency'
    ],
    sort: { val: 'nid', op: 'desc' },
    filters: {},
    pager: 0,
    offset: 20
})

const searchClient = async () => {
    updateFilter('title', searchKeywordClient.value, 'CONTAINS', 'client')
    await clientStore.fetchClients(queryOptions.value);
    showList.value = true;
    showTransactionList.value = false;
    if (searchKeywordClient.value == '') {
        showList.value = false;
        showTransactionList.value = false;
    }
}

const updateFilter = (key, value, op = '=', type) => {
    if (type == 'client') {
        if (!value) delete queryOptions.value.filters[key]
        else queryOptions.value.filters[key] = { val: value, op }
    }
    if (type == 'transaction') {
        if (!value) delete TransactionQueryOptions.value.filters[key]
        else TransactionQueryOptions.value.filters[key] = { val: value, op }
    }
}

const selectClient = async (nid) => {
    updateFilter('field_client', nid, '=', "transaction")
    await transactionStore.fetchTransactions(TransactionQueryOptions.value);
    showTransactionList.value = true;
}

const selectTransaction = (nid, title, total, currency = "Ar") => {
    transRef.value = `${title} = ${total} ${currency == 'Ar' ? 'Ar' : 'Rmb'}`;
    isSelected.value = true;
    showList.value = false;
    showTransactionList.value = false;
    data.total = parseFloat(total);
    data.nid = nid;
    if (isLinked.value) {
        data.required = true;
    }
    emit('sendTransactionId', data);
}

const clearSelectedTransaction = () => {
    if (isLinked.value) {
        showErrorMsg.value = true;
    }
    data.nid = null;
    data.total = 0;
    transRef.value = "";
    isSelected.value = false;
    showList.value = false;
    showTransactionList.value = false;
    searchKeywordClient.value = '';
    emit('sendTransactionId', data);
}

watch(
    () => props.isSelected,
    (value) => {
        if (value.title && value.nid) {
            isSelected.value = true
            selectTransaction(value.nid, value.title, value.total, value.currency)
            isEdit.value = true
            if (value.isLinked) {
                isLinked.value = true;
            }
        } else {
            isSelected.value = false
            transRef.value = '';
        }
    },
    { immediate: true }
)
</script>

<style></style>