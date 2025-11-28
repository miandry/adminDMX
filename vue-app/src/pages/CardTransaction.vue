<template>
    <div>
        <PageLoader v-if="transactionStore.loading" />
        <main class="p-3 h-screen overflow-y-auto">
            <TransactionForm @openHistory="toggleHistory" @openSaveForm="toggleSaveForm" ref="transactionFormRef"
                :transToEdit="editDataTrans" @cancelEdit="cancelEdit" />
        </main>

        <SaveFormData @closeSaveForm="toggleSaveForm" v-if="isFormOpen" :results="results" @saved="refreshHistory"
            @removeBtn="removeBtn" />

        <HistoryPannel :class="[
            'fixed inset-0 bg-white transform transition-transform duration-300 z-50',
            isOpen ? 'translate-x-0' : '-translate-x-full'
        ]" @close="toggleHistory" ref="historyRef" @openDetails="showDetailsModal"
            @openConfirmDelete="confirmDelete" />


        <TransactionDetails :class="[
            'fixed inset-0 bg-white transform transition-transform duration-300 z-50',
            showDetails ? 'translate-x-0' : '-translate-x-full'
        ]" :trId="trId" :refreshKey="refreshKey" @closeDetails="hideDetailsModal" @openConfirmDelete="confirmDelete" />


        <DeleteConfirm @closeConfirm="showConfirm = false" :trans="tr" v-if="showConfirm"
            @closeDetails="showDetails = false" class="fixed inset-0 z-50 flex items-center justify-center" />
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
const refreshKey = ref(0);
const tr = ref({});
const showConfirm = ref(false);
// edit variable

const editDataTrans = ref('');

const toggleHistory = (editData = null) => {
    isOpen.value = !isOpen.value
    if (isOpen.value == true) {
        if (historyRef.value) {
            historyRef.value.fetchTransactions();
        }
    }
    if (editData) {
        editDataTrans.value = editData;
    } else {
        editDataTrans.value = '';
    }
}

const toggleSaveForm = (data = null) => {
    isFormOpen.value = !isFormOpen.value
    if (data !== null) results.value = data
}

function refreshHistory(transactionId) {
    if (historyRef.value) {
        historyRef.value.fetchTransactions();
    }
    if (transactionFormRef.value) {
        transactionFormRef.value.resetInput();
    }
    trId.value = parseInt(transactionId);
    refreshKey.value++
    showDetails.value = true;
}

// show modal
const confirmDelete = (data) => {
    tr.value = data;
    showConfirm.value = true;
}

function showDetailsModal(id) {
    trId.value = parseInt(id);
    refreshKey.value++
    showDetails.value = true;
}

function hideDetailsModal(editData) {
    if (editData) {
        isOpen.value = false;
    }
    if (editData) {
        editDataTrans.value = editData;
    } else {
        editDataTrans.value = '';
    }
    showDetails.value = false
}

const cancelEdit = () => {
    editDataTrans.value = '';
}

const removeBtn = () => {
    transactionFormRef.value.cancelEdit()
}
</script>

<style></style>