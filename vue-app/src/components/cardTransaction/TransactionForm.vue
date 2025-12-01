<template>
    <div class="h-full">
        <!-- Input/Output Section -->
        <section class="mt-2 h-4/6">
            <div class="bg-white rounded-lg p-3 shadow-sm h-full">
                <div class="space-y-2 h-full">
                    <div class="">
                        <label class="block text-xs font-medium text-gray-700 mb-1">Résultat</label>
                        <textarea :value="totalResults"
                            class="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 resize-none"
                            readonly placeholder="Résultat calculé" rows="1"></textarea>
                    </div>
                    <div class="h-4/5">
                        <label class="block text-xs font-medium text-gray-700 mb-1">Valeur d'Entrée</label>
                        <div class="relative h-4/5">
                            <textarea v-model="inputValue"
                                :class="{ 'border-red-500': errorMessage, 'border-gray-300': !errorMessage }"
                                class="w-full h-full px-2 py-2 border rounded-lg text-sm min-h-20 overflow-hidden"
                                placeholder="Saisir une valeur"></textarea>
                            <p v-if="errorMessage" class="text-red-500 text-xs mt-1">{{ errorMessage }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- Submit Buttons -->
        <section class="mt-2 mb-2">
            <div class="flex gap-2">
                <button @click="calculateResults"
                    class="flex-1 bg-primary bg-secondary hover:bg-secondary/90 text-white py-2.5 px-4 !rounded-button font-medium text-sm">
                    <i class="ri-equal-line text-sm mr-1"></i><i class="ri-equal-line text-sm mr-1"></i>
                </button>
                <button @click="resetInput"
                    class="bg-red-200 hover:bg-red-300 py-2.5 px-4 !rounded-button font-medium text-sm cursor-pointer">
                    <i class="ri-delete-bin-line text-red-700 text-sm"></i>
                </button>
            </div>
        </section>
        <section class="mt-2 mb-2">
            <div class="flex gap-2">
                <button @click="sendTransactionData"
                    class="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 px-4 !rounded-button font-medium text-sm">
                    <i class="ri-save-line mr-2"></i>
                    Soumettre le Calcul
                </button>
                <button @click="$emit('openHistory')"
                    class="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 px-4 !rounded-button font-medium text-sm">
                    <i class="ri-history-line"></i>
                </button>
            </div>
        </section>
        <section class="mt-2 mb-2">
            <div class="flex gap-2">
                <button @click="cancelEdit" v-if="canEdit"
                    class="flex-1 bg-yellow-500 hover:bg-yellow-400 text-white py-2.5 px-4 !rounded-button font-medium text-sm">
                    <i class="ri-close-line mr-2"></i>
                    Annuler la modification
                </button>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const inputValue = ref('');
const displayResults = ref('');
const dataResults = ref('');
const errorMessage = ref('');
const hasError = ref(false);
const totalResults = ref('');
const canEdit = ref(false);
const emit = defineEmits(['openSaveForm', 'openHistory', 'cancelEdit']);
const props = defineProps({
    transToEdit: Object,
})

defineExpose({
    resetInput,
    cancelEdit
});

// Formate les nombres avec séparateurs de milliers
function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // espace insécable
}

// Calculer et formater les résultats ligne par ligne
function calculateResults() {
    totalResults.value = 0;
    errorMessage.value = '';
    hasError.value = false;

    const lines = inputValue.value.split('\n');
    const results = [];
    const formatedResults = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        try {
            // Séparer expression et commentaire
            const [exprPart, commentPart] = trimmed.split('#');

            const expr = exprPart
                .trim()
                .replace(/×/g, '*')
                .replace(/=/g, '');

            if (!expr) return;

            const value = Function(`return ${expr}`)();
            totalResults.value += value;

            const formattedValue = formatNumber(value);

            const exprForDisplay = expr.replace(/\*/g, '×').trim();

            // Reconstruction de la ligne avec commentaire
            const comment = commentPart ? ` #${commentPart.trim()}` : '';

            const savedLine = `${exprForDisplay} = ${formattedValue}${comment}`;

            // Ligne pour dataResults (sans commentaire)
            const displayLine = `${exprForDisplay} = ${formattedValue}`;

            results.push(displayLine);
            formatedResults.push(savedLine);

        } catch {
            results.push(`Ligne ${index + 1}: Erreur dans l'expression`);
            hasError.value = true;
        }
    });

    if (hasError.value) {
        errorMessage.value = 'Une ou plusieurs expressions sont invalides.';
        displayResults.value = '';
        dataResults.value = '';
        totalResults.value = '';
    } else {
        displayResults.value = results.join('\n');
        dataResults.value = formatedResults.join('\n');
        errorMessage.value = '';
    }
}


// Réinitialiser l'entrée et le résultat
function resetInput() {
    inputValue.value = '';
    displayResults.value = '';
    errorMessage.value = '';
    hasError.value = false;
    dataResults.value = '';
    totalResults.value = '';
}

// Soumettre uniquement si pas d'erreur
function sendTransactionData() {
    if (!hasError.value && dataResults.value) {
        const data = {
            exp: dataResults.value,
            total: parseFloat(totalResults.value)
        };
        // Si on édite, on ajoute transactionInfo
        if (props.transToEdit) {
            data.transactionInfo = props.transToEdit;
        }
        emit('openSaveForm', data);
    }
}

function cleanExpressionLines(text) {
    return text
        .split('\n')
        .map(line => {
            line = line.trim();
            if (!line) return '';

            // Extraire commentaire (ex: "#toky")
            let comment = '';
            const commentIndex = line.indexOf('#');

            if (commentIndex !== -1) {
                comment = line.slice(commentIndex).trim(); // "#toky"
                line = line.slice(0, commentIndex).trim(); // "123×2 = 246"
            }

            // Retirer le total après "="
            const expr = line.split('=')[0].trim(); // "123×2"

            // Remplacer × par *
            const cleanedExpr = expr.replace(/×/g, '*');

            return comment ? `${cleanedExpr} ${comment}` : cleanedExpr;
        })
        .join('\n');
}

function cancelEdit() {
    resetInput();
    canEdit.value = false
    emit('cancelEdit')
}

watch(
    () => props.transToEdit,
    (val) => {
        if (val) {
            canEdit.value = true
            inputValue.value = cleanExpressionLines(val.field_expression);
            calculateResults();
        }
    },
    { deep: true, immediate: true }
);

</script>
<style></style>