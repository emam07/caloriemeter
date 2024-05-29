import sys
import tensorflow as tf
import numpy as np
import cv2
from tensorflow.keras.preprocessing import image as keras_image
from tensorflow.keras.applications.inception_v3 import InceptionV3, preprocess_input, decode_predictions

# Load a pre-trained InceptionV3 model (initialized once)
model = InceptionV3(weights='imagenet')

# Function to process image and make predictions
def process_and_predict(image_path, model):
    # Load image using OpenCV
    image_frame = cv2.imread(image_path)
    if image_frame is None:
        print("Error: Unable to read image")
        return
    
    # Resize the image to match the input size of the model (299x299 for InceptionV3)
    img_resized = cv2.resize(image_frame, (299, 299))
    
    # Convert the image to an array and preprocess it
    img_array = keras_image.img_to_array(img_resized)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    
    # Make predictions (with consistent input shape)
    predictions = model.predict(img_array)
    decoded_predictions = decode_predictions(predictions, top=5)[0]
    
    return decoded_predictions

def estimate_calories(predictions):
    # Dummy function to estimate calories based on predictions
    # In practice, you would map the predictions to actual calorie values
    food_item = predictions[0][1]
    calories = 200  # Dummy calorie value
    return food_item, calories

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python process_image.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    predictions = process_and_predict(image_path, model)
    if predictions:
        food_item, calories = estimate_calories(predictions)
        print(f'{{"foodItem": "{food_item}", "calories": {calories}, "probability": {predictions[0][2] * 100:.2f}}}')
