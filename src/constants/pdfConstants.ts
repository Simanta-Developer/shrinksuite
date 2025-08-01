/** Input filename inside WASM's virtual FS */
export const PDF_INPUT_FILENAME = 'input.pdf';

/** Output filename prefix inside WASM's virtual FS */
export const PDF_OUTPUT_FILENAME_PREFIX = 'output_';

/** Target PDF compatibility level */
export const PDF_COMPATIBILITY_LEVEL = '1.4';

/** Ghostscript quiet mode flags */
export const GHOSTSCRIPT_QUIET_FLAGS = ['-dNOPAUSE', '-dQUIET', '-dBATCH'] as const;

/** Ghostscript device for PDF output */
export const PDF_DEVICE = '-sDEVICE=pdfwrite';

/** Supported PDF quality levels ordered from lowest to highest */
export const PDF_QUALITY_LEVELS = ['screen', 'ebook', 'printer', 'prepress'] as const;
export type PdfQuality = typeof PDF_QUALITY_LEVELS[number];
