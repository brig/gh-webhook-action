const core = require('@actions/core');
const http = require('@actions/http-client');

async function run() {
    try {
        const webhookUrl = core.getInput('webhook_url', { required: true });
        const requestBody = core.getInput('request_body', { required: true });
        const requestHeaders = core.getInput('request_headers');
        const retries = parseInt(core.getInput('retries')) || 3;
        const retryDelay = parseInt(core.getInput('retry_delay')) || 5000;

        const client = new http.HttpClient('call-webhook-action');

        let remainingRetries = retries;
        let response;

        while (retries > 0) {
            try {
                const requestOptions = {
                    headers: requestHeaders ? JSON.parse(requestHeaders) : undefined
                };

                response = await client.postJson(webhookUrl, JSON.parse(requestBody), requestOptions);
                break;
            } catch (error) {
                remainingRetries--;
                if (remainingRetries === 0) {
                    throw new Error('Webhook request failed after multiple retries');
                }
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }

        console.log(response.result);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
