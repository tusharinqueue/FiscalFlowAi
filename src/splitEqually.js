// pure function - splits amount equally among all members
// returns an object like { Alice: 33.33, Bob: 33.33, Carol: 33.33 }
function splitEqually(amount, members) {
  const share = amount / members.length
  const result = {}
  for (let i = 0; i < members.length; i++) {
    result[members[i]] = parseFloat(share.toFixed(2))
  }
  return result
}

export default splitEqually
