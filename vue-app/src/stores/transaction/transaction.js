import { defineStore } from "pinia";
import { ref } from "vue";
import { buildQueryParams } from "../../utils/queryBuilder.js";
import {
  getTransactions,
  saveTransaction,
} from "../../services/transactions.js";

export const useTransactionStore = defineStore("transaction", () => {
  const transactions = ref({ rows: [], total: 0 });
  const transaction = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // fetchTransactions: si append=true, on ajoute les nouvelles données
  async function fetchTransactions(options, append = false) {
    loading.value = true;
    try {
      const query = buildQueryParams(options);
      const response = await getTransactions(query);

      const data = response.data;

      if (append && transactions.value.rows.length) {
        // Ajouter les nouvelles données à la liste existante
        transactions.value.rows = [...transactions.value.rows, ...data.rows];
      } else {
        // Remplacer les données
        transactions.value = data;
      }
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  //   async function fetchTransaction(id) {
  //     loading.value = true;
  //     const query = `filters[nid][val]=${id}`;
  //     try {
  //       const response = await getClients(query);
  //       client.value = response.data.rows[0];
  //       return response.data.rows[0];
  //     } catch (err) {
  //       error.value = err;
  //     } finally {
  //       loading.value = false;
  //     }
  //   }

  async function saveTransactionData(transactionData) {
    loading.value = true;
    error.value = null;

    try {
      // Création de la transaction
      const response = await saveTransaction(transactionData);
      if (!response?.data?.item) {
        throw new Error("Impossible de récupérer l'ID de la transaction.");
      }

      const transactionId = Number(response.data.item);

      // Mettre à jour localement le titre
      const updatedTransaction = {
        entity_type: "node",
        bundle: "card_transaction",
        title: `Ref-${transactionId}`,
        nid: transactionId,
      };

      // Ici, on envoie une seule requête pour créer + titre
      const finalResponse = await saveTransaction(updatedTransaction);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
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
    fetchTransactions,
    saveTransactionData,
  };
});
