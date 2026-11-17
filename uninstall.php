<?php
/**
 * Bongkar Canvas Builder Uninstall
 * Triggered when plugin is deleted via WordPress Admin
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Note: To preserve user landing page data across accidental plugin updates or re-installations,
// postmeta (_bongkar_canvas_html, _bongkar_canvas_css, etc.) is retained in the database.
// Transient caches can be safely cleared here:
delete_transient('bongkar_builder_cache');
