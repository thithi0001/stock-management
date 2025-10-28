export async function getCustomers(api) {
  return await api.get('api/customers');
}