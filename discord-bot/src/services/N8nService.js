const axios = require('axios');

/**
 * N8n Service
 * Responsible for all n8n API interactions
 */
class N8nService {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.client = axios.create({
      timeout: 10000,
      headers: apiKey ? { 'X-N8N-API-KEY': apiKey } : {},
    });
  }

  /**
   * Trigger a webhook
   * @param {string} webhookPath - The webhook path
   * @param {object} payload - The payload to send
   * @returns {Promise<object>} - The response data
   */
  async triggerWebhook(webhookPath, payload) {
    const url = `${this.baseUrl}/webhook/${webhookPath}`;
    
    try {
      const response = await this.client.post(url, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Format response data for display
   * @param {*} data - Data to format
   * @returns {string} - Formatted string
   */
  formatResponse(data) {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    return text;
  }

  /**
   * Handle axios errors
   * @param {Error} error - The error to handle
   * @returns {Error} - Formatted error
   */
  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return error;
  }
}

module.exports = N8nService;
