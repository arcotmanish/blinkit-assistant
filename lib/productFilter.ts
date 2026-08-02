import productsData from '../data/products.json';
import usersData from '../data/users.json';

export function getCandidates(goalId: string, selectedFilters: string[] = []) {
  // 1. Filter by goal ID
  let candidates = productsData.filter(product => 
    product.goal_tags && product.goal_tags.includes(goalId)
  );

  // 2. Filter by hardcoded filters (AND logic: must have all selected filters)
  if (selectedFilters && selectedFilters.length > 0) {
    candidates = candidates.filter(product => {
      // Return true if every selected filter exists in the product's filter_tags
      return selectedFilters.every(filter => 
        product.filter_tags && product.filter_tags.includes(filter)
      );
    });
  }

  // 3. Cross-reference with user order history
  // For the MVP, we use the first (and only) demo user
  const demoUser = usersData[0];
  const orderHistoryProductIds = demoUser.order_history.map(item => item.product_id);

  // 4. Map the candidates and flag if they are from history
  const mappedCandidates = candidates.map(product => {
    return {
      ...product,
      from_history: orderHistoryProductIds.includes(product.product_id)
    };
  });

  // 5. Limit to maximum 10 candidates
  return mappedCandidates.slice(0, 10);
}
