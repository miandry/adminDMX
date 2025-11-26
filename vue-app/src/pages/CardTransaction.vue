<template>
    <div>
        <PageLoader v-if="transactionStore.loading" />
        <main class="p-3 h-screen overflow-y-auto">
            <TransactionForm @openHistory="toggleHistory" @openSaveForm="toggleSaveForm" ref="transactionFormRef" />
        </main>
        <SaveFormData @closeSaveForm="toggleSaveForm" v-if="isFormOpen" :results="results" @saved="refreshHistory" />
        <HistoryPannel :class="[
            'fixed inset-0 bg-white transform transition-transform duration-300 z-50',
            isOpen ? 'translate-x-0' : '-translate-x-full'
        ]" @close="toggleHistory" ref="historyRef" />
    </div>
</template>

<script setup>
import { ref } from "vue"
import HistoryPannel from "../components/cardTransaction/HistoryPannel.vue"
import TransactionForm from '../components/cardTransaction/TransactionForm.vue'
import SaveFormData from '../components/cardTransaction/SaveFormData.vue'
import PageLoader from '../components/PageLoader.vue'
import { useClientStore, useTransactionStore } from "../stores/index.js"

const isOpen = ref(false)
const isFormOpen = ref(false)
const results = ref('')
const historyRef = ref(null);
const transactionFormRef = ref(null);
const transactionStore = useTransactionStore()
const clientStore = useClientStore()

const toggleHistory = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value == true) {
        if (historyRef.value) {
            historyRef.value.fetchTransactions();
        }
    }
}

const toggleSaveForm = (data = null) => {
    isFormOpen.value = !isFormOpen.value
    if (data !== null) results.value = data
}

function refreshHistory() {
    if (historyRef.value) {
        historyRef.value.fetchTransactions();
    }
    if (transactionFormRef.value) {
        transactionFormRef.value.resetInput();
    }
}
</script>

<style></style>