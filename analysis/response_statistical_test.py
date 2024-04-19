import json
import numpy as np
from scipy.stats import shapiro, wilcoxon

# Load JSON data
with open('/Users/shiqingpan/Desktop/Course/Capstone/SALSA/analysis/response_test.json', 'r') as file:
    data = json.load(file)

# Extract direct_index data
datasets = {
    'Direct Index': np.array(data['direct_data']['index']),
    'Direct Linear': np.array(data['direct_data']['linear']),
    'Spatial Index': np.array(data['spatial_data']['index']),
    'Spatial Linear': np.array(data['spatial_data']['linear']),
    'Temporal Index': np.array(data['temporal_data']['index']),
    'Temporal Linear': np.array(data['temporal_data']['linear']),
    'Spatiotemporal Index': np.array(data['spatiotemporal_data']['index']),
    'Spatiotemporal Linear': np.array(data['spatiotemporal_data']['linear'])
}

# check the assumptions related to the data distribution
# Perform the Shapiro-Wilk test for normality
for label, values in datasets.items():
    w_stat, p_value = shapiro(values)
    print(f"Shapiro-Wilk Test for {label}: W={w_stat:.4f}, p={p_value:.4f}")

# Results
# Shapiro-Wilk Test for Direct Index: W=0.8961, p=0.0000
# Shapiro-Wilk Test for Direct Linear: W=0.9803, p=0.1402
# Shapiro-Wilk Test for Spatial Index: W=0.6704, p=0.0000
# Shapiro-Wilk Test for Spatial Linear: W=0.7126, p=0.0000
# Shapiro-Wilk Test for Temporal Index: W=0.9668, p=0.0126
# Shapiro-Wilk Test for Temporal Linear: W=0.9864, p=0.3958
# Shapiro-Wilk Test for Spatiotemporal Index: W=0.8250, p=0.0000
# Shapiro-Wilk Test for Spatiotemporal Linear: W=0.8352, p=0.0000

# If the p-value from the Shapiro-Wilk test is less than 0.05, we'll reject the null hypothesis,
# indicating that the data does not follow a normal distribution.
# Given that several of the data sets are not normally distributed, non-parametric tests are more appropriate
    
# use Wilcoxon Signed-Rank Test 
# to compares the median response times between the Index and Linear methods for each query type 
pairs = [
    ('Direct Index', 'Direct Linear'),
    ('Spatial Index', 'Spatial Linear'),
    ('Temporal Index', 'Temporal Linear'),
    ('Spatiotemporal Index', 'Spatiotemporal Linear')
]

for pair in pairs:
    index_data = datasets[pair[0]]
    linear_data = datasets[pair[1]]
    w_stat, p_value = wilcoxon(index_data, linear_data)
    print(f"Wilcoxon test for {pair[0]} vs {pair[1]}: W-stat={w_stat:.4f}, p={p_value:.4f}")

# Results:
# Wilcoxon test for Direct Index vs Direct Linear: W-stat=0.0000, p=0.0000
# Wilcoxon test for Spatial Index vs Spatial Linear: W-stat=0.0000, p=0.0000
# Wilcoxon test for Temporal Index vs Temporal Linear: W-stat=0.0000, p=0.0000
# Wilcoxon test for Spatiotemporal Index vs Spatiotemporal Linear: W-stat=0.0000, p=0.0000

'''
p-values of 0.0000 suggest that the differences in response times between the Index and Linear methods for each query type 
are statistically significant. In other words, there is a consistent difference in performance between the two methods across 
all types of queries.
'''

# Use rank-biserial correlation to measure effect size 
# to tell how strong the difference is between two matched groups
def rank_biserial_effect_size(x, y):
    diff = np.array(x) - np.array(y)
    ranks = np.abs(diff).argsort().argsort() + 1  # Rank the absolute differences
    pos_ranks = ranks[diff > 0].sum()  # Sum of ranks for positive differences
    neg_ranks = ranks[diff < 0].sum()  # Sum of ranks for negative differences
    n = len(diff)
    r = (pos_ranks - neg_ranks) / (n * (n + 1) / 2)  # Rank-biserial formula
    return r

for pair in pairs:
    index_data = datasets[pair[0]]
    linear_data = datasets[pair[1]]
    effect_size = rank_biserial_effect_size(index_data, linear_data)
    print(f"Rank-biserial correlation for {pair[0]} vs {pair[1]}: {effect_size:.4f}")

# Results
# Rank-biserial correlation for Direct Index vs Direct Linear: -1.0000
# Rank-biserial correlation for Spatial Index vs Spatial Linear: -1.0000
# Rank-biserial correlation for Temporal Index vs Temporal Linear: -1.0000
# Rank-biserial correlation for Spatiotemporal Index vs Spatiotemporal Linear: -1.0000
    
'''
A rank-biserial correlation of -1.0000 is an extremely strong negative correlation. 
This suggests the Linear method consistently had worse performance across all samples.
This suggests that the difference between the two methods isn't just statistically significant, but also large in magnitude, 
with one method clearly and consistently outperforming the other.
'''