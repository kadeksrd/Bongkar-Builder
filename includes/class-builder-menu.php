<?php
/**
 * WordPress Dynamic Menu Integration for Bongkar Builder
 * Zero-bloat, responsive navigation walker & dynamic menu injector
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Bongkar_Builder_Menu')) {

class Bongkar_Builder_Menu {

    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Enqueue or register any frontend menu helper assets if needed
    }

    /**
     * Get list of all WordPress menus formatted for dropdowns
     */
    public static function get_menu_choices() {
        $menus = wp_get_nav_menus();
        $choices = [];
        foreach ($menus as $menu) {
            $choices[$menu->term_id] = $menu->name . ' (' . $menu->count . ' item)';
        }
        return $choices;
    }

    /**
     * Render WordPress Menu HTML using clean walker
     */
    public static function render_menu_html($menu_id = 0, $args = []) {
        if (!$menu_id) {
            return '';
        }

        $defaults = [
            'menu'            => $menu_id,
            'container'       => false,
            'menu_class'      => 'bongkar-menu-list',
            'menu_id'         => 'bongkar-menu-' . absint($menu_id),
            'echo'            => false,
            'fallback_cb'     => false,
            'walker'          => class_exists('Bongkar_Clean_Nav_Walker') ? new Bongkar_Clean_Nav_Walker() : '',
            'depth'           => 3
        ];

        $nav_args = wp_parse_args($args, $defaults);
        return wp_nav_menu($nav_args);
    }

    /**
     * Inject live WordPress menu into Header HTML markup
     * Automatically targets <nav data-bongkar-nav> or <nav> or <ul class="bongkar-menu-list">
     */
    public static function inject_dynamic_menu($header_html, $menu_id = 0) {
        if (!$menu_id || empty(trim($header_html))) {
            return $header_html;
        }

        $rendered_menu = self::render_menu_html($menu_id);
        if (empty($rendered_menu)) {
            return $header_html;
        }

        // 1. Target explicit placeholder <bongkar-menu> or <div data-bongkar-menu>
        if (stripos($header_html, '<bongkar-menu') !== false) {
            return preg_replace('/<bongkar-menu\b[^>]*>(.*?)<\/bongkar-menu>|<bongkar-menu\b[^>]*\/>/is', $rendered_menu, $header_html, 1);
        }

        // 2. Target <nav data-bongkar-nav="...">...</nav>
        if (preg_match('/<nav\b[^>]*data-bongkar-nav[^>]*>(.*?)<\/nav>/is', $header_html, $match)) {
            $nav_wrapper = $match[0];
            $new_nav = preg_replace('/<ul\b[^>]*>.*?<\/ul>/is', $rendered_menu, $nav_wrapper);
            if ($new_nav === $nav_wrapper) {
                // If there was no <ul> inside, wrap with nav
                $new_nav = preg_replace('/(>)(.*)(<\/nav>)/is', '$1' . $rendered_menu . '$3', $nav_wrapper);
            }
            return str_replace($nav_wrapper, $new_nav, $header_html);
        }

        // 3. Target <ul class="bongkar-menu-list">...</ul> or <ul class="menu">...</ul>
        if (preg_match('/<ul\b[^>]*class=["\'][^"\']*(?:bongkar-menu-list|nav-menu|main-menu)[^"\']*["\'][^>]*>.*?<\/ul>/is', $header_html, $match)) {
            return str_replace($match[0], $rendered_menu, $header_html);
        }

        // 4. Target the first <nav>...</nav> element
        if (preg_match('/<nav\b[^>]*>(.*?)<\/nav>/is', $header_html, $match)) {
            $nav_wrapper = $match[0];
            $new_nav = preg_replace('/<ul\b[^>]*>.*?<\/ul>/is', $rendered_menu, $nav_wrapper);
            if ($new_nav === $nav_wrapper) {
                $new_nav = preg_replace('/(>)(.*)(<\/nav>)/is', '$1' . $rendered_menu . '$3', $nav_wrapper);
            }
            return str_replace($nav_wrapper, $new_nav, $header_html);
        }

        return $header_html;
    }

    /**
     * Get lightweight client script for responsive mobile menu toggle
     */
    public static function get_mobile_nav_script() {
        return '<script id="bongkar-mobile-nav-engine">
(function() {
    function initMobileNav() {
        const toggleButtons = document.querySelectorAll(".bongkar-mobile-toggle, [data-bongkar-toggle=\"nav\"]");
        toggleButtons.forEach(function(btn) {
            if (btn.__bongkarNavBound) return;
            btn.__bongkarNavBound = true;

            btn.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();

                const header = btn.closest(".bongkar-header-root") || btn.closest("header") || document.body;
                const nav = header.querySelector(".bongkar-nav-container, nav[data-bongkar-nav], nav");
                const iconBars = btn.querySelector(".icon-bars, .fa-bars");
                const iconClose = btn.querySelector(".icon-close, .fa-xmark");

                if (!nav) return;

                const isOpen = nav.classList.toggle("active");
                btn.classList.toggle("active", isOpen);

                if (iconBars && iconClose) {
                    iconBars.style.display = isOpen ? "none" : "inline-block";
                    iconClose.style.display = isOpen ? "inline-block" : "none";
                }

                // Close on click outside
                if (isOpen) {
                    function closeOnClickOutside(evt) {
                        if (!nav.contains(evt.target) && !btn.contains(evt.target)) {
                            nav.classList.remove("active");
                            btn.classList.remove("active");
                            if (iconBars && iconClose) {
                                iconBars.style.display = "inline-block";
                                iconClose.style.display = "none";
                            }
                            document.removeEventListener("click", closeOnClickOutside);
                        }
                    }
                    setTimeout(function() {
                        document.addEventListener("click", closeOnClickOutside);
                    }, 50);
                }
            });
        });

        // Dropdown toggle for touch devices
        const dropdownParents = document.querySelectorAll(".bongkar-menu-list .menu-item-has-children > a");
        dropdownParents.forEach(function(link) {
            if (link.__bongkarDropdownBound) return;
            link.__bongkarDropdownBound = true;

            const arrow = link.querySelector(".sub-arrow");
            if (arrow) {
                arrow.addEventListener("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const li = link.closest(".menu-item-has-children");
                    if (li) li.classList.toggle("open-sub");
                });
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMobileNav);
    } else {
        initMobileNav();
    }
})();
</script>';
    }
}

} // End if !class_exists('Bongkar_Builder_Menu')

// Ensure WordPress Walker_Nav_Menu is loaded
if (!class_exists('Walker_Nav_Menu') && defined('ABSPATH') && defined('WPINC')) {
    $walker_file = ABSPATH . WPINC . '/class-walker-nav-menu.php';
    if (file_exists($walker_file)) {
        require_once $walker_file;
    }
}

/**
 * Clean Walker for WordPress Navigation Menus
 * Strips bloat CSS IDs and unneeded classes, adds Font Awesome sub-arrows
 */
if (class_exists('Walker_Nav_Menu') && !class_exists('Bongkar_Clean_Nav_Walker')) {
    class Bongkar_Clean_Nav_Walker extends Walker_Nav_Menu {

        public function start_lvl(&$output, $depth = 0, $args = null) {
            $indent = str_repeat("\t", $depth);
            $output .= "\n$indent<ul class=\"sub-menu depth-$depth\">\n";
        }

        public function end_lvl(&$output, $depth = 0, $args = null) {
            $indent = str_repeat("\t", $depth);
            $output .= "$indent</ul>\n";
        }

        public function start_el(&$output, $item, $depth = 0, $args = null, $id = 0) {
            $indent = ($depth) ? str_repeat("\t", $depth) : '';

            $classes = empty($item->classes) ? [] : (array) $item->classes;
            $class_names = [];

            // Retain only essential classes
            if (in_array('current-menu-item', $classes) || in_array('current_page_item', $classes)) {
                $class_names[] = 'active current-menu-item';
            }
            if (in_array('menu-item-has-children', $classes)) {
                $class_names[] = 'menu-item-has-children';
            }
            $class_names[] = 'menu-item menu-item-' . $item->ID;

            $class_str = join(' ', array_filter($class_names));
            $output .= $indent . '<li class="' . esc_attr($class_str) . '">';

            $atts = [];
            $atts['title']  = !empty($item->attr_title) ? $item->attr_title : '';
            $atts['target'] = !empty($item->target) ? $item->target : '';
            $atts['rel']    = !empty($item->xfn) ? $item->xfn : '';
            $atts['href']   = !empty($item->url) ? $item->url : '';

            $atts = apply_filters('nav_menu_link_attributes', $atts, $item, $args, $depth);
            $attributes = '';
            foreach ($atts as $attr => $value) {
                if (!empty($value)) {
                    $attributes .= ' ' . $attr . '="' . esc_attr($value) . '"';
                }
            }

            $title = apply_filters('the_title', $item->title, $item->ID);
            $has_children = in_array('menu-item-has-children', $classes);

            $item_output = (isset($args->before) ? $args->before : '');
            $item_output .= '<a' . $attributes . '>';
            $item_output .= (isset($args->link_before) ? $args->link_before : '');
            $item_output .= $title;
            $item_output .= (isset($args->link_after) ? $args->link_after : '');

            // Add sub-menu chevron icon (Font Awesome 6) if it has children
            if ($has_children) {
                $item_output .= ' <i class="fa-solid fa-chevron-down sub-arrow" style="font-size: 10px; margin-left: 4px; vertical-align: middle;"></i>';
            }

            $item_output .= '</a>';
            $item_output .= (isset($args->after) ? $args->after : '');

            $output .= apply_filters('walker_nav_menu_start_el', $item_output, $item, $depth, $args);
        }

        public function end_el(&$output, $item, $depth = 0, $args = null) {
            $output .= "</li>\n";
        }
    }
}
