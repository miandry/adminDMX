import { deleteItem, getDetails, getLists, saveItem } from "./api";

export function getTransactions(params) {
  return getLists("node", "card_transaction", params);
}
export function getTransactionDetails(id, params) {
  return getDetails("node", "card_transaction", id, params);
}

export function saveTransaction(params) {
  return saveItem(params);
}

export function deleteTransaction(id) {
  return deleteItem("node", id);
}