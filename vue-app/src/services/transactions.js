import { getLists, saveItem } from "./api";

export function getTransactions(params) {
  return getLists("node", "card_transaction", params);
}

export function saveTransaction(params) {
  return saveItem(params);
}
