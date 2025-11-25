/**
 * Apriori-based Association Rule Mining for Genre Recommendations
 * Implements the complete Apriori algorithm with rule generation and recommendation logic
 */

export interface Transaction {
  transactionId: string
  userId: number
  genres: string[]
  timestamp: Date
}

export interface FrequentItemset {
  itemset: Set<string>
  support: number
}

export interface AssociationRule {
  antecedent: Set<string>
  consequent: Set<string>
  support: number
  confidence: number
  lift: number
}

export interface GenreRecommendation {
  genre: string
  score: number
  reasons: string[]
}

export class AprioriRecommender {
  private minsup: number
  private minconf: number
  private minlift: number
  private allowedGenres: Set<string>

  constructor(
    minsup = 0.2,
    minconf = 0.6,
    minlift = 1.2,
    allowedGenres: string[] = [
      "Fiction",
      "Mystery",
      "Thriller",
      "Romance",
      "Science Fiction",
      "Fantasy",
      "Historical Fiction",
      "Biography",
      "Self-Help",
      "Business",
      "Drama",
      "Crime",
      "Adventure",
      "Horror",
      "Poetry",
    ],
  ) {
    this.minsup = minsup
    this.minconf = minconf
    this.minlift = minlift
    this.allowedGenres = new Set(allowedGenres)
  }

  /**
   * Preprocess transactions: deduplicate genres and filter to allowed genres
   */
  preprocessTransactions(rawTransactions: Transaction[]): Transaction[] {
    return rawTransactions
      .map((txn) => ({
        ...txn,
        genres: Array.from(new Set(txn.genres.filter((g) => this.allowedGenres.has(g)))),
      }))
      .filter((txn) => txn.genres.length > 0)
  }

  /**
   * Apriori algorithm: Mine frequent itemsets
   */
  apriori(transactions: Transaction[]): Map<string, number> {
    const N = transactions.length
    console.log(`[Apriori] Processing ${N} transactions with minsup=${this.minsup}`)

    // Generate L1 (frequent 1-itemsets)
    const itemCounts = new Map<string, number>()
    transactions.forEach((txn) => {
      txn.genres.forEach((genre) => {
        itemCounts.set(genre, (itemCounts.get(genre) || 0) + 1)
      })
    })

    const L1 = new Map<string, number>()
    itemCounts.forEach((count, item) => {
      const support = count / N
      if (support >= this.minsup) {
        L1.set(JSON.stringify([item]), support)
      }
    })

    console.log(`[Apriori] L1: ${L1.size} frequent 1-itemsets`)

    // Iteratively generate Lk
    const allFrequent = new Map(L1)
    let k = 2
    let LkPrev = L1

    while (LkPrev.size > 0) {
      console.log(`[Apriori] Generating L${k}...`)

      // Generate candidates
      const Ck = this.generateCandidates(Array.from(LkPrev.keys()), k)
      console.log(`  Generated ${Ck.size} candidates`)

      // Count support and prune
      const Lk = new Map<string, number>()
      Ck.forEach((itemsetStr) => {
        const itemset = new Set(JSON.parse(itemsetStr))
        const count = transactions.filter((txn) => this.isSubset(itemset, new Set(txn.genres))).length
        const support = count / N

        if (support >= this.minsup) {
          Lk.set(itemsetStr, support)
        }
      })

      console.log(`  L${k}: ${Lk.size} frequent ${k}-itemsets`)

      Lk.forEach((support, itemset) => {
        allFrequent.set(itemset, support)
      })

      LkPrev = Lk
      k++
    }

    console.log(`[Apriori] Total frequent itemsets: ${allFrequent.size}`)
    return allFrequent
  }

  /**
   * Generate candidate k-itemsets from (k-1)-itemsets
   */
  private generateCandidates(itemsets: string[], k: number): Set<string> {
    const candidates = new Set<string>()

    for (let i = 0; i < itemsets.length; i++) {
      for (let j = i + 1; j < itemsets.length; j++) {
        const set1 = new Set(JSON.parse(itemsets[i]))
        const set2 = new Set(JSON.parse(itemsets[j]))
        const union = new Set([...set1, ...set2])

        if (union.size === k) {
          candidates.add(JSON.stringify(Array.from(union).sort()))
        }
      }
    }

    return candidates
  }

  /**
   * Check if subset is contained in superset
   */
  private isSubset(subset: Set<string>, superset: Set<string>): boolean {
    for (const item of subset) {
      if (!superset.has(item)) return false
    }
    return true
  }

  /**
   * Generate association rules from frequent itemsets
   */
  generateRules(frequentItemsets: Map<string, number>): AssociationRule[] {
    console.log(`[Rules] Generating rules with minconf=${this.minconf}, minlift=${this.minlift}`)
    const rules: AssociationRule[] = []

    frequentItemsets.forEach((suppXY, itemsetStr) => {
      const itemset = JSON.parse(itemsetStr) as string[]
      if (itemset.length < 2) return

      // Generate all non-empty proper subsets as antecedents
      const subsets = this.getSubsets(itemset)
      subsets.forEach((antecedentArr) => {
        if (antecedentArr.length === 0 || antecedentArr.length === itemset.length) return

        const antecedent = new Set(antecedentArr)
        const consequent = new Set(itemset.filter((item) => !antecedent.has(item)))

        // Calculate metrics
        const suppX = frequentItemsets.get(JSON.stringify(Array.from(antecedent).sort())) || 0
        const suppY = frequentItemsets.get(JSON.stringify(Array.from(consequent).sort())) || 0

        if (suppX === 0 || suppY === 0) return

        const confidence = suppXY / suppX
        const lift = confidence / suppY

        // Filter by thresholds
        if (confidence >= this.minconf && lift >= this.minlift) {
          rules.push({
            antecedent,
            consequent,
            support: suppXY,
            confidence,
            lift,
          })
        }
      })
    })

    console.log(`[Rules] Generated ${rules.length} rules`)
    return rules
  }

  /**
   * Get all subsets of an array
   */
  private getSubsets(arr: string[]): string[][] {
    const subsets: string[][] = []
    const n = arr.length

    for (let i = 0; i < Math.pow(2, n); i++) {
      const subset: string[] = []
      for (let j = 0; j < n; j++) {
        if ((i & (1 << j)) !== 0) {
          subset.push(arr[j])
        }
      }
      subsets.push(subset)
    }

    return subsets
  }

  /**
   * Generate genre recommendations for a user
   */
  recommend(userGenres: string[], rules: AssociationRule[], topK = 10): GenreRecommendation[] {
    console.log(`[Recommend] User profile: ${userGenres}`)

    const userGenreSet = new Set(userGenres)
    const genreScores = new Map<string, { score: number; reasons: string[] }>()

    rules.forEach((rule) => {
      // Check if rule applies to user
      if (this.isSubset(rule.antecedent, userGenreSet)) {
        rule.consequent.forEach((genre) => {
          if (!userGenreSet.has(genre)) {
            const score = rule.confidence * rule.lift
            const reason = `Users who enjoy ${Array.from(rule.antecedent).join(", ")} also like ${genre}`

            if (!genreScores.has(genre)) {
              genreScores.set(genre, { score: 0, reasons: [] })
            }

            const current = genreScores.get(genre)!
            current.score += score
            current.reasons.push(reason)
          }
        })
      }
    })

    // Sort and return top-k
    const recommendations: GenreRecommendation[] = Array.from(genreScores.entries())
      .map(([genre, data]) => ({
        genre,
        score: data.score,
        reasons: data.reasons.slice(0, 3), // Limit to top 3 reasons
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    console.log(`[Recommend] Top ${topK} recommendations:`)
    recommendations.forEach((rec) => {
      console.log(`  ${rec.genre}: ${rec.score.toFixed(3)}`)
    })

    return recommendations
  }

  /**
   * Evaluate recommendations using held-out test set
   */
  evaluate(
    transactions: Transaction[],
    rules: AssociationRule[],
    k = 5,
  ): {
    precision: number
    recall: number
    coverage: number
  } {
    const precisions: number[] = []
    const recalls: number[] = []
    const recommendedGenres = new Set<string>()

    // Group transactions by user
    const userTransactions = new Map<number, string[][]>()
    transactions.forEach((txn) => {
      if (!userTransactions.has(txn.userId)) {
        userTransactions.set(txn.userId, [])
      }
      userTransactions.get(txn.userId)!.push(txn.genres)
    })

    // For each user with 2+ transactions
    userTransactions.forEach((userTxns, userId) => {
      if (userTxns.length < 2) return

      // Hold out last transaction
      const trainTxns = userTxns.slice(0, -1)
      const testTxn = userTxns[userTxns.length - 1]

      // Build user profile from training data
      const userProfile = new Set<string>()
      trainTxns.forEach((txn) => txn.forEach((genre) => userProfile.add(genre)))

      // Generate recommendations
      const recs = this.recommend(Array.from(userProfile), rules, k)
      const recommended = new Set(recs.map((r) => r.genre))
      recommended.forEach((g) => recommendedGenres.add(g))

      // Calculate metrics
      const relevant = new Set(testTxn)
      const hits = new Set([...recommended].filter((g) => relevant.has(g)))

      const precision = k > 0 ? hits.size / k : 0
      const recall = relevant.size > 0 ? hits.size / relevant.size : 0

      precisions.push(precision)
      recalls.push(recall)
    })

    // Calculate averages
    const avgPrecision = precisions.length > 0 ? precisions.reduce((a, b) => a + b, 0) / precisions.length : 0
    const avgRecall = recalls.length > 0 ? recalls.reduce((a, b) => a + b, 0) / recalls.length : 0

    // Calculate coverage
    const allGenres = new Set<string>()
    transactions.forEach((txn) => txn.genres.forEach((g) => allGenres.add(g)))
    const coverage = allGenres.size > 0 ? recommendedGenres.size / allGenres.size : 0

    console.log(`\nEvaluation Results:`)
    console.log(`  Precision@${k}: ${avgPrecision.toFixed(3)}`)
    console.log(`  Recall@${k}: ${avgRecall.toFixed(3)}`)
    console.log(`  Coverage: ${coverage.toFixed(3)}`)

    return {
      precision: avgPrecision,
      recall: avgRecall,
      coverage,
    }
  }
}

// Example usage
export function runAprioriExample() {
  console.log("=".repeat(60))
  console.log("APRIORI ASSOCIATION RULE MINING")
  console.log("=".repeat(60))

  // Toy dataset
  const transactions: Transaction[] = [
    { transactionId: "T1", userId: 1, genres: ["Mystery", "Thriller"], timestamp: new Date() },
    { transactionId: "T2", userId: 2, genres: ["Romance", "Drama"], timestamp: new Date() },
    { transactionId: "T3", userId: 3, genres: ["Mystery", "Crime"], timestamp: new Date() },
    { transactionId: "T4", userId: 4, genres: ["Science Fiction", "Fantasy"], timestamp: new Date() },
    { transactionId: "T5", userId: 5, genres: ["Mystery", "Thriller", "Crime"], timestamp: new Date() },
  ]

  const recommender = new AprioriRecommender(0.2, 0.6, 1.2)

  // Preprocess
  const processed = recommender.preprocessTransactions(transactions)

  // Mine frequent itemsets
  const frequent = recommender.apriori(processed)

  // Generate rules
  const rules = recommender.generateRules(frequent)

  // Generate recommendations
  const userGenres = ["Mystery", "Thriller"]
  const recommendations = recommender.recommend(userGenres, rules, 5)

  console.log("\n" + "=".repeat(60))
  console.log("RECOMMENDATION COMPLETE")
  console.log("=".repeat(60))

  return { frequent, rules, recommendations }
}
