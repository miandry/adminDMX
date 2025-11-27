<template>
    <!-- Popup Modal -->
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <form class="bg-white rounded-lg shadow-lg max-w-sm w-5/6">
            <div>
                <div class="p-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">
                        Ajouter un client
                    </h3>
                </div>
                <div class="p-4 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet <span
                                class="ms-1 text-red-500">*</span></label>
                        <input type="text" required class="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder="Entrez le nom" v-model="form.title"
                            :class="[ errors.title ? 'border-red-500': 'border-gray-300'] ">
                        <p v-if="errors.title" class="text-red-500 text-xs mt-1">{{ errors.title }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                        <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Numéro de téléphone" v-model="form.field_phone">
                    </div>
                </div>
                <div class="flex gap-2 p-4 border-t border-gray-200">
                    <button @click.prevent="handleSubmit"
                        class="flex-1 bg-secondary hover:bg-secondary/90 text-white py-2 px-4 !rounded-button text-sm font-medium">
                        <i class="ri-save-line mr-1"></i>
                        Enregistrer
                    </button>
                </div>
                <div class="px-4 pb-4">
                    <button @click.prevent="$emit('closeSaveclient')"
                        class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 !rounded-button text-sm font-medium">
                        Annuler
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import { toast } from 'vue-sonner';
import { useClientStore } from '../../stores';

const form = reactive({
    entity_type: "node",
    bundle: "client",
    title: "",
    field_phone: '',
    status: 1,
});

// Messages d'erreur
const errors = reactive({
    title: '',
})

const emit = defineEmits(['closeSaveclient']);
const clientStore = useClientStore();

const handleSubmit = async () => {
    if (!validateForm()) return
    await clientStore.saveClientData(form)
    if (clientStore.error) {
        toast.error("Une erreur est survenue lors de l'ajout");
        return;
    }
    toast.success("Client ajouté avec succès!")
    emit('closeSaveclient', clientStore.newClientId);
}

// Validation form
const validateForm = () => {
    let valid = true

    // Reset erreurs
    errors.title = ''

    if (!form.title) {
        errors.title = 'Le nom est requis'
        valid = false
    }

    return valid
}

</script>

<style></style>