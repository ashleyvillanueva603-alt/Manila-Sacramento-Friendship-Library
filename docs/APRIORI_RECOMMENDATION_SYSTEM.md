# Association Rule-Based Genre Recommendation System
## Using Apriori Algorithm for Library Book Recommendations

---

## Section 1: Overview

### How Association Rules Power Genre Recommendations

Association rule mining discovers interesting relationships between items in large datasets. In our library system, we analyze **borrowing transactions** to find patterns like:

- "Users who borrow **Mystery** books often also borrow **Thriller** books"
- "Users who borrow **Science Fiction** and **Fantasy** together tend to also borrow **Adventure**"

The **Apriori algorithm** efficiently discovers these patterns by:
1. Finding **frequent itemsets** (genre combinations that appear often)
2. Generating **association rules** from these itemsets (if X then Y)
3. Filtering rules by **confidence** and **lift** to ensure quality

**Real-world application**: When a user borrows books from certain genres, we use mined rules to recommend other genres they're likely to enjoy, similar to how Amazon recommends products or Netflix suggests movies.

---

## Section 2: Data Assumptions and Preprocessing

### Data Schema

\`\`\`typescript
interface BorrowTransaction {
  transaction_id: string
  user_id: number
  genres: string[]  // Array of genres borrowed in this session
  timestamp: Date
}
\`\`\`

### Data Assumptions

1. **Transaction Definition**: Each borrowing session (same day, same user) forms one transaction
2. **Item Definition**: Each unique genre is an item
3. **Deduplication**: If a user borrows multiple books of the same genre in one session, we count it once
4. **Allowed Genres**: Only genres from our predefined list are considered

### Preprocessing Steps

**Step 1: Extract Borrowing Sessions**
\`\`\`sql
SELECT 
  user_id,
  DATE(borrow_date) as session_date,
  GROUP_CONCAT(DISTINCT b.genre) as genres
FROM borrow_records br
JOIN books b ON br.book_id = b.id
WHERE br.status IN ('borrowed', 'returned')
  AND b.genre IS NOT NULL
GROUP BY user_id, DATE(borrow_date)
\`\`\`

**Step 2: Parse and Deduplicate Genres**
\`\`\`python
def preprocess_transactions(raw_data):
    transactions = []
    for row in raw_data:
        # Split genres and remove duplicates
        genres = set(row['genres'].split(','))
        # Filter to allowed genres only
        genres = genres.intersection(ALLOWED_GENRES)
        if len(genres) > 0:
            transactions.append({
                'transaction_id': f"{row['user_id']}_{row['session_date']}",
                'user_id': row['user_id'],
                'genres': list(genres),
                'timestamp': row['session_date']
            })
    return transactions
\`\`\`

**Step 3: Support Computation**
- **Support** = (Number of transactions containing itemset) / (Total transactions)
- Example: If "Mystery" appears in 40 out of 100 transactions, support = 0.4

---

## Section 3: Apriori Algorithm Steps

### Parameters
- **minsup** = 0.2 (20% minimum support)
- **minconf** = 0.6 (60% minimum confidence)
- **minlift** = 1.2 (20% lift improvement over random)
- **top_k** = 10 (top 10 recommendations per user)
- **Allowed genres**: Fiction, Mystery, Thriller, Romance, Science Fiction, Fantasy, Historical Fiction, Biography, Self-Help, Business

### Algorithm Stages

#### Stage 1: Generate C1 and L1 (1-itemsets)

**C1 (Candidate 1-itemsets)**: All unique genres
\`\`\`
C1 = {Mystery}, {Thriller}, {Romance}, {Drama}, {Sci-Fi}, {Fantasy}, {Crime}
\`\`\`

**Count occurrences** in all transactions:
\`\`\`
Mystery: 3 transactions
Thriller: 2 transactions
Romance: 1 transaction
Drama: 1 transaction
Sci-Fi: 1 transaction
Fantasy: 1 transaction
Crime: 2 transactions
\`\`\`

**Calculate support** (N = 5 total transactions):
\`\`\`
supp(Mystery) = 3/5 = 0.6
supp(Thriller) = 2/5 = 0.4
supp(Romance) = 1/5 = 0.2
supp(Drama) = 1/5 = 0.2
supp(Sci-Fi) = 1/5 = 0.2
supp(Fantasy) = 1/5 = 0.2
supp(Crime) = 2/5 = 0.4
\`\`\`

**L1 (Frequent 1-itemsets)** with minsup = 0.2:
\`\`\`
L1 = {Mystery: 0.6}, {Thriller: 0.4}, {Romance: 0.2}, {Drama: 0.2}, 
     {Sci-Fi: 0.2}, {Fantasy: 0.2}, {Crime: 0.4}
\`\`\`

#### Stage 2: Generate C2 from L1, Prune to L2

**C2 (Candidate 2-itemsets)**: All combinations of L1 items
\`\`\`
C2 = {Mystery, Thriller}, {Mystery, Romance}, {Mystery, Drama}, 
     {Mystery, Sci-Fi}, {Mystery, Fantasy}, {Mystery, Crime},
     {Thriller, Romance}, {Thriller, Drama}, {Thriller, Sci-Fi},
     {Thriller, Fantasy}, {Thriller, Crime}, ...
\`\`\`

**Count occurrences**:
\`\`\`
{Mystery, Thriller}: 2 (T1, T5)
{Mystery, Crime}: 2 (T3, T5)
{Thriller, Crime}: 1 (T5)
{Romance, Drama}: 1 (T2)
{Sci-Fi, Fantasy}: 1 (T4)
... (others: 0)
\`\`\`

**Calculate support**:
\`\`\`
supp({Mystery, Thriller}) = 2/5 = 0.4
supp({Mystery, Crime}) = 2/5 = 0.4
supp({Thriller, Crime}) = 1/5 = 0.2
supp({Romance, Drama}) = 1/5 = 0.2
supp({Sci-Fi, Fantasy}) = 1/5 = 0.2
\`\`\`

**L2 (Frequent 2-itemsets)** with minsup = 0.2:
\`\`\`
L2 = {Mystery, Thriller: 0.4}, {Mystery, Crime: 0.4}, 
     {Thriller, Crime: 0.2}, {Romance, Drama: 0.2}, 
     {Sci-Fi, Fantasy: 0.2}
\`\`\`

#### Stage 3: Generate C3 from L2

**C3 (Candidate 3-itemsets)**: Combine L2 items with common prefixes
\`\`\`
C3 = {Mystery, Thriller, Crime}
\`\`\`

**Count occurrences**:
\`\`\`
{Mystery, Thriller, Crime}: 1 (T5)
\`\`\`

**Calculate support**:
\`\`\`
supp({Mystery, Thriller, Crime}) = 1/5 = 0.2
\`\`\`

**L3 (Frequent 3-itemsets)**:
\`\`\`
L3 = {Mystery, Thriller, Crime: 0.2}
\`\`\`

#### Stage 4: Generate C4 from L3

No more combinations possible. **Algorithm terminates**.

**Final Frequent Itemsets**:
\`\`\`
L1: 7 itemsets
L2: 5 itemsets
L3: 1 itemset
Total: 13 frequent itemsets
\`\`\`

#### Stage 5: Generate Association Rules

From each frequent itemset with k ≥ 2, generate all possible rules.

**From {Mystery, Thriller}**:
- Mystery → Thriller
- Thriller → Mystery

**From {Mystery, Crime}**:
- Mystery → Crime
- Crime → Mystery

**From {Mystery, Thriller, Crime}**:
- Mystery → {Thriller, Crime}
- Thriller → {Mystery, Crime}
- Crime → {Mystery, Thriller}
- {Mystery, Thriller} → Crime
- {Mystery, Crime} → Thriller
- {Thriller, Crime} → Mystery

**Filter by minconf = 0.6 and minlift = 1.2** (see Section 4 for calculations)

---

## Section 4: Metric Formulas

### Support
**Definition**: Proportion of transactions containing the itemset

$$\text{supp}(X) = \frac{\text{count}(X)}{N}$$

Where:
- count(X) = number of transactions containing all items in X
- N = total number of transactions

**Example**: supp({Mystery}) = 3/5 = 0.6

### Confidence
**Definition**: Conditional probability that Y appears given X appears

$$\text{conf}(X \rightarrow Y) = \frac{\text{supp}(X \cup Y)}{\text{supp}(X)}$$

**Interpretation**: Of all transactions containing X, what percentage also contain Y?

**Example**: conf(Mystery → Thriller) = supp({Mystery, Thriller}) / supp({Mystery}) = 0.4 / 0.6 ≈ 0.667

### Lift
**Definition**: How much more likely Y appears when X is present, compared to Y appearing randomly

$$\text{lift}(X \rightarrow Y) = \frac{\text{conf}(X \rightarrow Y)}{\text{supp}(Y)}$$

**Interpretation**:
- lift = 1: X and Y are independent (no association)
- lift > 1: Positive correlation (X increases likelihood of Y)
- lift < 1: Negative correlation (X decreases likelihood of Y)

**Example**: lift(Mystery → Thriller) = conf(Mystery → Thriller) / supp({Thriller}) = 0.667 / 0.4 ≈ 1.667

---

## Section 5: Worked Example

### Input: 5 Toy Transactions

\`\`\`
T1: {Mystery, Thriller}
T2: {Romance, Drama}
T3: {Mystery, Crime}
T4: {Sci-Fi, Fantasy}
T5: {Mystery, Thriller, Crime}
\`\`\`

### Step 1: Generate L1

| Genre | Count | Support |
|-------|-------|---------|
| Mystery | 3 | 0.6 |
| Thriller | 2 | 0.4 |
| Crime | 2 | 0.4 |
| Romance | 1 | 0.2 |
| Drama | 1 | 0.2 |
| Sci-Fi | 1 | 0.2 |
| Fantasy | 1 | 0.2 |

All pass minsup = 0.2, so **L1 = all 7 genres**

### Step 2: Generate L2

| Itemset | Count | Support | Passes? |
|---------|-------|---------|---------|
| {Mystery, Thriller} | 2 | 0.4 | ✓ |
| {Mystery, Crime} | 2 | 0.4 | ✓ |
| {Thriller, Crime} | 1 | 0.2 | ✓ |
| {Romance, Drama} | 1 | 0.2 | ✓ |
| {Sci-Fi, Fantasy} | 1 | 0.2 | ✓ |
| All others | 0 | 0.0 | ✗ |

**L2 = 5 itemsets**

### Step 3: Generate L3

| Itemset | Count | Support | Passes? |
|---------|-------|---------|---------|
| {Mystery, Thriller, Crime} | 1 | 0.2 | ✓ |

**L3 = 1 itemset**

### Step 4: Generate Rules

#### Rule 1: Mystery → Thriller

**Calculations**:
- supp({Mystery, Thriller}) = 2/5 = 0.4
- supp({Mystery}) = 3/5 = 0.6
- supp({Thriller}) = 2/5 = 0.4
- conf(Mystery → Thriller) = 0.4 / 0.6 ≈ **0.667**
- lift(Mystery → Thriller) = 0.667 / 0.4 ≈ **1.667**

**Interpretation**: 
- 66.7% of users who borrow Mystery also borrow Thriller
- Users who borrow Mystery are 1.667× more likely to borrow Thriller than random users
- **Passes filters** (conf ≥ 0.6, lift ≥ 1.2) ✓

#### Rule 2: Mystery → Crime

**Calculations**:
- supp({Mystery, Crime}) = 2/5 = 0.4
- supp({Mystery}) = 3/5 = 0.6
- supp({Crime}) = 2/5 = 0.4
- conf(Mystery → Crime) = 0.4 / 0.6 ≈ **0.667**
- lift(Mystery → Crime) = 0.667 / 0.4 ≈ **1.667**

**Interpretation**:
- 66.7% of users who borrow Mystery also borrow Crime
- Users who borrow Mystery are 1.667× more likely to borrow Crime
- **Passes filters** (conf ≥ 0.6, lift ≥ 1.2) ✓

#### Rule 3: Thriller → Mystery

**Calculations**:
- supp({Mystery, Thriller}) = 2/5 = 0.4
- supp({Thriller}) = 2/5 = 0.4
- supp({Mystery}) = 3/5 = 0.6
- conf(Thriller → Mystery) = 0.4 / 0.4 = **1.0**
- lift(Thriller → Mystery) = 1.0 / 0.6 ≈ **1.667**

**Interpretation**:
- 100% of users who borrow Thriller also borrow Mystery
- Very strong association
- **Passes filters** ✓

#### Rule 4: Crime → Mystery

**Calculations**:
- supp({Mystery, Crime}) = 2/5 = 0.4
- supp({Crime}) = 2/5 = 0.4
- supp({Mystery}) = 3/5 = 0.6
- conf(Crime → Mystery) = 0.4 / 0.4 = **1.0**
- lift(Crime → Mystery) = 1.0 / 0.6 ≈ **1.667**

**Passes filters** ✓

#### Rule 5: Romance → Drama

**Calculations**:
- supp({Romance, Drama}) = 1/5 = 0.2
- supp({Romance}) = 1/5 = 0.2
- supp({Drama}) = 1/5 = 0.2
- conf(Romance → Drama) = 0.2 / 0.2 = **1.0**
- lift(Romance → Drama) = 1.0 / 0.2 = **5.0**

**Passes filters** ✓ (very strong rule!)

### Final Rule Set

| Rule | Support | Confidence | Lift | Quality |
|------|---------|------------|------|---------|
| Mystery → Thriller | 0.4 | 0.667 | 1.667 | Strong |
| Mystery → Crime | 0.4 | 0.667 | 1.667 | Strong |
| Thriller → Mystery | 0.4 | 1.0 | 1.667 | Very Strong |
| Crime → Mystery | 0.4 | 1.0 | 1.667 | Very Strong |
| Romance → Drama | 0.2 | 1.0 | 5.0 | Excellent |
| Drama → Romance | 0.2 | 1.0 | 5.0 | Excellent |
| Sci-Fi → Fantasy | 0.2 | 1.0 | 5.0 | Excellent |
| Fantasy → Sci-Fi | 0.2 | 1.0 | 5.0 | Excellent |

---

## Section 6: Recommendation Logic

### Scoring Formula

For a target user with recent genres $G_u = \{g_1, g_2, ..., g_n\}$, score each candidate genre $y$ using:

$$\text{score}(y) = \sum_{X \subseteq G_u, X \rightarrow y \in \text{Rules}} \text{conf}(X \rightarrow y) \times \text{lift}(X \rightarrow y)$$

**Alternative tunable formula**:
$$\text{score}(y) = \sum_{X \subseteq G_u, X \rightarrow y \in \text{Rules}} \alpha \cdot \text{conf}(X \rightarrow y) + \beta \cdot \text{lift}(X \rightarrow y)$$

Where α = 0.6, β = 0.4 (tunable weights)

### Recommendation Process

**Step 1**: Get user's recent borrowing history (last 30 days)
\`\`\`python
user_genres = get_user_recent_genres(user_id, days=30)
# Example: user_genres = {Mystery, Thriller}
\`\`\`

**Step 2**: Find all applicable rules where antecedent ⊆ user_genres
\`\`\`python
applicable_rules = []
for rule in all_rules:
    if rule.antecedent.issubset(user_genres):
        applicable_rules.append(rule)
\`\`\`

**Step 3**: Score each candidate genre
\`\`\`python
genre_scores = {}
for rule in applicable_rules:
    consequent = rule.consequent
    score = rule.confidence * rule.lift
    genre_scores[consequent] = genre_scores.get(consequent, 0) + score
\`\`\`

**Step 4**: Filter out already-borrowed genres
\`\`\`python
recommendations = {
    genre: score 
    for genre, score in genre_scores.items() 
    if genre not in user_genres
}
\`\`\`

**Step 5**: Return top-k recommendations
\`\`\`python
top_recommendations = sorted(
    recommendations.items(), 
    key=lambda x: x[1], 
    reverse=True
)[:top_k]
\`\`\`

### Example Recommendation

**User Profile**: Recently borrowed {Mystery, Thriller}

**Applicable Rules**:
1. Mystery → Crime (conf=0.667, lift=1.667)
2. Thriller → Mystery (conf=1.0, lift=1.667) [already has Mystery]

**Scoring**:
- Crime: 0.667 × 1.667 = **1.111**

**Recommendations**: 
1. Crime (score: 1.111)

---

## Section 7: Pseudocode

### Apriori Algorithm

\`\`\`python
def apriori(transactions, minsup):
    """
    Mine frequent itemsets using Apriori algorithm
    
    Args:
        transactions: List of sets, each containing items
        minsup: Minimum support threshold (0-1)
    
    Returns:
        Dictionary mapping itemsets to their support values
    """
    N = len(transactions)
    
    # Generate L1 (frequent 1-itemsets)
    C1 = get_unique_items(transactions)
    L1 = {}
    for item in C1:
        support = count_support({item}, transactions) / N
        if support >= minsup:
            L1[frozenset({item})] = support
    
    # Iteratively generate Lk from L(k-1)
    all_frequent = L1.copy()
    k = 2
    Lk_prev = L1
    
    while len(Lk_prev) > 0:
        # Generate candidates
        Ck = generate_candidates(Lk_prev, k)
        
        # Prune candidates
        Lk = {}
        for itemset in Ck:
            support = count_support(itemset, transactions) / N
            if support >= minsup:
                Lk[itemset] = support
        
        # Add to all frequent itemsets
        all_frequent.update(Lk)
        
        # Prepare for next iteration
        Lk_prev = Lk
        k += 1
    
    return all_frequent

def generate_candidates(Lk_prev, k):
    """Generate candidate k-itemsets from (k-1)-itemsets"""
    candidates = set()
    itemsets = list(Lk_prev.keys())
    
    for i in range(len(itemsets)):
        for j in range(i + 1, len(itemsets)):
            # Join step: combine if first k-2 items match
            union = itemsets[i] | itemsets[j]
            if len(union) == k:
                candidates.add(union)
    
    return candidates

def count_support(itemset, transactions):
    """Count how many transactions contain the itemset"""
    count = 0
    for transaction in transactions:
        if itemset.issubset(transaction):
            count += 1
    return count
\`\`\`

### Rule Generation

\`\`\`python
def generate_rules(frequent_itemsets, minconf, minlift):
    """
    Generate association rules from frequent itemsets
    
    Args:
        frequent_itemsets: Dict mapping itemsets to support
        minconf: Minimum confidence threshold
        minlift: Minimum lift threshold
    
    Returns:
        List of Rule objects
    """
    rules = []
    
    # Only consider itemsets with 2+ items
    for itemset, supp_xy in frequent_itemsets.items():
        if len(itemset) < 2:
            continue
        
        # Generate all non-empty subsets as antecedents
        for antecedent in get_subsets(itemset):
            if len(antecedent) == 0 or len(antecedent) == len(itemset):
                continue
            
            consequent = itemset - antecedent
            
            # Calculate metrics
            supp_x = frequent_itemsets.get(antecedent, 0)
            supp_y = frequent_itemsets.get(consequent, 0)
            
            if supp_x == 0 or supp_y == 0:
                continue
            
            confidence = supp_xy / supp_x
            lift = confidence / supp_y
            
            # Filter by thresholds
            if confidence >= minconf and lift >= minlift:
                rules.append(Rule(
                    antecedent=antecedent,
                    consequent=consequent,
                    support=supp_xy,
                    confidence=confidence,
                    lift=lift
                ))
    
    return rules
\`\`\`

### Recommendation Function

\`\`\`python
def recommend(user_id, rules, top_k=10):
    """
    Generate genre recommendations for a user
    
    Args:
        user_id: Target user ID
        rules: List of association rules
        top_k: Number of recommendations to return
    
    Returns:
        List of (genre, score) tuples
    """
    # Get user's recent genres
    user_genres = get_user_recent_genres(user_id, days=30)
    
    if len(user_genres) == 0:
        return get_popular_genres(top_k)
    
    # Score candidate genres
    genre_scores = {}
    
    for rule in rules:
        # Check if rule applies to user
        if rule.antecedent.issubset(user_genres):
            consequent_genre = next(iter(rule.consequent))
            
            # Skip if user already has this genre
            if consequent_genre in user_genres:
                continue
            
            # Calculate score
            score = rule.confidence * rule.lift
            genre_scores[consequent_genre] = genre_scores.get(consequent_genre, 0) + score
    
    # Sort and return top-k
    recommendations = sorted(
        genre_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )[:top_k]
    
    return recommendations
\`\`\`

---

## Section 8: Python Implementation

\`\`\`python
from collections import defaultdict
from itertools import combinations
from typing import List, Set, Dict, Tuple
import pandas as pd

class Rule:
    """Association rule X → Y"""
    def __init__(self, antecedent, consequent, support, confidence, lift):
        self.antecedent = frozenset(antecedent)
        self.consequent = frozenset(consequent)
        self.support = support
        self.confidence = confidence
        self.lift = lift
    
    def __repr__(self):
        return f"{set(self.antecedent)} → {set(self.consequent)} " \
               f"(supp={self.support:.3f}, conf={self.confidence:.3f}, lift={self.lift:.3f})"

def apriori(transactions: List[Set[str]], minsup: float) -> Dict[frozenset, float]:
    """
    Apriori algorithm for mining frequent itemsets
    
    Args:
        transactions: List of sets, each containing genre names
        minsup: Minimum support threshold (0-1)
    
    Returns:
        Dictionary mapping frequent itemsets to their support values
    """
    N = len(transactions)
    print(f"[Apriori] Processing {N} transactions with minsup={minsup}")
    
    # Generate C1 (all unique items)
    all_items = set()
    for transaction in transactions:
        all_items.update(transaction)
    
    print(f"[Apriori] Found {len(all_items)} unique items: {all_items}")
    
    # Generate L1 (frequent 1-itemsets)
    L1 = {}
    for item in all_items:
        count = sum(1 for t in transactions if item in t)
        support = count / N
        if support >= minsup:
            L1[frozenset({item})] = support
    
    print(f"[Apriori] L1: {len(L1)} frequent 1-itemsets")
    for itemset, supp in sorted(L1.items(), key=lambda x: x[1], reverse=True):
        print(f"  {set(itemset)}: {supp:.3f}")
    
    # Iteratively generate Lk
    all_frequent = L1.copy()
    k = 2
    Lk_prev = L1
    
    while len(Lk_prev) > 0:
        print(f"\n[Apriori] Generating L{k}...")
        
        # Generate candidates
        Ck = generate_candidates(list(Lk_prev.keys()), k)
        print(f"  Generated {len(Ck)} candidates")
        
        # Count support and prune
        Lk = {}
        for itemset in Ck:
            count = sum(1 for t in transactions if itemset.issubset(t))
            support = count / N
            if support >= minsup:
                Lk[itemset] = support
        
        print(f"  L{k}: {len(Lk)} frequent {k}-itemsets")
        for itemset, supp in sorted(Lk.items(), key=lambda x: x[1], reverse=True):
            print(f"    {set(itemset)}: {supp:.3f}")
        
        all_frequent.update(Lk)
        Lk_prev = Lk
        k += 1
    
    print(f"\n[Apriori] Total frequent itemsets: {len(all_frequent)}")
    return all_frequent

def generate_candidates(itemsets: List[frozenset], k: int) -> Set[frozenset]:
    """Generate candidate k-itemsets from (k-1)-itemsets"""
    candidates = set()
    
    for i in range(len(itemsets)):
        for j in range(i + 1, len(itemsets)):
            union = itemsets[i] | itemsets[j]
            if len(union) == k:
                candidates.add(union)
    
    return candidates

def generate_rules(frequent_itemsets: Dict[frozenset, float], 
                   minconf: float, 
                   minlift: float) -> List[Rule]:
    """
    Generate association rules from frequent itemsets
    
    Args:
        frequent_itemsets: Dict mapping itemsets to support
        minconf: Minimum confidence threshold
        minlift: Minimum lift threshold
    
    Returns:
        List of Rule objects
    """
    print(f"\n[Rules] Generating rules with minconf={minconf}, minlift={minlift}")
    rules = []
    
    for itemset, supp_xy in frequent_itemsets.items():
        if len(itemset) < 2:
            continue
        
        # Generate all non-empty proper subsets
        for r in range(1, len(itemset)):
            for antecedent in combinations(itemset, r):
                antecedent = frozenset(antecedent)
                consequent = itemset - antecedent
                
                # Calculate metrics
                supp_x = frequent_itemsets.get(antecedent, 0)
                supp_y = frequent_itemsets.get(consequent, 0)
                
                if supp_x == 0 or supp_y == 0:
                    continue
                
                confidence = supp_xy / supp_x
                lift = confidence / supp_y
                
                # Filter by thresholds
                if confidence >= minconf and lift >= minlift:
                    rules.append(Rule(antecedent, consequent, supp_xy, confidence, lift))
    
    print(f"[Rules] Generated {len(rules)} rules")
    for rule in sorted(rules, key=lambda r: r.lift, reverse=True)[:10]:
        print(f"  {rule}")
    
    return rules

def recommend(user_profile: Set[str], 
              rules: List[Rule], 
              top_k: int = 10) -> List[Tuple[str, float]]:
    """
    Generate genre recommendations for a user
    
    Args:
        user_profile: Set of genres user has recently borrowed
        rules: List of association rules
        top_k: Number of recommendations to return
    
    Returns:
        List of (genre, score) tuples
    """
    print(f"\n[Recommend] User profile: {user_profile}")
    
    genre_scores = defaultdict(float)
    
    for rule in rules:
        # Check if rule applies
        if rule.antecedent.issubset(user_profile):
            for genre in rule.consequent:
                if genre not in user_profile:
                    score = rule.confidence * rule.lift
                    genre_scores[genre] += score
                    print(f"  Rule {set(rule.antecedent)} → {genre}: +{score:.3f}")
    
    # Sort and return top-k
    recommendations = sorted(
        genre_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )[:top_k]
    
    print(f"\n[Recommend] Top {top_k} recommendations:")
    for genre, score in recommendations:
        print(f"  {genre}: {score:.3f}")
    
    return recommendations

# Example usage
if __name__ == "__main__":
    # Toy dataset
    transactions = [
        {'Mystery', 'Thriller'},
        {'Romance', 'Drama'},
        {'Mystery', 'Crime'},
        {'Sci-Fi', 'Fantasy'},
        {'Mystery', 'Thriller', 'Crime'}
    ]
    
    print("="*60)
    print("APRIORI ASSOCIATION RULE MINING")
    print("="*60)
    
    # Mine frequent itemsets
    frequent = apriori(transactions, minsup=0.2)
    
    # Generate rules
    rules = generate_rules(frequent, minconf=0.6, minlift=1.2)
    
    # Generate recommendations
    user_genres = {'Mystery', 'Thriller'}
    recommendations = recommend(user_genres, rules, top_k=5)
    
    print("\n" + "="*60)
    print("RECOMMENDATION COMPLETE")
    print("="*60)
\`\`\`

---

## Section 9: Evaluation

### Offline Evaluation Strategy

**Data Split**:
1. For each user, hide their last borrowing transaction
2. Use all previous transactions to mine rules
3. Predict genres for the hidden transaction
4. Compare predictions with actual genres borrowed

### Metrics

#### Precision@k
$$\text{Precision@k} = \frac{\text{# relevant items in top-k}}{\text{k}}$$

**Example**: If we recommend 5 genres and user borrows 2 of them, precision@5 = 2/5 = 0.4

#### Recall@k
$$\text{Recall@k} = \frac{\text{# relevant items in top-k}}{\text{# total relevant items}}$$

**Example**: If user borrows 3 genres total and we recommend 2 of them in top-5, recall@5 = 2/3 ≈ 0.667

#### Coverage
$$\text{Coverage} = \frac{\text{# unique genres recommended}}{\text{# total genres in catalog}}$$

Measures diversity of recommendations

### Evaluation Code

\`\`\`python
def evaluate_recommendations(transactions, rules, k=5):
    """
    Evaluate recommendation quality using held-out test set
    """
    precisions = []
    recalls = []
    recommended_genres = set()
    
    # Group transactions by user
    user_transactions = defaultdict(list)
    for t in transactions:
        user_id = t['user_id']
        user_transactions[user_id].append(t['genres'])
    
    # For each user with 2+ transactions
    for user_id, user_txns in user_transactions.items():
        if len(user_txns) < 2:
            continue
        
        # Hold out last transaction
        train_txns = user_txns[:-1]
        test_txn = user_txns[-1]
        
        # Build user profile from training data
        user_profile = set()
        for txn in train_txns:
            user_profile.update(txn)
        
        # Generate recommendations
        recs = recommend(user_profile, rules, top_k=k)
        recommended = set(genre for genre, score in recs)
        recommended_genres.update(recommended)
        
        # Calculate metrics
        relevant = set(test_txn)
        hits = recommended & relevant
        
        precision = len(hits) / k if k > 0 else 0
        recall = len(hits) / len(relevant) if len(relevant) > 0 else 0
        
        precisions.append(precision)
        recalls.append(recall)
    
    # Calculate averages
    avg_precision = sum(precisions) / len(precisions) if precisions else 0
    avg_recall = sum(recalls) / len(recalls) if recalls else 0
    
    # Calculate coverage
    all_genres = set()
    for t in transactions:
        all_genres.update(t['genres'])
    coverage = len(recommended_genres) / len(all_genres) if all_genres else 0
    
    print(f"\nEvaluation Results:")
    print(f"  Precision@{k}: {avg_precision:.3f}")
    print(f"  Recall@{k}: {avg_recall:.3f}")
    print(f"  Coverage: {coverage:.3f}")
    
    return {
        'precision': avg_precision,
        'recall': avg_recall,
        'coverage': coverage
    }
\`\`\`

---

## Section 10: Edge Cases and Safeguards

### 1. Sparse Users (Few Transactions)

**Problem**: Users with < 2 transactions have no patterns to mine

**Solution**: Fall back to popularity-based recommendations
\`\`\`python
def recommend_with_fallback(user_id, rules, top_k=10):
    user_genres = get_user_recent_genres(user_id)
    
    if len(user_genres) < 2:
        # Fallback: recommend most popular genres
        return get_popular_genres(top_k)
    
    recs = recommend(user_genres, rules, top_k)
    
    if len(recs) < top_k:
        # Fill remaining slots with popular genres
        popular = get_popular_genres(top_k - len(recs))
        recs.extend(popular)
    
    return recs
\`\`\`

### 2. Cold-Start Genres

**Problem**: New genres with no historical data

**Solution**: 
- Manually seed with similar genre rules
- Use content-based similarity (genre descriptions)
- Wait until minsup threshold is met

\`\`\`python
GENRE_SIMILARITY = {
    'Mystery': ['Thriller', 'Crime', 'Detective'],
    'Romance': ['Drama', 'Contemporary Fiction'],
    'Sci-Fi': ['Fantasy', 'Adventure', 'Dystopian']
}

def handle_cold_start(genre):
    if genre in GENRE_SIMILARITY:
        return GENRE_SIMILARITY[genre]
    return []
\`\`\`

### 3. Ties in Scores

**Problem**: Multiple genres with identical scores

**Solution**: Use secondary ranking criteria
\`\`\`python
def break_ties(recommendations):
    """Break ties using genre popularity"""
    genre_popularity = get_genre_popularity()
    
    return sorted(
        recommendations,
        key=lambda x: (x[1], genre_popularity.get(x[0], 0)),
        reverse=True
    )
\`\`\`

### 4. Avoid Recommending Known Genres

**Problem**: Recommending genres user already borrows

**Solution**: Filter out user's existing genres
\`\`\`python
def recommend(user_profile, rules, top_k=10):
    genre_scores = defaultdict(float)
    
    for rule in rules:
        if rule.antecedent.issubset(user_profile):
            for genre in rule.consequent:
                # Skip if user already has this genre
                if genre not in user_profile:  # ← Key filter
                    score = rule.confidence * rule.lift
                    genre_scores[genre] += score
    
    return sorted(genre_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
\`\`\`

**Optional**: Allow re-recommendation if explicitly requested
\`\`\`python
def recommend(user_profile, rules, top_k=10, allow_known=False):
    # ... same logic ...
    if not allow_known and genre in user_profile:
        continue
    # ...
\`\`\`

---

## Section 11: Reproducibility

### Random Seed
\`\`\`python
import random
random.seed(42)  # For any randomization in tie-breaking
\`\`\`

### Parameter Echo
\`\`\`python
def run_apriori_pipeline(transactions, minsup, minconf, minlift, top_k):
    print("="*60)
    print("APRIORI RECOMMENDATION SYSTEM")
    print("="*60)
    print(f"Parameters:")
    print(f"  minsup: {minsup}")
    print(f"  minconf: {minconf}")
    print(f"  minlift: {minlift}")
    print(f"  top_k: {top_k}")
    print(f"  transactions: {len(transactions)}")
    print(f"  random_seed: 42")
    print("="*60)
    
    # Run pipeline...
\`\`\`

### Full Reproducible Script

\`\`\`python
#!/usr/bin/env python3
"""
Apriori-based Genre Recommendation System
Fully reproducible with fixed parameters and random seed
"""

import random
from datetime import datetime

# Set random seed for reproducibility
random.seed(42)

# Fixed parameters
PARAMS = {
    'minsup': 0.2,
    'minconf': 0.6,
    'minlift': 1.2,
    'top_k': 10,
    'allowed_genres': [
        'Fiction', 'Mystery', 'Thriller', 'Romance', 
        'Science Fiction', 'Fantasy', 'Historical Fiction',
        'Biography', 'Self-Help', 'Business'
    ]
}

def main():
    print(f"Run timestamp: {datetime.now()}")
    print(f"Parameters: {PARAMS}")
    
    # Load data
    transactions = load_transactions()
    
    # Mine frequent itemsets
    frequent = apriori(transactions, PARAMS['minsup'])
    
    # Generate rules
    rules = generate_rules(frequent, PARAMS['minconf'], PARAMS['minlift'])
    
    # Evaluate
    results = evaluate_recommendations(transactions, rules, PARAMS['top_k'])
    
    # Save results
    save_results(rules, results)

if __name__ == "__main__":
    main()
\`\`\`

---

## Integration with Library System

### Database Schema Addition

\`\`\`sql
-- Store mined association rules
CREATE TABLE genre_association_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    antecedent_genres JSON NOT NULL,
    consequent_genre VARCHAR(100) NOT NULL,
    support DECIMAL(5,4) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    lift DECIMAL(5,4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_consequent (consequent_genre),
    INDEX idx_confidence (confidence DESC),
    INDEX idx_lift (lift DESC)
);

-- Store user genre recommendations
CREATE TABLE user_genre_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recommended_genre VARCHAR(100) NOT NULL,
    recommendation_score DECIMAL(8,4) NOT NULL,
    based_on_genres JSON NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_viewed BOOLEAN DEFAULT FALSE,
    is_acted_upon BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_score (user_id, recommendation_score DESC),
    INDEX idx_generated_at (generated_at)
);
\`\`\`

### API Endpoint

\`\`\`php
// api/recommendations/apriori-genres.php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$userId = $_GET['userId'] ?? null;
$limit = $_GET['limit'] ?? 10;

if (!$userId) {
    http_response_code(400);
    echo json_encode(["message" => "User ID required"]);
    exit();
}

// Get user's recent genres (last 30 days)
$query = "SELECT DISTINCT b.genre 
          FROM borrow_records br
          JOIN books b ON br.book_id = b.id
          WHERE br.user_id = :userId 
            AND br.borrow_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            AND b.genre IS NOT NULL";

$stmt = $db->prepare($query);
$stmt->bindParam(':userId', $userId);
$stmt->execute();
$userGenres = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (empty($userGenres)) {
    // Fallback to popular genres
    echo json_encode(["recommendations" => get_popular_genres($db, $limit)]);
    exit();
}

// Find applicable rules
$genreList = "'" . implode("','", $userGenres) . "'";
$ruleQuery = "SELECT * FROM genre_association_rules 
              WHERE JSON_CONTAINS(antecedent_genres, JSON_ARRAY($genreList))
              ORDER BY lift DESC, confidence DESC";

$ruleStmt = $db->prepare($ruleQuery);
$ruleStmt->execute();
$rules = $ruleStmt->fetchAll(PDO::FETCH_ASSOC);

// Score genres
$genreScores = [];
foreach ($rules as $rule) {
    $genre = $rule['consequent_genre'];
    if (!in_array($genre, $userGenres)) {
        $score = $rule['confidence'] * $rule['lift'];
        $genreScores[$genre] = ($genreScores[$genre] ?? 0) + $score;
    }
}

// Sort and limit
arsort($genreScores);
$recommendations = array_slice($genreScores, 0, $limit, true);

echo json_encode([
    "recommendations" => $recommendations,
    "userGenres" => $userGenres
]);
?>
\`\`\`

---

## Conclusion

This Apriori-based genre recommendation system provides:
- **Transparent**: Every recommendation is explainable via association rules
- **Efficient**: Apriori algorithm scales to large transaction databases
- **Effective**: High-confidence, high-lift rules ensure quality recommendations
- **Reproducible**: Fixed parameters and random seeds ensure consistent results

The system integrates seamlessly with the existing library management system and provides personalized genre recommendations based on actual borrowing patterns.
