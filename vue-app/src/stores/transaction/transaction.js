import { defineStore } from "pinia";
import { ref } from "vue";
import { buildQueryParams } from "../../utils/queryBuilder.js";
import {
  deleteTransaction,
  getTransactionDetails,
  getTransactions,
  saveTransaction,
} from "../../services/transactions.js";

export const useTransactionStore = defineStore("transaction", () => {
  const transactions = ref({ rows: [], total: 0 });
  const transaction = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const transactionId = ref(0);

  // fetchTransactions: si append=true, on ajoute les nouvelles données
  async function fetchTransactions(options, append = false) {
    loading.value = true;
    error.value = null;
    try {
      const query = buildQueryParams(options);
      const response = await getTransactions(query);

      const data = response.data;

      if (!data || !Array.isArray(data.rows)) {
        throw new Error("Réponse historique invalide");
      }

      if (append && transactions.value.rows.length) {
        // Ajouter les nouvelles données à la liste existante
        transactions.value.rows = [...transactions.value.rows, ...data.rows];
        transactions.value.total = data.total ?? transactions.value.total;
      } else {
        // Remplacer les données
        transactions.value = { rows: data.rows, total: data.total || 0 };
      }
    } catch (err) {
      error.value = err;
      if (!append) {
        transactions.value = { rows: [], total: 0 };
      }
    } finally {
      loading.value = false;
    }
  }

    async function getTransaction(id, options) {
      loading.value = true;
      try {
        const query = buildQueryParams(options);
        const response = await getTransactionDetails(id,query);
        transaction.value = response.data;
      } catch (err) {
        error.value = err;
      } finally {
        loading.value = false;
      }
    }

  async function saveTransactionData(transactionData) {
    loading.value = true;
    error.value = null;

    try {
      // Création de la transaction
      const response = await saveTransaction(transactionData);
      if (!response?.data?.item) {
        throw new Error("Impossible de récupérer l'ID de la transaction.");
      }

      const transId = Number(response.data.item);

      // Mettre à jour localement le titre
      const updatedTransaction = {
        entity_type: "node",
        bundle: "card_transaction",
        title: `Ref-${transId}`,
        nid: transId,
      };

      // Ici, on envoie une seule requête pour créer + titre
      const finalResponse = await saveTransaction(updatedTransaction);
      transactionId.value = transId;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  async function destroyTransaction(id) {
    loading.value = true;
    error.value = null;
    try {
      const res = await deleteTransaction(id);
      if (res.data.status) {
        transactions.value.rows = transactions.value.rows.filter((t) => t.nid != id);
        transactions.value.total -= 1; 
      }
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  return {
    transactions,
    transaction,
    loading,
    error,
    transactionId,
    getTransaction,
    fetchTransactions,
    saveTransactionData,
    destroyTransaction,
  };
});
