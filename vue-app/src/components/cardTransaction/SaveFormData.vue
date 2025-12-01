<template>
    <!-- Popup Modal -->
    <div>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            :class="[showClientForm ? 'hidden' : '']">
            <div class="bg-white mx-4 rounded-lg shadow-lg w-full max-w-sm">
                <div class="p-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">
                        Enregistrer le Calcul
                    </h3>
                </div>
                <div class="p-4 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Client</label>
                        <div class="flex gap-2">
                            <div class="relative flex-1">
                                <select v-model="form.field_client" :class="{ 'border-red-500': errors.field_client }"
                                    @click="fetchClients"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white">
                                    <option value="">Sélectionner une client</option>
                                    <option v-for="client in clientStore.clients.rows" :key="client.nid"
                                        :value="client.nid">
                                        {{ client.title.charAt(0).toUpperCase() + client.title.slice(1) }}</option>
                                </select>
                                <i
                                    class="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                            </div>
                            <button @click="openClientForm"
                                class="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 !rounded-lg">
                                <i class="ri-add-line mr-1 text-xl font-medium"></i>

                            </button>
                        </div>
                        <p v-if="errors.field_client" class="text-red-500 text-xs mt-1">{{ errors.field_client }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input type="date" v-model="form.field_date" :class="{ 'border-red-500': errors.field_date }"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        <p v-if="errors.field_date" class="text-red-500 text-xs mt-1">{{ errors.field_date }}</p>
                    </div>

                    <ReferenceInput @sendTransactionId="setNidField" :isSelected="refInputValue" />

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <div class="flex gap-2">
                            <div class="relative flex-1">
                                <select v-model="form.field_currency"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white">
                                    <option value="Ar">Ariary</option>
                                    <option value="Rmb">Rmb</option>
                                </select>
                                <i
                                    class="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
                        <input v-model="form.field_note" type="text"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Ajouter une note...">
                    </div>
                </div>
                <div class="flex gap-2 p-4 border-t border-gray-200">
                    <button @click="handleSubmit"
                        class="flex-1 bg-secondary hover:bg-secondary/90 text-white py-2 px-4 !rounded-button text-sm font-medium">
                        <i class="ri-save-line mr-1"></i>
                        Enregistrer
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
        <AddClient v-if="showClientForm" @closeSaveclient="closeSaveclient" />
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner';
import { useClientStore, useTransactionStore } from '../../stores/index.js'
import ReferenceInput from "../cardTransaction/ReferenceInput.vue"
import AddClient from './AddClient.vue';

const clientStore = useClientStore();
const transactionStore = useTransactionStore();
const totalRef = ref(0);
const showClientForm = ref(false);
const isEdit = ref(false);
const isRequiredFieldRef = ref(false);
const isLinked = ref(false);
const refInputValue = ref({})


const emit = defineEmits(['closeSaveForm', 'saved', 'removeBtn']);
// Paramètres dynamiques de la requête
const queryOptions = ref({
    fields: [
        'nid',
        'title',
        'field_phone',
    ],
    sort: { val: 'title', op: 'asc' },
    filters: {},
    pager: 0,
    offset: 100
})
//     field_ref,
const form = reactive({
    entity_type: "node",
    bundle: "card_transaction",
    nid: '',
    title: "Ref",
    field_client: '',
    field_date: '',
    field_ref: '',
    field_expression: '',
    field_note: '',
    field_total: '',
    field_currency: 'Ar',
    status: 1,
});

// Messages d'erreur
const errors = reactive({
    field_date: '',
    field_client: '',
    field_ref: '',
})

const props = defineProps({
    results: Object
})

const fetchClients = async () => {
    await clientStore.fetchClients(queryOptions.value);
}

const handleSubmit = async () => {
    if (!validateForm()) return
    form.field_client = parseInt(form.field_client, 10)
    form.field_total += parseFloat(totalRef.value)
    const payload = { ...form };
    if (!isEdit.value) {
        delete payload.nid;
    }
    if (!payload.field_ref) {
        delete payload.field_ref;
    }
    try {
        await transactionStore.saveTransactionData(payload);
    } catch (error) {
        toast.error("Une erreur est survenue lors de l'enregistrement !")
    }

    if (transactionStore.error) {
        toast.error("Une erreur est survenue lors de l'enregistrement !")
        return
    }

    const message = isEdit.value
        ? "Modification enregistrée avec succès !"
        : "Enregistrement effectué avec succès !"

    toast.success(message)
    emit('saved', transactionStore.transactionId);
    emit('closeSaveForm');
    emit('removeBtn');
}

// Validation form
const validateForm = () => {
    let valid = true

    // Reset erreurs
    errors.field_date = ''
    errors.field_client = ''
    errors.field_ref = ''

    if (!form.field_client) {
        errors.field_client = 'Le client est requis'
        valid = false
    }

    if (!form.field_date) {
        errors.field_date = 'La date est requise'
        valid = false
    }

    if (isLinked.value && isRequiredFieldRef.value) {
        if (!form.field_ref) {
            errors.field_ref = 'Ce champ est requis'
            valid = false
        }
    }

    return valid
}

const setNidField = (data) => {
    if (data.required) {
        isRequiredFieldRef.value = true;
        isLinked.value = true;
    } else {
        isRequiredFieldRef.value = false;
        isLinked.value = false;
    }
    if (data.nid) {
        form.field_ref = parseInt(data.nid, 10);
        totalRef.value = data.total
    } else {
        form.field_ref = '';
        totalRef.value = 0
    }
}

const openClientForm = () => {
    showClientForm.value = true;
}

const closeSaveclient = async (value = '') => {
    if (value != '') {
        await fetchClients();
    }
    form.field_client = value;
    showClientForm.value = false
}

watch(
    () => props.results,
    (data) => {
        if (data.transactionInfo) {
            if (data.transactionInfo.nid) {
                fetchClients();
                isEdit.value = true;
                form.nid = data.transactionInfo.nid;
                form.field_client = data.transactionInfo.field_client.nid
                form.field_date = data.transactionInfo.field_date
                if (data.transactionInfo.field_ref) {
                    const refObj = {
                        nid: data.transactionInfo.field_ref.nid,
                        total: data.transactionInfo.field_ref.field_total,
                        title: data.transactionInfo.field_ref.title,
                        currency: data.transactionInfo.field_ref.field_currency == "Ar" ? "Ar" : "Rmb",
                        isLinked: true,
                    }
                    refInputValue.value = refObj;
                    form.field_ref = data.transactionInfo.field_ref
                    isLinked.value = true;
                    isRequiredFieldRef.value = true;
                } else {
                    refInputValue.value = {
                        nid: '',
                        total: '',
                        title: '',
                        isLinked: false,
                    };
                    isRequiredFieldRef.value = false;
                    isLinked.value = false;
                }
                form.field_expression = data.exp
                form.field_note = data.transactionInfo.field_note
                form.field_total = data.total
                form.field_currency = data.transactionInfo.field_currency == "Ar" ? "Ar" : "Rmb"
            }
        } else {
            refInputValue.value = {
                nid: '',
                total: '',
                title: '',
                isLinked: false,
            };
            isRequiredFieldRef.value = false;
            isLinked.value = false;
            form.field_expression = data.exp;
            form.field_total = data.total;
        }
    },
    { immediate: true }
)

onMounted(() => {
    const today = new Date().toISOString().substr(0, 10) // format yyyy-mm-dd
    form.field_date = today
})
</script>

<style></style>