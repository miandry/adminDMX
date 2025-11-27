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
        ]" @close="toggleHistory" ref="historyRef" @openDetails="showDetailsModal" @openConfirmDelete="confirmDelete"/>
        <TransactionDetails :class="[
            'fixed inset-0 bg-white transform transition-transform duration-300 z-50',
            showDetails ? 'translate-x-0' : '-translate-x-full'
        ]" :trId="trId" @closeDetails="showDetails = false" @openConfirmDelete="confirmDelete"/>
        <DeleteConfirm @closeConfirm="showConfirm = false" :trans="tr" v-if="showConfirm" @closeDetails="showDetails = false"
            class="fixed inset-0 z-50 flex items-center justify-center" />
    </div>
</template>

<script setup>
import { ref } from "vue"
import HistoryPannel from "../components/cardTransaction/HistoryPannel.vue"
import TransactionForm from '../components/cardTransaction/TransactionForm.vue'
import SaveFormData from '../components/cardTransaction/SaveFormData.vue'
import TransactionDetails from "./TransactionDetails.vue"
import PageLoader from '../components/PageLoader.vue'
import DeleteConfirm from "../components/cardTransaction/DeleteConfirm.vue"
import { useClientStore, useTransactionStore } from "../stores/index.js"

const isOpen = ref(false)
const isFormOpen = ref(false)
const results = ref('')
const historyRef = ref(null);
const transactionFormRef = ref(null);
const transactionStore = useTransactionStore()
const showDetails = ref(false);
const trId = ref('');
const tr = ref({});
const showConfirm = ref(false);

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

// show modal
const confirmDelete = (data) => {
    tr.value = data;
    showConfirm.value = true;
}

function showDetailsModal(id) {
    trId.value = parseInt(id);
    showDetails.value = true;
}
</script>

<style></style>