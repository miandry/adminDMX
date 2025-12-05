<template>
    <div class="relative">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Relier a</label>
            <input type="text" placeholder="Nom du client" @keyup="searchClient" v-model="searchKeywordClient"
                class="w-full px-3 py-2 border rounded-lg text-sm"
                :class="[showErrorMsg ? 'border-red-500' : 'border-gray-300']" />
            <!-- isLinked -->

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
            class="max-h-48 overflow-y-auto border border-gray-300 !rounded-button bg-white z-30 mt-4">
            <div v-if="transactionStore.transactions.rows.length"
                class="divide-y divide-gray-100  max-h-[100px] overflow-y-auto">
                <div v-for="(tr, index) in transactionStore.transactions.rows" :key="index" :class="[
                    'flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer customer-item border-t-0'
                ]">
                    <div class="flex-1">
                        <label class="text-xs flex gap-2">
                            <input type="checkbox" :value="tr.nid" v-model="refIds">
                            <p><span class="font-medium text-gray-900">{{ tr.field_client.title }} </span> = <span
                                    class="text-gray-500">{{ tr?.field_total }} {{ tr?.field_currency ?
                                        tr?.field_currency :
                                        "Ar" }}</span></p>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-2" v-if="refDetails.length">
            <span v-for="tr in refDetails" :key="tr" @click="removeTransaction(tr.nid)"
                class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 inset-ring inset-ring-gray-500/10  border border-gray-300 me-1 mb-1">
                {{ tr.field_client.title }} = {{ tr?.field_total }} {{ tr?.field_currency ? tr?.field_currency : "Ar" }}
            </span>
        </div>
        <p v-if="showErrorMsg" class="text-red-500 text-xs mt-1">Ce champ est requis</p>
    </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useClientStore, useTransactionStore } from '../../stores';

const clientStore = useClientStore();
const transactionStore = useTransactionStore();
const searchKeywordClient = ref('');
const data = reactive({
    nids: [],
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
const showTransactionListEdit = ref(false);
const refIds = ref([]);
const refDetails = ref([]);
const transactionRefEdit = ref([]);
const totalChecked = ref(0);

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
    values: {
        field_ref: ['title', 'nid', 'field_total', 'field_client', 'field_currency']
    },
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
    showList.value = false;
}


const removeTransaction = (nid) => {
    // Retire le nid de la liste des éléments sélectionnés
    refIds.value = refIds.value.filter(id => id != nid);
    refDetails.value = refDetails.value.filter(tr => tr.nid != nid);
};

watch(
    () => props.isSelected,
    (value) => {
        if (value.ref) {
            isSelected.value = true
            isEdit.value = true
            showTransactionListEdit.value = true
            if (value.isLinked) {
                isLinked.value = true;
            }
            transactionRefEdit.value = value.ref
            refIds.value = value.ref.map(r => Number(r.nid))
            refDetails.value = value.ref;
            updateTotalsAndData(refIds.value);

        } else {
            isSelected.value = false
            transRef.value = '';
        }
    },
    { immediate: true }
)

watch(refIds, (newIds, oldIds) => {
    // Trouver ce qui est ajouté
    const added = newIds.filter(id => !oldIds.includes(id));
    // Trouver ce qui est supprimé
    const removed = oldIds.filter(id => !newIds.includes(id));

    // 1. Ajouter les nouveaux
    added.forEach(id => {
        const tr = transactionStore.transactions.rows.find(t => t.nid == id);
        if (tr && !refDetails.value.find(x => x.nid == tr.nid)) {
            refDetails.value.push(tr);
        }
    });

    // 2. Enlever ceux décochés
    removed.forEach(id => {
        refDetails.value = refDetails.value.filter(t => t.nid !== id);
    });

    updateTotalsAndData(newIds);
});

function updateTotalsAndData(newIds) {

    // Recalcul total
    totalChecked.value = refDetails.value.reduce((sum, tr) => {
        const num = Number(tr.field_total) || 0;
        return sum + num;
    }, 0);

    // Mise à jour data
    data.total = totalChecked.value;
    data.nids = newIds;

    // Validation si lien obligatoire
    if (isLinked.value && !newIds.length) {
        data.required = true;
        showErrorMsg.value = true;
    } else {
        showErrorMsg.value = false;
    }

    emit('sendTransactionId', data);
}
</script>

<style></style>