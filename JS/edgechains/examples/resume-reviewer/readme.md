# React Chain Example

This is an example project that demonstrates the usage of React Chain.

## Configuration

1 Add OpenAiApi key in secrets.jsonnet

    ```bash
    local OPENAI_API_KEY = "sk-****";
    ```

## Installation

1. Install the dependencies:

    ```bash
    npm install
    ```

## Usage

1. Start the server:

    ```bash
    npm run start
    ```

2. Hit the `GET` endpoint with question with pdf formData and name should be File

    ```bash
    http://localhost:3000/upload-resume
    ```
    
    OR

Open the frontend/index.html with live server

    ```bash
        http://localhost:5500/JS/edgechains/examples/resume-reviewer/frontend/
    ```
