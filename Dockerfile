FROM python:3.9

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

# Install dependencies
# Using --no-cache-dir to keep the image small
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the current directory contents into the container at /code
COPY . /code

# Create a writable directory for non-root user (mostly for HF Spaces compliance)
RUN mkdir -p /code/cache && chmod -R 777 /code/cache

# Expose port (HF Spaces defaults to 7860)
EXPOSE 7860

# Command to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
