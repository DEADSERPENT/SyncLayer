// Real-Time Content Sync (RTCS) - Figma Plugin
// Connects live content sources to Figma designs

// Security Configuration
const SECURITY_CONFIG = {
  MAX_URL_LENGTH: 2048,
  MAX_AUTH_VALUE_LENGTH: 1024,
  MAX_DATA_PATH_LENGTH: 500,
  MAX_FIELD_PATH_LENGTH: 500,
  MAX_RESPONSE_SIZE: 10 * 1024 * 1024, // 10MB
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  ALLOWED_PROTOCOLS: ['https:', 'http:'],
  BLOCKED_DOMAINS: ['localhost', '127.0.0.1', '0.0.0.0', '::1'],
  MAX_MAPPINGS: 100
};

// Rate limiting
let requestCount = 0;
let rateLimitWindowStart = Date.now();

// Types
interface ConnectionConfig {
  sourceType: string;
  url: string;
  authType: string;
  authValue: string;
  dataPath: string;
}

interface Mapping {
  layerId: string;
  layerName: string;
  fieldPath: string;
}

interface PluginData {
  config: ConnectionConfig | null;
  mappings: Mapping[];
  cachedData: any | null;
  lastSync: string | null;
  autoSync: boolean;
  language: string;
}

// Plugin state
let pluginData: PluginData = {
  config: null,
  mappings: [],
  cachedData: null,
  lastSync: null,
  autoSync: false,
  language: 'en'
};

// Simple base64 encoding (for Basic Auth)
function base64Encode(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;

  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : Number.NaN;
    const c = i < str.length ? str.charCodeAt(i++) : Number.NaN;

    const bitmap = (a << 16) | (b << 8) | c;

    output += chars[(bitmap >> 18) & 63];
    output += chars[(bitmap >> 12) & 63];
    output += isNaN(b) ? '=' : chars[(bitmap >> 6) & 63];
    output += isNaN(c) ? '=' : chars[bitmap & 63];
  }

  return output;
}

// Security Functions
function sanitizeString(input: string, maxLength: number): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input: expected string');
  }

  // Trim and limit length
  const sanitized = input.trim().substring(0, maxLength);

  // Remove any null bytes
  return sanitized.replace(/\0/g, '');
}

function validateURL(url: string): boolean {
  // Length check
  if (url.length > SECURITY_CONFIG.MAX_URL_LENGTH) {
    throw new Error('URL exceeds maximum length');
  }

  // Basic URL validation with regex
  const urlPattern = /^https?:\/\/.+/i;
  if (!urlPattern.test(url)) {
    throw new Error('Invalid URL format');
  }

  // Extract hostname manually
  const matches = url.match(/^https?:\/\/([^\/\?#:]+)/i);
  if (!matches) {
    throw new Error('Could not parse URL hostname');
  }

  const hostname = matches[1].toLowerCase();
  const protocol = url.match(/^(https?):/)![1] + ':';

  // Protocol check
  let protocolAllowed = false;
  for (const allowed of SECURITY_CONFIG.ALLOWED_PROTOCOLS) {
    if (protocol === allowed) {
      protocolAllowed = true;
      break;
    }
  }

  if (!protocolAllowed) {
    throw new Error('Invalid protocol. Only HTTP and HTTPS are allowed');
  }

  // Block localhost and internal IPs
  for (const blocked of SECURITY_CONFIG.BLOCKED_DOMAINS) {
    if (hostname === blocked || hostname.indexOf(`.${blocked}`) !== -1) {
      throw new Error('Cannot connect to internal/localhost addresses');
    }
  }

  // Check for private IP ranges
  if (isPrivateIP(hostname)) {
    throw new Error('Cannot connect to private IP addresses');
  }

  return true;
}

function isPrivateIP(hostname: string): boolean {
  // Check for private IP ranges
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);

  if (match) {
    const [, a, b, c, d] = match.map(Number);

    // Check private ranges
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 (link-local)
  }

  return false;
}

function checkRateLimit(): boolean {
  const now = Date.now();

  // Reset counter if window has passed
  if (now - rateLimitWindowStart > SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
    requestCount = 0;
    rateLimitWindowStart = now;
  }

  // Check if limit exceeded
  if (requestCount >= SECURITY_CONFIG.RATE_LIMIT_REQUESTS) {
    throw new Error('Rate limit exceeded. Please wait before making more requests.');
  }

  requestCount++;
  return true;
}

function validateAuthValue(authValue: string, authType: string): string {
  if (!authValue) return '';

  const sanitized = sanitizeString(authValue, SECURITY_CONFIG.MAX_AUTH_VALUE_LENGTH);

  // Additional validation based on auth type
  if (authType === 'bearer' && sanitized.length < 10) {
    throw new Error('Bearer token appears to be too short');
  }

  return sanitized;
}

function sanitizeErrorMessage(error: any): string {
  // Never expose sensitive information in error messages
  const message = error instanceof Error ? error.message : 'An unknown error occurred';

  // Remove any potential sensitive data patterns
  return message
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .replace(/token[=:]\s*[^\s&]+/gi, 'token=[REDACTED]')
    .replace(/api[_-]?key[=:]\s*[^\s&]+/gi, 'api_key=[REDACTED]')
    .replace(/password[=:]\s*[^\s&]+/gi, 'password=[REDACTED]')
    .substring(0, 500); // Limit error message length
}

function validateDataPath(path: string): string {
  if (!path) return '';

  const sanitized = sanitizeString(path, SECURITY_CONFIG.MAX_DATA_PATH_LENGTH);

  // Only allow alphanumeric, dots, brackets, and underscores
  if (!/^[a-zA-Z0-9._\[\]]*$/.test(sanitized)) {
    throw new Error('Invalid data path format');
  }

  return sanitized;
}

function validateFieldPath(path: string): string {
  if (!path) {
    throw new Error('Field path cannot be empty');
  }

  const sanitized = sanitizeString(path, SECURITY_CONFIG.MAX_FIELD_PATH_LENGTH);

  // Only allow alphanumeric, dots, brackets, and underscores
  if (!/^[a-zA-Z0-9._\[\]]+$/.test(sanitized)) {
    throw new Error('Invalid field path format. Use only letters, numbers, dots, and brackets.');
  }

  return sanitized;
}

// Show UI
figma.showUI(__html__, { width: 420, height: 680 });

// Initialize plugin
async function init() {
  try {
    // Load saved data from Figma's client storage
    const savedConfig = await figma.clientStorage.getAsync('rtcs_config');
    const savedMappings = await figma.clientStorage.getAsync('rtcs_mappings');
    const savedData = await figma.clientStorage.getAsync('rtcs_cached_data');
    const savedAutoSync = await figma.clientStorage.getAsync('rtcs_auto_sync');
    const savedLanguage = await figma.clientStorage.getAsync('rtcs_language');

    if (savedConfig) {
      pluginData.config = JSON.parse(savedConfig);
    }

    if (savedMappings) {
      pluginData.mappings = JSON.parse(savedMappings);
    }

    if (savedData) {
      pluginData.cachedData = JSON.parse(savedData);
    }

    if (savedAutoSync !== undefined) {
      pluginData.autoSync = savedAutoSync;
    }

    if (savedLanguage) {
      pluginData.language = savedLanguage;
    }

    // Send initial state to UI
    updateUIConnectionStatus();
    sendMappingsList();
  } catch (error) {
    console.error('Init error:', error);
  }
}

// Utility: Get nested value from object using path
function getNestedValue(obj: any, path: string): any {
  if (!path) return obj;

  const keys = path.split(/[\.\[\]]+/).filter(k => k);
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

// Fetch data from API
async function fetchData(config: ConnectionConfig): Promise<any> {
  try {
    // Security checks
    checkRateLimit();
    validateURL(config.url);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Figma-RTCS-Plugin/1.0'
    };

    // Add authentication
    if (config.authType === 'bearer' && config.authValue) {
      headers['Authorization'] = `Bearer ${config.authValue}`;
    } else if (config.authType === 'apikey' && config.authValue) {
      headers['X-API-Key'] = config.authValue;
    } else if (config.authType === 'basic' && config.authValue) {
      // For basic auth, encode credentials (format: username:password)
      const base64Credentials = base64Encode(config.authValue);
      headers['Authorization'] = `Basic ${base64Credentials}`;
    }

    // Fetch without timeout (Figma plugin environment limitation)
    const response = await fetch(config.url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let data = await response.json();

    // Validate that data is not too large
    const dataString = JSON.stringify(data);
    if (dataString.length > SECURITY_CONFIG.MAX_RESPONSE_SIZE) {
      throw new Error('Response data exceeds maximum allowed size');
    }

    // Extract data from path if specified
    if (config.dataPath) {
      const validatedPath = validateDataPath(config.dataPath);
      data = getNestedValue(data, validatedPath);
    }

    return data;
  } catch (error) {
    const sanitizedError = sanitizeErrorMessage(error);
    throw new Error(`Failed to fetch data: ${sanitizedError}`);
  }
}

// Test connection
async function testConnection(url: string, authType: string, authValue: string, dataPath: string) {
  try {
    // Validate inputs
    const sanitizedUrl = sanitizeString(url, SECURITY_CONFIG.MAX_URL_LENGTH);
    const sanitizedDataPath = dataPath ? validateDataPath(dataPath) : '';
    const validatedAuthValue = authValue ? validateAuthValue(authValue, authType) : '';

    validateURL(sanitizedUrl);

    const testConfig: ConnectionConfig = {
      sourceType: 'rest',
      url: sanitizedUrl,
      authType,
      authValue: validatedAuthValue,
      dataPath: sanitizedDataPath
    };

    const data = await fetchData(testConfig);

    figma.ui.postMessage({
      type: 'test-result',
      success: true,
      message: `Connection successful! Found ${JSON.stringify(data).length} bytes of data.`
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'test-result',
      success: false,
      message: sanitizeErrorMessage(error)
    });
  }
}

// Save connection
async function saveConnection(config: ConnectionConfig) {
  try {
    // Validate all inputs
    const sanitizedUrl = sanitizeString(config.url, SECURITY_CONFIG.MAX_URL_LENGTH);
    const sanitizedDataPath = config.dataPath ? validateDataPath(config.dataPath) : '';
    const validatedAuthValue = config.authValue ? validateAuthValue(config.authValue, config.authType) : '';

    validateURL(sanitizedUrl);

    const validatedConfig: ConnectionConfig = {
      sourceType: config.sourceType,
      url: sanitizedUrl,
      authType: config.authType,
      authValue: validatedAuthValue,
      dataPath: sanitizedDataPath
    };

    pluginData.config = validatedConfig;
    await figma.clientStorage.setAsync('rtcs_config', JSON.stringify(validatedConfig));

    // Fetch initial data
    const data = await fetchData(validatedConfig);
    pluginData.cachedData = data;
    pluginData.lastSync = new Date().toISOString();
    await figma.clientStorage.setAsync('rtcs_cached_data', JSON.stringify(data));

    updateUIConnectionStatus();

    figma.ui.postMessage({
      type: 'success',
      message: 'Connected successfully!'
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: sanitizeErrorMessage(error)
    });
  }
}

// Update UI with connection status
function updateUIConnectionStatus() {
  figma.ui.postMessage({
    type: 'connection-status',
    connected: pluginData.config !== null,
    config: pluginData.config || {}
  });
}

// Sync data now
async function syncNow() {
  if (!pluginData.config) {
    figma.ui.postMessage({
      type: 'error',
      message: 'No connection configured'
    });
    return;
  }

  try {
    const data = await fetchData(pluginData.config);
    pluginData.cachedData = data;
    pluginData.lastSync = new Date().toISOString();
    await figma.clientStorage.setAsync('rtcs_cached_data', JSON.stringify(data));

    // Update all mapped layers
    await updateAllMappings();

    figma.ui.postMessage({
      type: 'sync-complete'
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Sync failed'
    });
  }
}

// Preview data
function previewData() {
  if (!pluginData.cachedData) {
    figma.ui.postMessage({
      type: 'error',
      message: 'No data available. Please sync first.'
    });
    return;
  }

  figma.ui.postMessage({
    type: 'data-preview',
    data: pluginData.cachedData
  });
}

// Map layer
async function mapLayer(fieldPath: string) {
  try {
    // Check if we have data
    if (!pluginData.cachedData) {
      figma.ui.postMessage({
        type: 'error',
        message: 'No data available. Please connect and sync data first.'
      });
      return;
    }

    // Validate field path
    const validatedPath = validateFieldPath(fieldPath);

    // Check if field path exists in data
    const testValue = getNestedValue(pluginData.cachedData, validatedPath);
    if (testValue === undefined || testValue === null) {
      figma.ui.postMessage({
        type: 'error',
        message: `No value found for path "${validatedPath}". Check your field path or use Preview Data to see structure.`
      });
      return;
    }

    // Check mapping limit
    if (pluginData.mappings.length >= SECURITY_CONFIG.MAX_MAPPINGS) {
      figma.ui.postMessage({
        type: 'error',
        message: `Maximum number of mappings (${SECURITY_CONFIG.MAX_MAPPINGS}) reached`
      });
      return;
    }

    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: 'Please select a text layer first'
      });
      return;
    }

    const node = selection[0];

    if (node.type !== 'TEXT') {
      figma.ui.postMessage({
        type: 'error',
        message: 'Selected layer must be a text layer. Current selection is: ' + node.type
      });
      return;
    }

    // Sanitize layer name
    const sanitizedLayerName = sanitizeString(node.name, 200);

    // Create mapping
    const mapping: Mapping = {
      layerId: node.id,
      layerName: sanitizedLayerName,
      fieldPath: validatedPath
    };

    // Remove existing mapping for this layer if any
    pluginData.mappings = pluginData.mappings.filter(m => m.layerId !== node.id);

    // Add new mapping
    pluginData.mappings.push(mapping);
    await figma.clientStorage.setAsync('rtcs_mappings', JSON.stringify(pluginData.mappings));

    // Update the layer with current data
    const updateResult = await updateLayerFromMapping(mapping);

    if (updateResult.success) {
      figma.ui.postMessage({
        type: 'mapping-created',
        mapping
      });

      figma.ui.postMessage({
        type: 'success',
        message: `Mapped "${sanitizedLayerName}" to "${validatedPath}" - Text updated!`
      });
    } else {
      figma.ui.postMessage({
        type: 'error',
        message: updateResult.error || 'Failed to update text layer'
      });
    }

    sendMappingsList();
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: sanitizeErrorMessage(error)
    });
  }
}

// Update layer from mapping
async function updateLayerFromMapping(mapping: Mapping): Promise<{success: boolean, error?: string}> {
  if (!pluginData.cachedData) {
    return { success: false, error: 'No cached data available' };
  }

  try {
    const node = await figma.getNodeByIdAsync(mapping.layerId) as TextNode;

    if (!node) {
      return { success: false, error: `Layer with ID ${mapping.layerId} not found` };
    }

    if (node.type !== 'TEXT') {
      return { success: false, error: `Layer "${mapping.layerName}" is not a text layer (type: ${node.type})` };
    }

    // Get value from data
    const value = getNestedValue(pluginData.cachedData, mapping.fieldPath);

    if (value === undefined || value === null) {
      return { success: false, error: `No value found for path: ${mapping.fieldPath}` };
    }

    // Convert value to string and sanitize
    let textValue = String(value);

    // Limit text length to prevent performance issues
    const MAX_TEXT_LENGTH = 50000;
    if (textValue.length > MAX_TEXT_LENGTH) {
      textValue = textValue.substring(0, MAX_TEXT_LENGTH) + '... [truncated]';
    }

    // Remove any control characters except newlines and tabs
    textValue = textValue.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Load font before updating text
    try {
      await figma.loadFontAsync(node.fontName as FontName);
    } catch (fontError) {
      return { success: false, error: `Failed to load font: ${fontError}` };
    }

    // Update text
    node.characters = textValue;

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error updating layer ${mapping.layerName}:`, error);
    return { success: false, error: errorMsg };
  }
}

// Update all mappings
async function updateAllMappings() {
  for (const mapping of pluginData.mappings) {
    await updateLayerFromMapping(mapping);
  }
}

// Send mappings list to UI
function sendMappingsList() {
  figma.ui.postMessage({
    type: 'mappings-list',
    mappings: pluginData.mappings
  });
}

// Remove mapping
async function removeMapping(layerId: string) {
  pluginData.mappings = pluginData.mappings.filter(m => m.layerId !== layerId);
  await figma.clientStorage.setAsync('rtcs_mappings', JSON.stringify(pluginData.mappings));

  sendMappingsList();

  figma.ui.postMessage({
    type: 'success',
    message: 'Mapping removed'
  });
}

// Clear all mappings
async function clearMappings() {
  pluginData.mappings = [];
  await figma.clientStorage.setAsync('rtcs_mappings', JSON.stringify([]));

  sendMappingsList();

  figma.ui.postMessage({
    type: 'success',
    message: 'All mappings cleared'
  });
}

// Toggle auto sync
async function toggleAutoSync(enabled: boolean) {
  pluginData.autoSync = enabled;
  await figma.clientStorage.setAsync('rtcs_auto_sync', enabled);

  if (enabled) {
    // Start auto sync interval (15 minutes)
    figma.ui.postMessage({
      type: 'success',
      message: 'Auto sync enabled (every 15 minutes)'
    });
  } else {
    figma.ui.postMessage({
      type: 'success',
      message: 'Auto sync disabled'
    });
  }
}

// Apply language
async function applyLanguage(language: string) {
  pluginData.language = language;
  await figma.clientStorage.setAsync('rtcs_language', language);

  // If we have a connection, offer to re-sync with language parameter
  if (pluginData.config && pluginData.cachedData) {
    figma.ui.postMessage({
      type: 'success',
      message: `Language set to ${language}. To use localized content, add language parameter to your API URL (e.g., ?lang=${language}) and click Sync Now.`
    });
  } else {
    figma.ui.postMessage({
      type: 'success',
      message: `Language preference saved: ${language}`
    });
  }
}

// Export configuration
function exportConfig() {
  const config = {
    connection: pluginData.config,
    mappings: pluginData.mappings,
    language: pluginData.language
  };

  // In a real implementation, this would trigger a download
  // For now, we'll just log it and show a message
  console.log('Config export:', JSON.stringify(config, null, 2));

  figma.ui.postMessage({
    type: 'success',
    message: 'Configuration exported to console'
  });
}

// Reset plugin
async function resetPlugin() {
  pluginData = {
    config: null,
    mappings: [],
    cachedData: null,
    lastSync: null,
    autoSync: false,
    language: 'en'
  };

  await figma.clientStorage.deleteAsync('rtcs_config');
  await figma.clientStorage.deleteAsync('rtcs_mappings');
  await figma.clientStorage.deleteAsync('rtcs_cached_data');
  await figma.clientStorage.deleteAsync('rtcs_auto_sync');
  await figma.clientStorage.deleteAsync('rtcs_language');

  updateUIConnectionStatus();
  sendMappingsList();

  figma.ui.postMessage({
    type: 'success',
    message: 'Plugin reset successfully'
  });
}

// Handle messages from UI
figma.ui.onmessage = async (msg: any) => {
  try {
    switch (msg.type) {
      case 'init':
        await init();
        break;

      case 'test-connection':
        await testConnection(msg.url, msg.authType, msg.authValue, msg.dataPath);
        break;

      case 'save-connection':
        await saveConnection(msg.config);
        break;

      case 'sync-now':
        await syncNow();
        break;

      case 'preview-data':
        previewData();
        break;

      case 'map-layer':
        await mapLayer(msg.fieldPath);
        break;

      case 'remove-mapping':
        await removeMapping(msg.layerId);
        break;

      case 'clear-mappings':
        await clearMappings();
        break;

      case 'toggle-auto-sync':
        await toggleAutoSync(msg.enabled);
        break;

      case 'apply-language':
        await applyLanguage(msg.language);
        break;

      case 'export-config':
        exportConfig();
        break;

      case 'reset-plugin':
        await resetPlugin();
        break;

      default:
        console.warn('Unknown message type:', msg.type);
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'An error occurred'
    });
  }
};
