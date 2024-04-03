#!/bin/bash

# Create the model directory if it doesn't exist
mkdir -p model

# Download the file into the model directory
curl -o model/vggish_model.ckpt https://storage.googleapis.com/audioset/vggish_model.ckpt

echo "Model downloaded to the 'model' directory."

# install Python dependencies 
pip install -r requirements.txt

echo "Setup complete."

