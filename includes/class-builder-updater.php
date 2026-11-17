<?php
/**
 * Bongkar Canvas Builder - Native GitHub Auto-Updater
 *
 * Checks for new releases on GitHub and integrates with WordPress native
 * plugin update API and one-click update engine.
 *
 * @package Bongkar_Builder
 */

if (!defined('ABSPATH')) {
    exit;
}

class Bongkar_Builder_Updater {

    /**
     * Plugin file path
     * @var string
     */
    private $file;

    /**
     * Plugin slug (folder name)
     * @var string
     */
    private $plugin_slug;

    /**
     * Plugin basename (e.g. bongkar-builder/bongkar-builder.php)
     * @var string
     */
    private $plugin_basename;

    /**
     * Current installed version
     * @var string
     */
    private $version;

    /**
     * GitHub repository path (owner/repo)
     * @var string
     */
    private $github_repo = 'kadeksrd/Bongkar-Builder';

    /**
     * Transient cache key
     * @var string
     */
    private $transient_key = 'bongkar_builder_github_release';

    /**
     * Constructor
     */
    public function __construct() {
        $this->file            = BONGKAR_BUILDER_FILE;
        $this->plugin_basename = plugin_basename($this->file);
        $dir                   = dirname($this->plugin_basename);
        $this->plugin_slug     = ($dir && $dir !== '.') ? $dir : 'bongkar-builder';
        $this->version         = defined('BONGKAR_BUILDER_VERSION') ? BONGKAR_BUILDER_VERSION : '1.2.3';

        // Check for updates when transient is saved or retrieved
        add_filter('pre_set_site_transient_update_plugins', [$this, 'check_update']);
        add_filter('site_transient_update_plugins', [$this, 'check_update']);

        // View version details popup in plugins screen
        add_filter('plugins_api', [$this, 'plugin_popup'], 20, 3);

        // Ensure proper folder naming after installation
        add_filter('upgrader_post_install', [$this, 'after_install'], 10, 3);

        // Clear cached release info when plugin is updated
        add_action('upgrader_process_complete', [$this, 'purge_cache'], 10, 2);

        // Support WordPress 5.5+ Native Auto-Updates
        add_filter('auto_update_plugin', [$this, 'maybe_auto_update'], 10, 2);

        // Attach auth header for downloads if token is set (for private repos)
        add_filter('http_request_args', [$this, 'attach_github_token_to_download'], 10, 2);

        // Quick action links and manual check handler in plugins.php
        add_filter('plugin_action_links_' . $this->plugin_basename, [$this, 'add_plugin_action_links']);
        add_action('admin_init', [$this, 'handle_manual_check']);
        add_action('admin_notices', [$this, 'render_update_check_notice']);
    }

    /**
     * Attach Authorization header to GitHub API & download requests if token is present
     *
     * @param array $args
     * @param string $url
     * @return array
     */
    public function attach_github_token_to_download($args, $url) {
        if (strpos($url, 'api.github.com/repos/' . $this->github_repo) !== false || strpos($url, 'github.com/' . $this->github_repo) !== false) {
            $token = defined('BONGKAR_BUILDER_GITHUB_TOKEN') 
                ? BONGKAR_BUILDER_GITHUB_TOKEN 
                : get_option('bongkar_builder_github_token', '');
            if (!empty($token)) {
                if (empty($args['headers'])) {
                    $args['headers'] = [];
                }
                $args['headers']['Authorization'] = 'Bearer ' . trim($token);
            }
        }
        return $args;
    }

    /**
     * Filter auto-update behavior for Bongkar Builder
     *
     * @param bool|null $update
     * @param object $item
     * @return bool|null
     */
    public function maybe_auto_update($update, $item) {
        if (isset($item->plugin) && ($item->plugin === $this->plugin_basename || strpos($item->plugin, 'bongkar') !== false)) {
            // Enable auto-update for Bongkar Builder
            return true;
        }
        return $update;
    }

    /**
     * Fetch latest release data from GitHub API
     *
     * @param bool $force_check
     * @return array|false
     */
    public function get_remote_release($force_check = false) {
        global $pagenow;
        $is_forcing = $force_check || 
                      isset($_GET['force-check']) || 
                      (isset($_GET['action']) && $_GET['action'] === 'check-again') ||
                      isset($_GET['bongkar_check_update']) ||
                      ($pagenow === 'update-core.php');

        if (!$is_forcing) {
            $cached = get_transient($this->transient_key);
            if (!empty($cached) && is_array($cached)) {
                return $cached;
            }
        }

        $url = 'https://api.github.com/repos/' . $this->github_repo . '/releases/latest';
        $response = wp_remote_get($url, [
            'timeout'    => 10,
            'user-agent' => 'WordPress/' . get_bloginfo('version') . '; ' . home_url(),
            'headers'    => [
                'Accept' => 'application/vnd.github.v3+json',
            ],
        ]);

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return false;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (empty($data) || !is_array($data) || empty($data['tag_name'])) {
            return false;
        }

        // Cache for 12 hours
        set_transient($this->transient_key, $data, 12 * HOUR_IN_SECONDS);

        return $data;
    }

    /**
     * Add "Periksa Pembaruan" link to plugin row in wp-admin/plugins.php
     *
     * @param array $links
     * @return array
     */
    public function add_plugin_action_links($links) {
        $check_url = wp_nonce_url(admin_url('plugins.php?bongkar_check_update=1'), 'bongkar_check_update_action');
        $check_link = '<a href="' . esc_url($check_url) . '" style="color: #6366f1; font-weight: 600;">Periksa Pembaruan</a>';
        array_unshift($links, $check_link);
        return $links;
    }

    /**
     * Handle manual update check when user clicks "Periksa Pembaruan"
     */
    public function handle_manual_check() {
        if (!isset($_GET['bongkar_check_update'])) {
            return;
        }

        if (!current_user_can('update_plugins')) {
            return;
        }

        check_admin_referer('bongkar_check_update_action');

        // Delete all transients to force fresh check
        delete_transient($this->transient_key);
        delete_site_transient('update_plugins');

        // Fetch latest release from GitHub
        $release = $this->get_remote_release(true);

        // Tell WordPress to re-evaluate plugins
        wp_update_plugins();

        $remote_version = $release ? ltrim(trim($release['tag_name']), 'vV') : '';
        if ($remote_version && version_compare($remote_version, $this->version, '>')) {
            $status = 'new_available';
        } else {
            $status = 'up_to_date';
        }

        wp_safe_redirect(admin_url('plugins.php?bongkar_checked=' . $status . '&remote_ver=' . urlencode($remote_version)));
        exit;
    }

    /**
     * Render feedback notice after manual update check
     */
    public function render_update_check_notice() {
        if (!isset($_GET['bongkar_checked'])) {
            return;
        }

        $status = sanitize_text_field($_GET['bongkar_checked']);
        $ver = isset($_GET['remote_ver']) ? sanitize_text_field($_GET['remote_ver']) : '';

        if ($status === 'new_available') {
            echo '<div class="notice notice-warning is-dismissible" style="border-left-color: #6366f1;"><p><strong>Bongkar Canvas Builder:</strong> Ditemukan rilis versi baru <strong>v' . esc_html($ver) . '</strong> di GitHub! Silakan klik tautan <em>"update now" (perbarui sekarang)</em> di daftar plugin di bawah.</p></div>';
        } elseif ($status === 'up_to_date') {
            echo '<div class="notice notice-success is-dismissible"><p><strong>Bongkar Canvas Builder:</strong> Plugin sudah menggunakan versi paling baru (v' . esc_html($this->version) . '). Belum ada pembaruan baru dari GitHub.</p></div>';
        }
    }

    /**
     * Hook into WordPress plugin update check
     *
     * @param object $transient
     * @return object
     */
    public function check_update($transient) {
        if (empty($transient) || !is_object($transient)) {
            return $transient;
        }

        if (empty($transient->response)) {
            $transient->response = [];
        }
        if (empty($transient->no_update)) {
            $transient->no_update = [];
        }

        $release = $this->get_remote_release();
        if (!$release) {
            // Default to no_update so WordPress recognizes the plugin supports updates
            if (!isset($transient->response[$this->plugin_basename])) {
                $obj = new stdClass();
                $obj->id          = 'kadeksrd/Bongkar-Builder';
                $obj->slug        = $this->plugin_slug;
                $obj->plugin      = $this->plugin_basename;
                $obj->new_version = $this->version;
                $obj->url         = 'https://github.com/' . $this->github_repo;
                $obj->package     = '';
                $transient->no_update[$this->plugin_basename] = $obj;
            }
            return $transient;
        }

        $remote_version = ltrim(trim($release['tag_name']), 'vV');
        if (empty($remote_version)) {
            return $transient;
        }

        if (version_compare($remote_version, $this->version, '>')) {
            $download_url = $this->get_release_zip_url($release);

            $obj = new stdClass();
            $obj->id          = 'kadeksrd/Bongkar-Builder';
            $obj->slug        = $this->plugin_slug;
            $obj->plugin      = $this->plugin_basename;
            $obj->new_version = $remote_version;
            $obj->url         = 'https://github.com/' . $this->github_repo;
            $obj->package     = $download_url;
            $obj->tested      = '6.7';
            $obj->requires    = '5.8';
            $obj->requires_php = '7.4';

            $transient->response[$this->plugin_basename] = $obj;
            unset($transient->no_update[$this->plugin_basename]);
        } else {
            $obj = new stdClass();
            $obj->id          = 'kadeksrd/Bongkar-Builder';
            $obj->slug        = $this->plugin_slug;
            $obj->plugin      = $this->plugin_basename;
            $obj->new_version = $this->version;
            $obj->url         = 'https://github.com/' . $this->github_repo;
            $obj->package     = '';
            $obj->tested      = '6.7';
            $obj->requires    = '5.8';
            $obj->requires_php = '7.4';

            $transient->no_update[$this->plugin_basename] = $obj;
            unset($transient->response[$this->plugin_basename]);
        }

        return $transient;
    }

    /**
     * Provide details modal for "View version x.x details"
     *
     * @param false|object|array $result
     * @param string $action
     * @param object $args
     * @return false|object
     */
    public function plugin_popup($result, $action, $args) {
        if ($action !== 'plugin_information') {
            return $result;
        }

        if (empty($args->slug) || $args->slug !== $this->plugin_slug) {
            return $result;
        }

        $release = $this->get_remote_release();
        if (!$release) {
            return $result;
        }

        $remote_version = ltrim(trim($release['tag_name']), 'vV');
        $download_url   = $this->get_release_zip_url($release);

        $info = new stdClass();
        $info->name           = 'Bongkar Canvas Builder';
        $info->slug           = $this->plugin_slug;
        $info->version        = $remote_version;
        $info->author         = '<a href="https://github.com/' . esc_attr($this->github_repo) . '">kadeksrd</a>';
        $info->homepage       = 'https://github.com/' . esc_attr($this->github_repo);
        $info->requires       = '5.8';
        $info->tested         = '6.7';
        $info->requires_php   = '7.4';
        $info->last_updated   = isset($release['published_at']) ? $release['published_at'] : '';
        $info->download_link  = $download_url;

        $changelog = !empty($release['body']) ? wp_kses_post($release['body']) : 'Rilis pembaruan performa dan fitur terbaru.';

        $info->sections = [
            'description' => 'Plugin visual page builder HTML-first ultra-ringan untuk WordPress.',
            'changelog'   => wpautop($changelog),
        ];

        return $info;
    }

    /**
     * Ensure correct folder name after download & unzip
     *
     * @param bool|WP_Error $response
     * @param array $hook_extra
     * @param array $result
     * @return array
     */
    public function after_install($response, $hook_extra, $result) {
        global $wp_filesystem;

        // Check if this install is for our plugin
        if (empty($hook_extra['plugin']) || $hook_extra['plugin'] !== $this->plugin_basename) {
            return $result;
        }

        $proper_destination = WP_PLUGIN_DIR . '/' . $this->plugin_slug;

        // If the extracted folder differs from bongkar-builder, rename it
        if (isset($result['destination']) && $result['destination'] !== $proper_destination) {
            $wp_filesystem->move($result['destination'], $proper_destination);
            $result['destination'] = $proper_destination;
        }

        return $result;
    }

    /**
     * Purge transient cache when update completes
     *
     * @param WP_Upgrader $upgrader
     * @param array $options
     */
    public function purge_cache($upgrader = null, $options = []) {
        delete_transient($this->transient_key);
    }

    /**
     * Find zip asset or fallback to zipball_url
     *
     * @param array $release
     * @return string
     */
    private function get_release_zip_url($release) {
        if (!empty($release['assets']) && is_array($release['assets'])) {
            foreach ($release['assets'] as $asset) {
                if (isset($asset['name']) && strtolower($asset['name']) === 'bongkar-builder.zip') {
                    if (!empty($asset['browser_download_url'])) {
                        return $asset['browser_download_url'];
                    }
                }
            }
        }

        // Fallback to GitHub generated zipball
        return !empty($release['zipball_url']) ? $release['zipball_url'] : '';
    }
}
