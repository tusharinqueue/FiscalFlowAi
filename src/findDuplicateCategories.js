// pure function to find categories used more than once
function findDuplicateCategories(subscriptions) {
  const counts = {}
  
  // count how many times each category appears
  for (let i = 0; i < subscriptions.length; i++) {
    const cat = subscriptions[i].category
    if (counts[cat]) {
      counts[cat] += 1
    } else {
      counts[cat] = 1
    }
  }

  // keep only the ones that appear 2 or more times
  const duplicates = []
  for (const cat in counts) {
    if (counts[cat] > 1) {
      duplicates.push(cat)
    }
  }
  
  return duplicates
}

export default findDuplicateCategories
