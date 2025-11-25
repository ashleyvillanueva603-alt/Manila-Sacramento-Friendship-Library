#!/usr/bin/env python3
"""
Apriori-based Genre Recommendation System for Library Management
Complete implementation with data mining, rule generation, and evaluation
"""

from collections import defaultdict
from itertools import combinations
from typing import List, Set, Dict, Tuple, FrozenSet
import json
from datetime import datetime

class Rule:
    """Association rule X → Y with support, confidence, and lift metrics"""
    
    def __init__(self, antecedent: FrozenSet[str], consequent: FrozenSet[str], 
                 support: float, confidence: float, lift: float):
        self.antecedent = antecedent
        self.consequent = consequent
        self.support = support
        self.confidence = confidence
        self.lift = lift
    
    def __repr__(self):
        return (f"{set(self.antecedent)} → {set(self.consequent)} "
                f"(supp={self.support:.3f}, conf={self.confidence:.3f}, lift={self.lift:.3f})")
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'antecedent': list(self.antecedent),
            'consequent': list(self.consequent),
            'support': round(self.support, 4),
            'confidence': round(self.confidence, 4),
            'lift': round(self.lift, 4)
        }


class AprioriRecommender:
    """
    Apriori-based association rule mining for genre recommendations
    """
    
    def __init__(self, minsup: float = 0.2, minconf: float = 0.6, 
                 minlift: float = 1.2, top_k: int = 10):
        """
        Initialize recommender with parameters
        
        Args:
            minsup: Minimum support threshold (0-1)
            minconf: Minimum confidence threshold (0-1)
            minlift: Minimum lift threshold (>0)
            top_k: Number of recommendations to return
        """
        self.minsup = minsup
        self.minconf = minconf
        self.minlift = minlift
        self.top_k = top_k
        
        # Allowed genres (can be configured)
        self.allowed_genres = {
            'Fiction', 'Mystery', 'Thriller', 'Romance', 'Drama',
            'Science Fiction', 'Fantasy', 'Historical Fiction',
            'Biography', 'Self-Help', 'Business', 'Crime',
            'Adventure', 'Horror', 'Poetry', 'Classic',
            'Young Adult', 'Contemporary', 'Dystopian'
        }
    
    def preprocess_transactions(self, raw_transactions: List[Dict]) -> List[Set[str]]:
        """
        Preprocess transactions: deduplicate genres and filter to allowed genres
        
        Args:
            raw_transactions: List of dicts with 'user_id', 'genres', 'timestamp'
        
        Returns:
            List of sets, each containing unique genres
        """
        transactions = []
        
        for txn in raw_transactions:
            # Deduplicate and filter genres
            genres = set(txn['genres']) & self.allowed_genres
            if len(genres) > 0:
                transactions.append(genres)
        
        print(f"[Preprocess] {len(raw_transactions)} raw → {len(transactions)} valid transactions")
        return transactions
    
    def apriori(self, transactions: List[Set[str]]) -> Dict[FrozenSet[str], float]:
        """
        Apriori algorithm for mining frequent itemsets
        
        Args:
            transactions: List of sets, each containing genre names
        
        Returns:
            Dictionary mapping frequent itemsets to their support values
        """
        N = len(transactions)
        print(f"\n[Apriori] Processing {N} transactions with minsup={self.minsup}")
        
        # Generate C1 (all unique items)
        all_items = set()
        for transaction in transactions:
            all_items.update(transaction)
        
        print(f"[Apriori] Found {len(all_items)} unique genres")
        
        # Generate L1 (frequent 1-itemsets)
        L1 = {}
        for item in all_items:
            count = sum(1 for t in transactions if item in t)
            support = count / N
            if support >= self.minsup:
                L1[frozenset({item})] = support
        
        print(f"[Apriori] L1: {len(L1)} frequent 1-itemsets")
        for itemset, supp in sorted(L1.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {set(itemset)}: {supp:.3f}")
        
        # Iteratively generate Lk
        all_frequent = L1.copy()
        k = 2
        Lk_prev = L1
        
        while len(Lk_prev) > 0:
            print(f"\n[Apriori] Generating L{k}...")
            
            # Generate candidates
            Ck = self._generate_candidates(list(Lk_prev.keys()), k)
            print(f"  Generated {len(Ck)} candidates")
            
            # Count support and prune
            Lk = {}
            for itemset in Ck:
                count = sum(1 for t in transactions if itemset.issubset(t))
                support = count / N
                if support >= self.minsup:
                    Lk[itemset] = support
            
            print(f"  L{k}: {len(Lk)} frequent {k}-itemsets")
            for itemset, supp in sorted(Lk.items(), key=lambda x: x[1], reverse=True)[:5]:
                print(f"    {set(itemset)}: {supp:.3f}")
            
            all_frequent.update(Lk)
            Lk_prev = Lk
            k += 1
        
        print(f"\n[Apriori] Total frequent itemsets: {len(all_frequent)}")
        return all_frequent
    
    def _generate_candidates(self, itemsets: List[FrozenSet[str]], k: int) -> Set[FrozenSet[str]]:
        """Generate candidate k-itemsets from (k-1)-itemsets"""
        candidates = set()
        
        for i in range(len(itemsets)):
            for j in range(i + 1, len(itemsets)):
                union = itemsets[i] | itemsets[j]
                if len(union) == k:
                    candidates.add(union)
        
        return candidates
    
    def generate_rules(self, frequent_itemsets: Dict[FrozenSet[str], float]) -> List[Rule]:
        """
        Generate association rules from frequent itemsets
        
        Args:
            frequent_itemsets: Dict mapping itemsets to support
        
        Returns:
            List of Rule objects
        """
        print(f"\n[Rules] Generating rules with minconf={self.minconf}, minlift={self.minlift}")
        rules = []
        
        for itemset, supp_xy in frequent_itemsets.items():
            if len(itemset) < 2:
                continue
            
            # Generate all non-empty proper subsets
            for r in range(1, len(itemset)):
                for antecedent_tuple in combinations(itemset, r):
                    antecedent = frozenset(antecedent_tuple)
                    consequent = itemset - antecedent
                    
                    # Calculate metrics
                    supp_x = frequent_itemsets.get(antecedent, 0)
                    supp_y = frequent_itemsets.get(consequent, 0)
                    
                    if supp_x == 0 or supp_y == 0:
                        continue
                    
                    confidence = supp_xy / supp_x
                    lift = confidence / supp_y
                    
                    # Filter by thresholds
                    if confidence >= self.minconf and lift >= self.minlift:
                        rules.append(Rule(antecedent, consequent, supp_xy, confidence, lift))
        
        print(f"[Rules] Generated {len(rules)} rules")
        
        # Print top rules by lift
        print("\nTop 10 rules by lift:")
        for rule in sorted(rules, key=lambda r: r.lift, reverse=True)[:10]:
            print(f"  {rule}")
        
        return rules
    
    def recommend(self, user_profile: Set[str], rules: List[Rule]) -> List[Tuple[str, float, List[str]]]:
        """
        Generate genre recommendations for a user
        
        Args:
            user_profile: Set of genres user has recently borrowed
            rules: List of association rules
        
        Returns:
            List of (genre, score, reasons) tuples
        """
        print(f"\n[Recommend] User profile: {user_profile}")
        
        genre_scores = defaultdict(float)
        genre_reasons = defaultdict(list)
        
        for rule in rules:
            # Check if rule applies
            if rule.antecedent.issubset(user_profile):
                for genre in rule.consequent:
                    if genre not in user_profile:
                        score = rule.confidence * rule.lift
                        genre_scores[genre] += score
                        
                        reason = f"Users who enjoy {', '.join(rule.antecedent)} also like {genre}"
                        genre_reasons[genre].append(reason)
                        
                        print(f"  Rule {set(rule.antecedent)} → {genre}: +{score:.3f}")
        
        # Sort and return top-k
        recommendations = [
            (genre, score, genre_reasons[genre][:3])  # Limit to 3 reasons
            for genre, score in sorted(genre_scores.items(), key=lambda x: x[1], reverse=True)
        ][:self.top_k]
        
        print(f"\n[Recommend] Top {self.top_k} recommendations:")
        for genre, score, reasons in recommendations:
            print(f"  {genre}: {score:.3f}")
            for reason in reasons[:1]:  # Print first reason
                print(f"    - {reason}")
        
        return recommendations
    
    def evaluate(self, transactions: List[Dict], rules: List[Rule]) -> Dict[str, float]:
        """
        Evaluate recommendation quality using held-out test set
        
        Args:
            transactions: List of transaction dicts with 'user_id' and 'genres'
            rules: List of association rules
        
        Returns:
            Dict with precision, recall, and coverage metrics
        """
        print(f"\n[Evaluate] Evaluating on {len(transactions)} transactions")
        
        precisions = []
        recalls = []
        recommended_genres = set()
        
        # Group transactions by user
        user_transactions = defaultdict(list)
        for txn in transactions:
            user_transactions[txn['user_id']].append(set(txn['genres']))
        
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
            recs = self.recommend(user_profile, rules)
            recommended = set(genre for genre, score, reasons in recs)
            recommended_genres.update(recommended)
            
            # Calculate metrics
            relevant = test_txn
            hits = recommended & relevant
            
            precision = len(hits) / self.top_k if self.top_k > 0 else 0
            recall = len(hits) / len(relevant) if len(relevant) > 0 else 0
            
            precisions.append(precision)
            recalls.append(recall)
        
        # Calculate averages
        avg_precision = sum(precisions) / len(precisions) if precisions else 0
        avg_recall = sum(recalls) / len(recalls) if recalls else 0
        
        # Calculate coverage
        all_genres = set()
        for txn in transactions:
            all_genres.update(txn['genres'])
        coverage = len(recommended_genres) / len(all_genres) if all_genres else 0
        
        print(f"\nEvaluation Results:")
        print(f"  Precision@{self.top_k}: {avg_precision:.3f}")
        print(f"  Recall@{self.top_k}: {avg_recall:.3f}")
        print(f"  Coverage: {coverage:.3f}")
        print(f"  Users evaluated: {len(precisions)}")
        
        return {
            'precision': avg_precision,
            'recall': avg_recall,
            'coverage': coverage,
            'users_evaluated': len(precisions)
        }
    
    def save_rules(self, rules: List[Rule], filename: str = 'genre_association_rules.json'):
        """Save rules to JSON file"""
        rules_data = [rule.to_dict() for rule in rules]
        with open(filename, 'w') as f:
            json.dump({
                'parameters': {
                    'minsup': self.minsup,
                    'minconf': self.minconf,
                    'minlift': self.minlift,
                    'top_k': self.top_k
                },
                'generated_at': datetime.now().isoformat(),
                'rules': rules_data
            }, f, indent=2)
        print(f"\n[Save] Saved {len(rules)} rules to {filename}")


def main():
    """Example usage with toy dataset"""
    print("="*60)
    print("APRIORI GENRE RECOMMENDATION SYSTEM")
    print("="*60)
    
    # Toy dataset
    raw_transactions = [
        {'user_id': 1, 'genres': ['Mystery', 'Thriller'], 'timestamp': '2024-01-01'},
        {'user_id': 2, 'genres': ['Romance', 'Drama'], 'timestamp': '2024-01-02'},
        {'user_id': 3, 'genres': ['Mystery', 'Crime'], 'timestamp': '2024-01-03'},
        {'user_id': 4, 'genres': ['Science Fiction', 'Fantasy'], 'timestamp': '2024-01-04'},
        {'user_id': 5, 'genres': ['Mystery', 'Thriller', 'Crime'], 'timestamp': '2024-01-05'},
        {'user_id': 1, 'genres': ['Thriller', 'Crime'], 'timestamp': '2024-01-06'},
        {'user_id': 2, 'genres': ['Romance', 'Contemporary'], 'timestamp': '2024-01-07'},
        {'user_id': 3, 'genres': ['Mystery', 'Thriller'], 'timestamp': '2024-01-08'},
    ]
    
    # Initialize recommender
    recommender = AprioriRecommender(minsup=0.2, minconf=0.6, minlift=1.2, top_k=5)
    
    # Preprocess transactions
    transactions = recommender.preprocess_transactions(raw_transactions)
    
    # Mine frequent itemsets
    frequent = recommender.apriori(transactions)
    
    # Generate rules
    rules = recommender.generate_rules(frequent)
    
    # Generate recommendations for a user
    user_genres = {'Mystery', 'Thriller'}
    recommendations = recommender.recommend(user_genres, rules)
    
    # Evaluate
    evaluation = recommender.evaluate(raw_transactions, rules)
    
    # Save rules
    recommender.save_rules(rules)
    
    print("\n" + "="*60)
    print("COMPLETE")
    print("="*60)


if __name__ == "__main__":
    main()
