<template>
    <!-- History Slide Panel -->
    <div>
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
                Historique des Calculs
            </h3>
            <button class="text-gray-400 hover:text-gray-600" @click="$emit('close')">
                <i class="ri-close-line text-xl"></i>
            </button>
        </div>
        <div class="overflow-y-auto h-full pb-4">
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
                                <div class="flex justify-between items-center py-1">
                                    <span class="text-xs font-medium text-gray-700">Liaison: {{
                                        transaction.field_ref.title }} =
                                        {{ Number(transaction.field_ref.field_total).toLocaleString('fr-FR') }}
                                        Ar</span>
                                </div>
                            </div>
                            <div class="text-sm text-gray-800 bg-white rounded px-2 py-1 font-mono text-xs"
                                v-html="transaction.field_expression.replace(/\r?\n/g, '<br>')">
                            </div>
                        </div>
                        <div class="space-y-1">
                            <div class="flex justify-between items-center py-1 border-t pt-2">
                                <span class="text-xs font-medium text-gray-700">Total:</span>
                                <span class="text-sm font-bold text-green-600">{{
                                    Number(transaction.field_total).toLocaleString('fr-FR') }} Ar</span>
                            </div>
                        </div>
                        <div class="">
                            <div class="text-sm text-gray-700">
                                {{ transaction.field_note }}
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-3">
                        <button
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

const transactionStore = useTransactionStore();
const emit = defineEmits(['openDetails', 'openConfirmDelete']);
// Déterminer si on peut charger plus
const canLoadMore = ref(false);
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
        'field_total'
    ],
    values: {
        field_ref: ['title', 'nid', 'field_total']
    },
    sort: { val: 'nid', op: 'desc' },
    filters: {},
    pager: 0,
    offset: 10
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

defineExpose({
    fetchTransactions
});


</script>

<style></style>