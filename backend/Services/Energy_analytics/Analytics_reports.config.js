"use strict";

/**
 * Analytics_reports.config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loads and caches site_config.json.
 * Provides helper functions to look up devices by instance name.
 * All other modules import from here — single source of truth.
 */

const path = require("path");
const fs = require("fs");

// Load config once at startup
const CONFIG_PATH = path.join(__dirname, "config", "site_config.json");

let _config = null;

function getSiteConfig() {
  if (!_config) {
    _config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  }
  return _config;
}

function getDevices() {
  return getSiteConfig().devices;
}

function getDeviceByInstance(instance) {
  return getDevices().find((d) => d.instance === instance) ?? null;
}

function getDevicesByType(deviceType) {
  return getDevices().filter((d) => d.device_type === deviceType);
}

function getSiteInterval() {
  return getSiteConfig().site.interval_minutes;
}

module.exports = {
  getSiteConfig,
  getDevices,
  getDeviceByInstance,
  getDevicesByType,
  getSiteInterval,
};
