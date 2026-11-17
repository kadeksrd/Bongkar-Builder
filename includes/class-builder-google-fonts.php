<?php
/**
 * Google Fonts Registry and Generator
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('Bongkar_Builder_Google_Fonts')) {

class Bongkar_Builder_Google_Fonts {

    /**
     * Top curated Google Fonts list with category and weights
     */
    public static function get_popular_fonts() {
        return [
            ['name' => 'Inter', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700,800'],
            ['name' => 'Poppins', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700,800'],
            ['name' => 'Plus Jakarta Sans', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700,800'],
            ['name' => 'Roboto', 'category' => 'sans-serif', 'weights' => '300,400,500,700,900'],
            ['name' => 'Montserrat', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700,800'],
            ['name' => 'Outfit', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700,800'],
            ['name' => 'Open Sans', 'category' => 'sans-serif', 'weights' => '300,400,600,700'],
            ['name' => 'Lato', 'category' => 'sans-serif', 'weights' => '300,400,700,900'],
            ['name' => 'Playfair Display', 'category' => 'serif', 'weights' => '400,500,600,700,800'],
            ['name' => 'Oswald', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700'],
            ['name' => 'Raleway', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700,800'],
            ['name' => 'Nunito', 'category' => 'sans-serif', 'weights' => '300,400,600,700,800'],
            ['name' => 'Rubik', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700'],
            ['name' => 'DM Sans', 'category' => 'sans-serif', 'weights' => '400,500,700'],
            ['name' => 'Syne', 'category' => 'sans-serif', 'weights' => '400,500,600,700,800'],
            ['name' => 'Urbanist', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700,800'],
            ['name' => 'Work Sans', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700'],
            ['name' => 'Manrope', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700,800'],
            ['name' => 'Space Grotesk', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700'],
            ['name' => 'Merriweather', 'category' => 'serif', 'weights' => '300,400,700,900'],
            ['name' => 'Lora', 'category' => 'serif', 'weights' => '400,500,600,700'],
            ['name' => 'Cinzel', 'category' => 'serif', 'weights' => '400,600,700,800'],
            ['name' => 'Cormorant Garamond', 'category' => 'serif', 'weights' => '400,500,600,700'],
            ['name' => 'Bebas Neue', 'category' => 'display', 'weights' => '400'],
            ['name' => 'Barlow', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700'],
            ['name' => 'Cabin', 'category' => 'sans-serif', 'weights' => '400,500,600,700'],
            ['name' => 'Fira Sans', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700'],
            ['name' => 'Kanit', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700'],
            ['name' => 'Quicksand', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700'],
            ['name' => 'Josefin Sans', 'category' => 'sans-serif', 'weights' => '300,400,600,700'],
            ['name' => 'Figtree', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700,800'],
            ['name' => 'Sora', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700'],
            ['name' => 'Lexend', 'category' => 'sans-serif', 'weights' => '300,400,500,600,700'],
            ['name' => 'Clash Display', 'category' => 'display', 'weights' => '400,500,600,700'],
            ['name' => 'Cabinet Grotesk', 'category' => 'sans-serif', 'weights' => '400,500,700,800'],
        ];
    }

    /**
     * Generate Google Fonts API URL for given font names
     *
     * @param array $font_names Array of font names like ['Poppins', 'Inter']
     * @return string URL or empty string
     */
    public static function build_fonts_url($font_names = []) {
        if (empty($font_names)) {
            return '';
        }

        $font_queries = [];
        $unique_fonts = array_unique(array_filter(array_map('trim', (array)$font_names)));

        foreach ($unique_fonts as $font) {
            if (empty($font) || in_array(strtolower($font), ['inherit', 'sans-serif', 'serif', 'monospace', 'system-ui'])) {
                continue;
            }
            $formatted_name = str_replace(' ', '+', $font);
            $font_queries[] = 'family=' . $formatted_name . ':wght@300;400;500;600;700;800;900';
        }

        if (empty($font_queries)) {
            return '';
        }

        return 'https://fonts.googleapis.com/css2?' . implode('&', $font_queries) . '&display=swap';
    }
}

} // End if !class_exists('Bongkar_Builder_Google_Fonts')
