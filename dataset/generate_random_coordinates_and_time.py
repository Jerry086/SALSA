"""
Getting a random point inside a country based on its name.
In this solution, the shapefile with countries was used.
This solution for random coordinates adapted from the below website
URL: https://gis.stackexchange.com/questions/164005/getting-random-coordinates-based-on-country
Accessed on March 31 2024

This code also generates random timestamp after 2000 for all items.
"""

import re
import random
import shapefile
from shapely.geometry import shape, Point
import csv
import pandas as pd

import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
import pandas as pd
import ast
from datetime import datetime, timedelta


# function that takes a shapefile location and a country name as inputs
def random_point_in_country(shp_location, country_name):
    # reading shapefile with pyshp library
    shapes = shapefile.Reader(shp_location)
    # getting feature(s) that match the country name 
    country = [s for s in shapes.records() if country_name in s][0] 
    # getting feature(s)'s id of that match
    country_id = int(re.findall(r'\d+', str(country))[0])

    shapeRecs = shapes.shapeRecords()
    feature = shapeRecs[country_id].shape.__geo_interface__

    shp_geom = shape(feature)   

    minx, miny, maxx, maxy = shp_geom.bounds
    while True:
        p = Point(random.uniform(minx, maxx), random.uniform(miny, maxy))
        if shp_geom.contains(p):
            return p.x, p.y


def write_cvs(filename, headers, rows):
    # writing to csv file
    with open(filename, 'w') as csvfile:
        # creating a csv writer object
        csvwriter = csv.writer(csvfile)
    
        # writing the headers
        csvwriter.writerow(headers)
    
        # writing the data rows
        csvwriter.writerows(rows)


def render_on_map(csv_file, root_class=None):
    # Load data from CSV
    data = pd.read_csv(csv_file)

    # If a root_class is specified, filter the data 
    if root_class:
        data = data[data['root_classes'].apply(lambda x: ast.literal_eval(x)[0] == root_class if x else False)]

    # Set up the map focusing on North and South America
    plt.figure(figsize=(12, 8))
    m = Basemap(projection='merc', llcrnrlat=-60, urcrnrlat=70, llcrnrlon=-180, urcrnrlon=-30, lat_ts=20, resolution='c')
    m.drawcoastlines()
    m.drawcountries()
    m.fillcontinents(color='lightgray', lake_color='lightblue')
    m.drawmapboundary(fill_color='lightblue')

    # Plot points
    x, y = m(data['longitude'].values, data['latitude'].values)
    m.scatter(x, y, marker='o', color='red', zorder=5)

    plt.title(f'Coordinates by Class: {root_class if root_class else "All Classes"}')
    plt.show()

def extract_root_classes(file_path):
    data = pd.read_csv(file_path)

    # Extract the 'root_classes' column and convert it from string representation of list to actual list
    root_classes_list = [ast.literal_eval(item) for item in data['root_classes'].tolist() if isinstance(item, str)]

    # Flatten the list in case some entries contain multiple classes
    flattened_root_classes = [item for sublist in root_classes_list for item in sublist]

    # Remove duplicates by converting to a set, then back to a list
    unique_root_classes = list(set(flattened_root_classes))

    return unique_root_classes

# Function to generate a random timestamp since the year 2000
def random_timestamp():
    start_date = datetime(2000, 1, 1)
    end_date = datetime.now()

    # Generate a random date between start_date and end_date
    time_between_dates = end_date - start_date
    random_number_of_days = random.randrange(time_between_dates.days)
    random_date = start_date + timedelta(days=random_number_of_days)

    # Generate a random time
    random_hour = random.randint(0, 23)
    random_minute = random.randint(0, 59)
    random_date = random_date.replace(hour=random_hour, minute=random_minute)

    return random_date.strftime("%Y-%m-%d %H:%M")


def add_coord_and_time(file_path, root_classes_to_country, shp_location):
    # Read the CSV file
    df = pd.read_csv(file_path)

    # Function to process each row and add longitude and latitude
    def add_coordinates(row):
        root_classes = eval(row['root_classes'])
        if root_classes:
            first_class = root_classes[0]  # Get the first class
            countries = root_classes_to_country.get(first_class)
            if countries:
                country = random.choice(countries)  # random get a country in the countries list
                longitude, latitude = random_point_in_country(shp_location, country)
                return longitude, latitude
        return None, None  # Return None if no coordinates can be found

    # Apply the function to each row and create new columns for longitude and latitude
    df['longitude'], df['latitude'] = zip(*df.apply(add_coordinates, axis=1))

    df['time'] = [random_timestamp() for _ in range(len(df))]

    # Save the updated DataFrame to a new CSV file
    df.to_csv(file_path, index=False)


shp_location = "World_Countries.shp"
countrie_groups = [['Canada'], ['United States'], 
                   ['Mexico', 'Guatemala', 'Belize', 'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 
                    'Panama', 'Colombia', 'Venezuela', 'Guyana', 'Suriname', 'Ecuador', 'Peru'],
                   ['Brazil', 'Bolivia', 'Paraguay', 'Argentina', 'Chile', 'Uruguay']]
output_file = 'test_metadata_rootclass.csv'
root_classes = extract_root_classes(output_file)
root_classes_to_country = {root_classe: random.choice(countrie_groups) for root_classe in root_classes}
add_coord_and_time(output_file, root_classes_to_country, shp_location)


# plot
for root_class in root_classes:
    render_on_map(output_file, root_class)