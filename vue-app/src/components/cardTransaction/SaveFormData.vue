<template>
    <!-- Popup Modal -->
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white mx-4 rounded-lg shadow-lg w-full max-w-sm">
            <div class="p-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">
                    Enregistrer le Calcul
                </h3>
            </div>
            <div class="p-4 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
                    <textarea v-model="form.field_note"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" rows="3"
                        placeholder="Ajouter une note..."></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Relier a</label>
                    <input type="text" placeholder="Nom du client"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input type="date" v-model="form.field_date" :class="{ 'border-red-500': errors.field_date }"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <p v-if="errors.field_date" class="text-red-500 text-xs mt-1">{{ errors.field_date }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <div class="relative">
                        <select v-model="form.field_client" :class="{ 'border-red-500': errors.field_client }"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white capitalize">
                            <option value="">Sélectionner une Client</option>
                            <option v-for="client in clientStore.clients.rows" :key="client.nid" :value="client.nid">
                                {{ client.title }}</option>
                        </select>
                        <i
                            class="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                    <p v-if="errors.field_client" class="text-red-500 text-xs mt-1">{{ errors.field_client }}</p>
                </div>
            </div>
            <div class="flex gap-2 p-4 border-t border-gray-200">
                <button @click="handleSubmit"
                    class="flex-1 bg-secondary hover:bg-secondary/90 text-white py-2 px-4 !rounded-button text-sm font-medium">
                    <i class="ri-save-line mr-1"></i>
                    Enregistrer
                </button>
                <button
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 !rounded-button text-sm font-medium hidden">
                    <i class="ri-download-line mr-1"></i>
                    Export CSV
                </button>
            </div>
            <div class="px-4 pb-4">
                <button @click="$emit('closeSaveForm')"
                    class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 !rounded-button text-sm font-medium">
                    Annuler
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner';
import { useClientStore, useTransactionStore } from '../../stores/index.js'

const clientStore = useClientStore();
const transactionStore = useTransactionStore();

const emit = defineEmits(['closeSaveForm', 'saved']);
// Paramètres dynamiques de la requête
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
//     field_ref,
const form = reactive({
    entity_type: "node",
    bundle: "card_transaction",
    title: "Ref",
    field_client: '',
    field_date: '',
    field_expression: '',
    field_note: '',
    field_total: '',
    status: 1,
});

// Messages d'erreur
const errors = reactive({
    field_date: '',
    field_client: ''
})

const props = defineProps({
    results: Object
})

const fetchClients = async () => {
    await clientStore.fetchClients(queryOptions.value);
}

const handleSubmit = async () => {
    if (!validateForm()) return
    try {
        await transactionStore.saveTransactionData(form);
    } catch (error) {
        toast.error("Une erreur est survenue lors de l'enregistrement !")
    }

    if (transactionStore.error) {
        toast.error("Une erreur est survenue lors de l'enregistrement !")
        return
    }

    toast.success("Enregistrement effectué avec succès !")
    emit('saved');
    emit('closeSaveForm');
}

// Validation form
const validateForm = () => {
    let valid = true

    // Reset erreurs
    errors.field_date = ''
    errors.field_client = ''

    if (!form.field_date) {
        errors.field_date = 'La date est requise'
        valid = false
    }

    if (!form.field_client) {
        errors.field_client = 'Le client est requis'
        valid = false
    }

    return valid
}

watch(
    () => props.results,
    (data) => {
        form.field_expression = data.exp;
        form.field_total = data.total
    },
    { immediate: true }
)

onMounted(() => {
    const today = new Date().toISOString().substr(0, 10) // format yyyy-mm-dd
    form.field_date = today
    fetchClients();
})
</script>

<style></style>