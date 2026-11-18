<?php
/**
 * Plugin Name:       Bongkar Canvas Builder
 * Plugin URI:        https://bongkar.id/builder
 * Description:       Ultra-lightweight, HTML-first Visual Page Builder for WordPress. Designed for importing AI-generated designs (HTML/CSS/JS/Figma) and editing them on a standalone canvas without Elementor bloat.
 * Version:           1.2.3
 * Author:            Bongkar WP Team
 * Author URI:        https://bongkar.id
 * Text Domain:       bongkar-builder
 * Domain Path:       /languages
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * License:           GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

define('BONGKAR_BUILDER_VERSION', '1.2.3');
define('BONGKAR_BUILDER_FILE', __FILE__);
define('BONGKAR_BUILDER_PATH', plugin_dir_path(__FILE__));
define('BONGKAR_BUILDER_URL', plugin_dir_url(__FILE__));

// Require Core Classes safely
$bongkar_core_includes = [
    'includes/class-builder-google-fonts.php',
    'includes/class-builder-core.php',
    'includes/class-builder-menu.php',
    'includes/class-builder-templates.php',
    'includes/class-builder-ajax.php',
    'includes/class-builder-admin.php',
    'includes/class-builder-renderer.php',
    'includes/class-builder-post-seo.php',
    'includes/class-builder-updater.php',
];

foreach ($bongkar_core_includes as $include_rel_path) {
    $full_include_path = BONGKAR_BUILDER_PATH . $include_rel_path;
    if (file_exists($full_include_path)) {
        require_once $full_include_path;
    }
}

/**
 * Initialize Bongkar Canvas Builder
 */
function bongkar_builder_init() {
    load_plugin_textdomain('bongkar-builder', false, dirname(plugin_basename(__FILE__)) . '/languages');

    if (class_exists('Bongkar_Builder_Core')) {
        Bongkar_Builder_Core::get_instance();
    }
    if (class_exists('Bongkar_Builder_Menu')) {
        Bongkar_Builder_Menu::get_instance();
    }
    if (class_exists('Bongkar_Builder_Templates')) {
        Bongkar_Builder_Templates::get_instance();
    }
    if (class_exists('Bongkar_Builder_Ajax')) {
        Bongkar_Builder_Ajax::get_instance();
    }
    if (class_exists('Bongkar_Builder_Admin')) {
        Bongkar_Builder_Admin::get_instance();
    }
    if (class_exists('Bongkar_Builder_Renderer')) {
        Bongkar_Builder_Renderer::get_instance();
    }
    if (class_exists('Bongkar_Builder_Post_SEO')) {
        Bongkar_Builder_Post_SEO::get_instance();
    }
    if (class_exists('Bongkar_Builder_Updater')) {
        new Bongkar_Builder_Updater();
    }
}
add_action('plugins_loaded', 'bongkar_builder_init');

/**
 * Minimum Requirements Check on Activation
 */
register_activation_hook(__FILE__, function() {
    if (version_compare(PHP_VERSION, '7.4', '<')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(
            sprintf(
                __('Bongkar Canvas Builder requires PHP version %s or higher. Your server is currently running PHP version %s.', 'bongkar-builder'),
                '7.4',
                PHP_VERSION
            ),
            __('Plugin Activation Error', 'bongkar-builder'),
            ['back_link' => true]
        );
    }

    global $wp_version;
    if (version_compare($wp_version, '5.8', '<')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(
            sprintf(
                __('Bongkar Canvas Builder requires WordPress version %s or higher. Your site is running WordPress version %s.', 'bongkar-builder'),
                '5.8',
                $wp_version
            ),
            __('Plugin Activation Error', 'bongkar-builder'),
            ['back_link' => true]
        );
    }

    // Register Template CPT before flush rewrite rules
    if (class_exists('Bongkar_Builder_Templates')) {
        Bongkar_Builder_Templates::get_instance()->register_template_post_type();
    }

    // Flush rewrite rules
    flush_rewrite_rules();
});

/**
 * Deactivation Hook
 */
register_deactivation_hook(__FILE__, function() {
    flush_rewrite_rules();
});
