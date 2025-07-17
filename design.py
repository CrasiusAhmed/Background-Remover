# -*- coding: utf-8 -*-
"""
==============================================================================
|                         AI Background Remover Pro                          |
|----------------------------------------------------------------------------|
|   A user-friendly desktop application to remove backgrounds from images    |
|   with high precision, supporting both single and batch processing.        |
|                                                                            |
|   - Built with Python & pywebview for a modern, web-based UI.              |
|   - Powered by the 'rembg' library for state-of-the-art results.           |
==============================================================================
"""
import webview
import threading
from rembg import remove
from PIL import Image
import os
import io
import base64
import multiprocessing

# --- API Class for pywebview ---
class Api:
    def __init__(self):
        self.input_path = None
        self.output_path = None
        self.input_folder = None
        self.output_folder = None
        self.batch_processing = False
        self.stop_batch = False

    def select_image(self):
        file_types = ('Image Files (*.png;*.jpg;*.jpeg;*.bmp;*.webp)', 'All files (*.*)')
        result = window.create_file_dialog(webview.OPEN_DIALOG, allow_multiple=False, file_types=file_types)
        if result:
            self.input_path = result[0]
            threading.Thread(target=self.process_single_image).start()

    def process_single_image(self):
        if not self.input_path:
            return

        try:
            with open(self.input_path, "rb") as f:
                input_bytes = f.read()
            
            output_bytes = remove(input_bytes)
            
            # --- Convert to base64 to display in HTML ---
            original_base64 = base64.b64encode(input_bytes).decode('utf-8')
            processed_base64 = base64.b64encode(output_bytes).decode('utf-8')
            
            window.evaluate_js(f"showSingleFileResults('{original_base64}', '{processed_base64}')")

        except Exception as e:
            window.evaluate_js(f"showError('{str(e)}')")

    def save_image(self, base64_data):
        if not base64_data:
            return

        file_types = ('PNG Files (*.png)',)
        result = window.create_file_dialog(webview.SAVE_DIALOG, directory=os.path.dirname(self.input_path), save_filename='processed.png', file_types=file_types)

        if result:
            try:
                # --- Decode the base64 string to bytes ---
                image_data = base64.b64decode(base64_data.split(',')[1])
                with open(result, 'wb') as f:
                    f.write(image_data)
                window.evaluate_js(f"showSuccess('Image saved successfully!')")
            except Exception as e:
                window.evaluate_js(f"showError('Failed to save image: {str(e)}')")

    def select_input_folder(self):
        """Select input folder containing images to process"""
        input_folder = window.create_file_dialog(webview.FOLDER_DIALOG)
        if input_folder:
            self.input_folder = input_folder[0]
            window.evaluate_js(f"updateFolderPath('input', '{self.input_folder}')")

    def select_output_folder(self):
        """Select output folder where processed images will be saved"""
        output_folder = window.create_file_dialog(webview.FOLDER_DIALOG)
        if output_folder:
            self.output_folder = output_folder[0]
            window.evaluate_js(f"updateFolderPath('output', '{self.output_folder}')")

    def start_batch_processing(self):
        if not self.input_folder or not self.output_folder:
            window.evaluate_js("showError('Please select both input and output folders.')")
            return
        if self.input_folder == self.output_folder:
            window.evaluate_js("showError('Input and output folders cannot be the same.')")
            return
        
        if self.batch_processing:
            window.evaluate_js("showError('Batch processing is already running.')")
            return
            
        self.batch_processing = True
        self.stop_batch = False
        
        # Show stop button and hide start button
        window.evaluate_js("document.getElementById('start-batch-btn').style.display = 'none';")
        window.evaluate_js("document.getElementById('stop-batch-btn').style.display = 'inline-flex';")
        
        threading.Thread(target=self.batch_process_thread).start()

    def stop_batch_processing(self):
        """Stop the current batch processing"""
        self.stop_batch = True
        window.evaluate_js("addLogMessage('Stopping batch processing...')")

    def batch_process_thread(self):
        try:
            valid_extensions = ['.png', '.jpg', '.jpeg', '.webp', '.bmp']
            files_to_process = [f for f in os.listdir(self.input_folder) if os.path.splitext(f)[1].lower() in valid_extensions]
            
            if not files_to_process:
                window.evaluate_js("addLogMessage('No valid image files found.')")
                self._reset_batch_ui()
                return

            total_files = len(files_to_process)
            window.evaluate_js(f"addLogMessage('Found {total_files} images to process.')")

            for i, filename in enumerate(files_to_process):
                # Check if stop was requested
                if self.stop_batch:
                    window.evaluate_js("addLogMessage('Batch processing stopped by user.')")
                    window.evaluate_js("showError('Batch processing was stopped.')")
                    break
                    
                input_path = os.path.join(self.input_folder, filename)
                output_filename = f"{os.path.splitext(filename)[0]}_no_bg.png"
                output_path = os.path.join(self.output_folder, output_filename)
                
                try:
                    with open(input_path, 'rb') as f_in:
                        input_data = f_in.read()
                    output_data = remove(input_data)
                    with open(output_path, 'wb') as f_out:
                        f_out.write(output_data)

                    window.evaluate_js(f"addLogMessage('Processed: {filename}')")
                except Exception as e:
                    window.evaluate_js(f"addLogMessage('Error processing {filename}: {str(e)}')")

                progress = (i + 1) / total_files * 100
                window.evaluate_js(f"updateProgressBar({progress})")
            
            if not self.stop_batch:
                window.evaluate_js("showSuccess('Batch processing complete!')")
                window.evaluate_js("addLogMessage('All images processed successfully!')")

        except Exception as e:
            window.evaluate_js(f"showError('An error occurred during batch processing: {str(e)}')")
        finally:
            self._reset_batch_ui()

    def _reset_batch_ui(self):
        """Reset the batch processing UI to initial state"""
        self.batch_processing = False
        self.stop_batch = False
        
        # Show start button and hide stop button
        window.evaluate_js("document.getElementById('start-batch-btn').style.display = 'inline-flex';")
        window.evaluate_js("document.getElementById('stop-batch-btn').style.display = 'none';")

    # --- ADD THESE NEW FUNCTIONS FOR WINDOW CONTROL ---
    def close_window(self):
        window.destroy()

    def minimize_window(self):
        window.minimize()

    def toggle_maximize_window(self):
        window.toggle_fullscreen()


# --- Main Application Entry Point ---
if __name__ == '__main__':
    multiprocessing.freeze_support()
    api = Api()
    window = webview.create_window(
        'AI Background Remover Pro',
        'gui.html',
        js_api=api,
        width=1200,
        height=800,
        frameless=True,  # Keep this!
        easy_drag=True # Helps make the window draggable
    )
    webview.start()