import pandas as pd
import ast
import math

def select_samples_by_class(input_file, output_file, percentage=0.10):
    data = pd.read_csv(input_file)
    data['root_classes'] = data['root_classes'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else [])

    sampled_data = pd.DataFrame()
    selected_ids = set()

    class_counts = count_audios_by_class(input_file)

    for item in set(x for lst in data['root_classes'] for x in lst):

        filtered_data = data[data['root_classes'].apply(lambda x: item in x) & ~data['video_id'].isin(selected_ids)]
        
        sample_size = math.ceil(class_counts[item] * percentage)
        if len(filtered_data) >= sample_size:
            sampled_rows = filtered_data.sample(n=sample_size, replace=False)
            selected_ids.update(sampled_rows['video_id'].tolist())
        else:
            sampled_rows = filtered_data
            selected_ids.update(filtered_data['video_id'].tolist())
        
        sampled_data = pd.concat([sampled_data, sampled_rows], ignore_index=True)

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

def count_audios_by_class(file_path):
    data = pd.read_csv(file_path)
    data['root_classes'] = data['root_classes'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else [])
    
    class_count = {}
    for root_classes in data['root_classes']:
        for root_class in root_classes:
            class_count[root_class] = class_count.get(root_class, 0) + 1

    return class_count

input_file = '/test_metadata_rootclass.csv'
output_file = '/test_samples_id.csv'

# Select 10% samples for each root class and output to a CSV file
select_samples_by_class(input_file, output_file)

unique_root_classes = extract_root_classes(input_file)
unique_class_count = len(unique_root_classes)
print(f'There are {unique_class_count} unique classes in the file.')

# Count and print the number of audios per class
audio_count_per_class = count_audios_by_class(input_file)
for root_class, count in audio_count_per_class.items():
    print(f'{root_class}: {count} audios')