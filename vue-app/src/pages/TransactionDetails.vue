<template>
    <div v-if="tr.nid">
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
                Details
            </h3>
            <button class="text-gray-400 hover:text-gray-600" @click="$emit('closeDetails')">
                <i class="ri-close-line text-xl"></i>
            </button>
        </div>
        <div class="p-4 space-y-3 mb-20">
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <div class="text-sm font-medium text-gray-900 mb-1">
                            {{ tr.field_client.title }}
                        </div>
                        <div class="text-sm font-medium text-green-500">{{ tr.title }}</div>
                        <div class="text-xs text-gray-500">{{ tr.field_date }}</div>
                    </div>
                    <button class="text-gray-400 hover:text-red-500 ml-2" @click="openConfirmDelete(tr)">
                        <i class="ri-delete-bin-line text-sm text-red-500"></i>
                    </button>
                </div>
                <div class="">
                    <div>
                        <div class="text-xs text-gray-600 mb-1">Expression:</div>
                        <div class="text-sm text-gray-800 rounded mb-1 font-mono text-xs" v-if="tr.field_ref">
                            <div class="flex justify-between items-center py-1">
                                <span class="text-xs font-medium text-gray-700">Liaison: {{
                                    tr.field_ref.title }} =
                                    {{
                                        Number(tr.field_ref.field_total).toLocaleString('fr-FR')
                                    }}
                                    Ar</span>
                            </div>
                        </div>
                        <div class="text-sm text-gray-800 bg-white rounded px-2 py-1 font-mono text-xs"
                            v-html="tr.field_expression.replace(/\r?\n/g, '<br>')">
                        </div>
                    </div>
                    <div class="space-y-1">
                        <div class=" border-t pt-1"></div>
                        <div v-for="(sum, comment) in totals.byComment" :key="comment" class="flex justify-between">
                            <span class="text-xs font-medium text-gray-700">#{{ comment }} :</span>
                            <span class="text-xs font-bold text-gray-600">{{ sum.toLocaleString('fr-FR') }} Ar</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-medium text-gray-700">Total Positif :</span>
                            <span class="text-xs font-bold text-green-600">
                                {{ totals.positive.toLocaleString('fr-FR') }} Ar
                            </span>
                        </div>

                        <div class="flex justify-between items-center">
                            <span class="text-xs font-medium text-gray-700">Total Négatif :</span>
                            <span class="text-xs font-bold text-red-600">
                                {{ totals.negative.toLocaleString('fr-FR') }} Ar
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-medium text-gray-700">Total:</span>
                            <span class="text-xs font-bold text-purple-600">{{
                                Number(tr.field_total).toLocaleString('fr-FR') }} Ar</span>
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="text-xs text-gray-600 mb-1 hidden">Note:</div>
                        <div class="text-sm text-gray-700">
                            {{ tr.field_note }}
                        </div>
                    </div>
                </div>
                <div class="flex gap-2 mt-3">
                    <button @click="sendEditData(tr)"
                        class="flex-1 bg-primary hover:bg-primary/90 text-white py-1.5 px-3 !rounded-button text-xs font-medium">
                        <i class="ri-edit-line mr-1"></i>
                        Charger
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useTransactionStore } from '../stores/index.js';
import { toast } from 'vue-sonner';

const props = defineProps({
    trId: {
        type: Number,
        required: true
    },
    refreshKey: Number
})

const transactionStore = useTransactionStore();
const tr = ref({});
const emit = defineEmits(['openConfirmDelete', 'closeDetails']);
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
        field_ref: ['title', 'nid', 'field_total', 'field_client']
    }
})

const totals = computed(() => {
    if (!tr.value.field_expression) return {
        positive: 0,
        negative: 0,
        byComment: {}
    };

    const lines = tr.value.field_expression.split(/\r?\n/);

    let positive = 0;
    let negative = 0;
    const byComment = {}; // objet pour stocker le total par commentaire

    for (const line of lines) {
        // récupère le nombre après '='
        const matchNum = line.match(/=\s*([\-0-9\s]+)/);
        if (!matchNum) continue;

        // nettoyer tous les espaces (y compris insécables)
        const num = Number(matchNum[1].replace(/\s/g, ''));
        if (isNaN(num)) continue;

        // total global positif/négatif
        if (num >= 0) positive += num;
        else negative += num;

        // récupère le commentaire s'il existe (tout après '#')
        const matchComment = line.match(/#(.+)$/);
        const comment = matchComment ? matchComment[1].trim() : "";

        if (!byComment[comment]) byComment[comment] = 0;
        byComment[comment] += num;
    }

    return { positive, negative, byComment };
});

watch(() => [props.trId, props.refreshKey], async () => {
    if (props.trId > 0) {
        await transactionStore.getTransaction(props.trId, queryOptions.value)
        tr.value = transactionStore.transaction
    }
})

const openConfirmDelete = (value) => {
    const data = [value, 'details']
    emit('openConfirmDelete', data)
}

const sendEditData = (transaction) => {
    emit('closeDetails', transaction)
}

onMounted(async () => {
    try {
        if (props.trId > 0) {
            await transactionStore.getTransaction(props.trId, queryOptions.value);

            if (transactionStore.error) {
                toast.error("Erreur lors du chargement de la transaction!");
                return;
            }

            tr.value = transactionStore.transaction;
        }
    } catch (error) {
        toast.error("Une erreur est survenue!");
    }
})
</script>

<style></style>