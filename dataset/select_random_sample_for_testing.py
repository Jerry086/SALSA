import pandas as pd
import ast

def select_samples_by_class(input_file, output_file, sample_size=15):
    data = pd.read_csv(input_file)

    data['root_classes'] = data['root_classes'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else [])

    sampled_data = pd.DataFrame()

    # Iterate over each unique class in 'root_classes'
    for item in set(x for lst in data['root_classes'] for x in lst):
        # Filter rows where this item appears in 'root_classes'
        filtered_data = data[data['root_classes'].apply(lambda x: item in x)]
        
        # Sample rows for the current class
        sampled_rows = filtered_data.sample(n=sample_size, replace=True) if len(filtered_data) >= sample_size else filtered_data
        
        # Append sampled rows to the final DataFrame
        sampled_data = pd.concat([sampled_data, sampled_rows])

    sampled_data.to_csv(output_file, index=False)

def extract_root_classes(file_path):
    data = pd.read_csv(file_path)
    # Extract the 'root_classes' column and convert it from string representation of list to actual list
    root_classes_list = [ast.literal_eval(item) for item in data['root_classes'].tolist() if isinstance(item, str)]
    # Flatten the list in case some entries contain multiple classes
    flattened_root_classes = [item for sublist in root_classes_list for item in sublist]
    # Remove duplicates by converting to a set, then back to a list
    unique_root_classes = list(set(flattened_root_classes))
    return unique_root_classes

input_file = '/test_metadata_rootclass.csv'
output_file = '/test_samples_id.csv'

# Select 15 samples for each root class and output to a CSV file
select_samples_by_class(input_file, output_file)

unique_root_classes = extract_root_classes(input_file)
unique_class_count = len(unique_root_classes)
print(f'There are {unique_class_count} unique classes in the file.')
