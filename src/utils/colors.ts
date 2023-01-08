// Color swatch for item colors
export const colors = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#ffeb3b',
    '#ffc107',
    '#ff9800',
    '#ff5722',
    '#795548',
    '#607d8b',
]

/**
 * Converts a hex color string into a rgb() color string
 * 
 * @param {string}hex Hex color
 * @returns {string} 
 */
const hexToRgb = (hex: string) => {
    let m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
    if (!m) return null
    return {
        r: parseInt(m[1], 16),
        g: parseInt(m[2], 16),
        b: parseInt(m[3], 16),
    }
}

/**
 * Determines a readable text color based on the supplied background color  
 * 
 * @param {string}hex Hex background color string
 * @returns {string} Either black or white as a hex color string
 */
export const getReadableTextColor = (hex: string) => {
    const inputRgb = hexToRgb(hex)
    if (!inputRgb) return ''
    let colors = `rgb(${inputRgb.r}, ${inputRgb.g}, ${inputRgb.b})`.match(
        /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/
    )

    if (!colors) return ''
    let brightness = 1

    let r = colors[1]
    let g = colors[2]
    let b = colors[3]

    let or = Math.floor((255 - Number(r)) * brightness)
    let og = Math.floor((255 - Number(g)) * brightness)
    let ob = Math.floor((255 - Number(b)) * brightness)
    const colorIntensity = or * 0.299 + og * 0.587 + ob * 0.114
    return colorIntensity > 80 ? '#fff' : '#000'
}
