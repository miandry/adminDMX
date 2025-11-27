<template>
    <div>
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        <div class="relative bg-white rounded-xl p-6 w-80 space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Supprimer {{ transaction.title }}</h3>
            <p class="text-gray-600">Cette action est irréversible. Êtes-vous sûr de vouloir supprimer?</p>
            <div class="flex space-x-3">
                <button class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
                    @click="$emit('closeConfirm')">Annuler</button>
                <button @click="deleteTransaction"
                    class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium">Supprimer</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useTransactionStore } from '../../stores/index.js';
import { toast } from 'vue-sonner';
const transactionStore = useTransactionStore()
const transaction = ref({});
const props = defineProps({
    trans: {
        type: Array,
        required: true
    }
});
const emit = defineEmits(['closeConfirm', 'closeDetails']);

const deleteTransaction = async () => {
    if (transaction.value) {
        const idToDelete = parseInt(transaction.value.nid);
        await transactionStore.destroyTransaction(idToDelete);
    }

    if (transactionStore.error) {
        toast.error("Une erreur c'est produit lors de la suppression !");
        return
    }

    toast.success("Suppression effectué avec succès !")
    emit('closeConfirm')
    if (props.trans[1] == 'details') {
        emit('closeDetails')
    }
}

onMounted(() => {
    transaction.value = props.trans[0]
})


</script>

<style></style>