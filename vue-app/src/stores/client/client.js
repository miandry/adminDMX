import { defineStore } from "pinia";
import { ref } from "vue";
import { getClients, saveClient } from "../../services/clients.js";
import { buildQueryParams } from "../../utils/queryBuilder.js";

export const useClientStore = defineStore("client", () => {
  const clients = ref({ rows: [], total: 0 });
  const client = ref([]);
  const newClientId = ref('');
  const loading = ref(false);
  const error = ref(null);

  // fetchClient
  async function fetchClients(options) {
    loading.value = true;
    try {
      const query = buildQueryParams(options);
      const response = await getClients(query);
      clients.value = response.data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  async function saveClientData(data) {
      loading.value = true;
    try {
      const response = await saveClient(data);
      newClientId.value = response.data.item;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  return {
    clients,
    client,
    loading,
    error,
    fetchClients,
    saveClientData,
    newClientId
  };
});
